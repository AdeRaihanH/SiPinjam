const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const config = require('../config');
const { asyncHandler } = require('../lib/http');
const { validate } = require('../lib/validate');
const { requireAuth } = require('../middleware/auth');
const { todayISO } = require('../lib/dates');

const router = express.Router();

router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
  const today = todayISO();

  const [[loanStats]] = await pool.query(
    `SELECT
       COUNT(*) AS total_pinjaman,
       COALESCE(SUM(CASE WHEN status = 'dipinjam' THEN 1 ELSE 0 END), 0) AS aktif,
       COALESCE(SUM(CASE WHEN status = 'dipinjam' AND tanggal_kembali_rencana < ? THEN 1 ELSE 0 END), 0) AS terlambat,
       COALESCE(SUM(CASE WHEN status = 'dikembalikan' THEN 1 ELSE 0 END), 0) AS selesai,
       COALESCE(SUM(CASE WHEN status = 'dikembalikan' THEN denda ELSE 0 END), 0) AS total_denda,
       COALESCE(SUM(
         CASE WHEN status = 'dipinjam' AND tanggal_kembali_rencana < ?
           THEN DATEDIFF(?, tanggal_kembali_rencana) * ?
           ELSE 0 END
       ), 0) AS denda_berjalan
     FROM loans
     WHERE user_id = ?`,
    [today, today, today, config.dendaPerHari, req.user.id],
  );

  const [[toolStats]] = await pool.query(
    `SELECT
       COUNT(*) AS total_judul,
       COALESCE(SUM(t.stok_total), 0) AS total_unit,
       COALESCE(SUM(t.stok_total - COALESCE(a.jumlah, 0)), 0) AS tersedia_unit
     FROM tools t
     LEFT JOIN (
       SELECT li.tool_id, SUM(li.jumlah) AS jumlah
       FROM loan_items li
       JOIN loans l ON l.id = li.loan_id
       WHERE l.status = 'dipinjam'
       GROUP BY li.tool_id
     ) a ON a.tool_id = t.id`,
  );

  const [[notificationStats]] = await pool.query(
    `SELECT COUNT(*) AS belum_dibaca
     FROM notifications
     WHERE user_id = ? AND dibaca = 0 AND show_at <= NOW()`,
    [req.user.id],
  );

  const totalUnit = Number(toolStats.total_unit);
  const tersediaUnit = Number(toolStats.tersedia_unit);

  res.json({
    data: {
      total_pinjaman: Number(loanStats.total_pinjaman),
      aktif: Number(loanStats.aktif),
      terlambat: Number(loanStats.terlambat),
      selesai: Number(loanStats.selesai),
      total_denda: Number(loanStats.total_denda),
      denda_berjalan: Number(loanStats.denda_berjalan),
      alat: {
        total_judul: Number(toolStats.total_judul),
        total_unit: totalUnit,
        tersedia_unit: tersediaUnit,
        dipinjam_unit: Math.max(0, totalUnit - tersediaUnit),
      },
      notifikasi_belum_dibaca: Number(notificationStats.belum_dibaca),
      denda_per_hari: config.dendaPerHari,
    },
  });
}));

const populerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

router.get('/populer', asyncHandler(async (req, res) => {
  const { limit } = validate(populerSchema, req.query);

  const [rows] = await pool.query(
    `SELECT t.id, t.kode, t.nama, t.kondisi,
            c.nama AS kategori_nama, c.slug AS kategori_slug, c.icon AS kategori_icon,
            COALESCE(SUM(li.jumlah), 0) AS total_dipinjam
     FROM loan_items li
     JOIN loans l ON l.id = li.loan_id
     JOIN tools t ON t.id = li.tool_id
     JOIN categories c ON c.id = t.category_id
     GROUP BY t.id, t.kode, t.nama, t.kondisi, c.nama, c.slug, c.icon
     ORDER BY total_dipinjam DESC, t.nama ASC
     LIMIT ?`,
    [limit],
  );

  res.json({
    data: rows.map((row) => ({
      ...row,
      total_dipinjam: Number(row.total_dipinjam),
    })),
  });
}));

module.exports = router;
