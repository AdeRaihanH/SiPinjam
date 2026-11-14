const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const config = require('../config');
const { ApiError, asyncHandler } = require('../lib/http');
const { validate } = require('../lib/validate');
const { requireAuth } = require('../middleware/auth');
const { todayISO, diffDaysISO } = require('../lib/dates');
const { serializeNotification } = require('../lib/serializers');

const router = express.Router();

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Notifikasi keterlambatan dibuat saat pengguna membuka daftar notifikasi,
 * bukan oleh cron. Hasilnya tetap satu baris per pinjaman: kalau sudah ada,
 * tidak dibuat lagi.
 */
async function pastikanNotifikasiTerlambat(userId) {
  const today = todayISO();
  const [lateLoans] = await pool.query(
    `SELECT id, kode, tanggal_kembali_rencana
     FROM loans
     WHERE user_id = ? AND status = 'dipinjam' AND tanggal_kembali_rencana < ?`,
    [userId, today],
  );

  if (!lateLoans.length) return;

  const ids = lateLoans.map((loan) => loan.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [existing] = await pool.query(
    `SELECT ref_id FROM notifications
     WHERE user_id = ? AND tipe = 'terlambat' AND ref_type = 'loan'
       AND ref_id IN (${placeholders})`,
    [userId, ...ids],
  );
  const sudahAda = new Set(existing.map((row) => Number(row.ref_id)));

  const rows = lateLoans
    .filter((loan) => !sudahAda.has(Number(loan.id)))
    .map((loan) => {
      const hari = diffDaysISO(loan.tanggal_kembali_rencana, today);
      const denda = hari * config.dendaPerHari;
      return {
        loanId: loan.id,
        pesan: `Pinjaman ${loan.kode} terlambat ${hari} hari. Denda berjalan Rp${denda.toLocaleString('id-ID')}. Segera kembalikan alat ke laboratorium.`,
      };
    });

  for (const row of rows) {
    await pool.query(
      `INSERT INTO notifications
         (user_id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca)
       VALUES (?, 'terlambat', 'Pinjaman terlambat', ?, 'loan', ?, NOW(), 0)`,
      [userId, row.pesan, row.loanId],
    );
  }
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const query = validate(listSchema, req.query);
  await pastikanNotifikasiTerlambat(req.user.id);

  const [rows] = await pool.query(
    `SELECT id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca, created_at
     FROM notifications
     WHERE user_id = ? AND show_at <= NOW()
     ORDER BY dibaca ASC, show_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, query.limit, query.offset],
  );

  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN dibaca = 0 THEN 1 ELSE 0 END), 0) AS belum_dibaca
     FROM notifications
     WHERE user_id = ? AND show_at <= NOW()`,
    [req.user.id],
  );

  res.json({
    data: rows.map(serializeNotification),
    meta: {
      total: Number(countRow.total),
      belum_dibaca: Number(countRow.belum_dibaca),
      limit: query.limit,
      offset: query.offset,
    },
  });
}));

router.patch('/read-all', requireAuth, asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    `UPDATE notifications SET dibaca = 1
     WHERE user_id = ? AND dibaca = 0 AND show_at <= NOW()`,
    [req.user.id],
  );

  res.json({ data: { diubah: Number(result.affectedRows) } });
}));

router.patch('/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'ID notifikasi tidak valid');
  }

  const [rows] = await pool.query(
    'SELECT id, user_id FROM notifications WHERE id = ? LIMIT 1',
    [id],
  );

  if (!rows.length) throw new ApiError(404, 'NOT_FOUND', 'Notifikasi tidak ditemukan');
  if (rows[0].user_id !== req.user.id) {
    throw new ApiError(403, 'FORBIDDEN', 'Anda tidak berhak mengubah notifikasi ini');
  }

  await pool.query('UPDATE notifications SET dibaca = 1 WHERE id = ?', [id]);

  res.json({ data: { id, dibaca: true } });
}));

module.exports = router;
