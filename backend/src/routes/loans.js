const express = require('express');
const { z } = require('zod');
const { pool, withTransaction } = require('../db');
const config = require('../config');
const { ApiError, asyncHandler } = require('../lib/http');
const { validate } = require('../lib/validate');
const { requireAuth } = require('../middleware/auth');
const { addDaysISO, formatTanggal, todayISO } = require('../lib/dates');
const { buatKodePinjam, hitungDenda, parseScanCode } = require('../lib/loans');
const { serializeLoan } = require('../lib/serializers');
const { getLoanDetail } = require('../lib/loanQueries');

const router = express.Router();

const listSchema = z.object({
  status: z.enum(['semua', 'berjalan', 'aktif', 'terlambat', 'selesai']).default('semua'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const createSchema = z.object({
  items: z.array(
    z.object({
      tool_id: z.coerce.number().int().positive('ID alat tidak valid'),
      jumlah: z.coerce.number().int().min(1, 'Jumlah minimal 1').max(99, 'Jumlah maksimal 99'),
    }),
  ).min(1, 'Pilih minimal satu alat').max(config.maxItemPerPinjaman, `Maksimal ${config.maxItemPerPinjaman} alat per pinjaman`),
  durasi_hari: z.coerce.number().int().min(1, 'Durasi minimal 1 hari').max(config.maxDurasiHari, `Durasi maksimal ${config.maxDurasiHari} hari`),
  catatan: z.string().trim().max(255, 'Catatan maksimal 255 karakter').optional()
    .transform((value) => value || undefined),
}).superRefine((value, ctx) => {
  const ids = value.items.map((item) => item.tool_id);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alat yang sama tidak boleh dipilih dua kali' });
  }
});

function statusFilter(status, today) {
  switch (status) {
    case 'berjalan':
      return { sql: "AND l.status = 'dipinjam'", params: [] };
    case 'aktif':
      return {
        sql: "AND l.status = 'dipinjam' AND l.tanggal_kembali_rencana >= ?",
        params: [today],
      };
    case 'terlambat':
      return {
        sql: "AND l.status = 'dipinjam' AND l.tanggal_kembali_rencana < ?",
        params: [today],
      };
    case 'selesai':
      return { sql: "AND l.status = 'dikembalikan'", params: [] };
    default:
      return { sql: '', params: [] };
  }
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const query = validate(listSchema, req.query);
  const today = todayISO();
  const filter = statusFilter(query.status, today);

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM loans l WHERE l.user_id = ? ${filter.sql}`,
    [req.user.id, ...filter.params],
  );

  const [rows] = await pool.query(
    `SELECT l.id, l.kode, l.status, l.tanggal_pinjam,
            l.tanggal_kembali_rencana, l.tanggal_kembali_aktual,
            l.denda, l.catatan, l.created_at,
            COUNT(li.id) AS jumlah_item,
            COALESCE(SUM(li.jumlah), 0) AS total_unit,
            GROUP_CONCAT(CONCAT(t.nama, ' ×', li.jumlah) ORDER BY t.nama SEPARATOR ', ') AS ringkasan_alat,
            MAX(c.icon) AS kategori_icon,
            MAX(c.slug) AS kategori_slug,
            MAX(c.nama) AS kategori_nama
     FROM loans l
     LEFT JOIN loan_items li ON li.loan_id = l.id
     LEFT JOIN tools t ON t.id = li.tool_id
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE l.user_id = ? ${filter.sql}
     GROUP BY l.id
     ORDER BY l.created_at DESC, l.id DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, ...filter.params, query.limit, query.offset],
  );

  const total = Number(countRows[0].total);

  res.json({
    data: rows.map((row) => serializeLoan(row, [], today)),
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
      has_more: query.offset + rows.length < total,
    },
  });
}));

router.get('/kode/:kode', requireAuth, asyncHandler(async (req, res) => {
  const kode = parseScanCode(req.params.kode, 'loan');
  if (!kode) {
    throw new ApiError(400, 'INVALID_CODE', 'Kode QR pinjaman tidak dikenali');
  }

  const [rows] = await pool.query(
    'SELECT id FROM loans WHERE kode = ? LIMIT 1',
    [kode],
  );

  if (!rows.length) throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');

  const detail = await getLoanDetail(pool, rows[0].id, req.user);
  res.json({ data: detail });
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'ID pinjaman tidak valid');
  }

  const detail = await getLoanDetail(pool, id, req.user);
  res.json({ data: detail });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const body = validate(createSchema, req.body);
  const today = todayISO();
  const dueDate = addDaysISO(today, body.durasi_hari);

  const detail = await withTransaction(async (connection) => {
    const [overdueRows] = await connection.query(
      `SELECT COUNT(*) AS jumlah
       FROM loans
       WHERE user_id = ? AND status = 'dipinjam' AND tanggal_kembali_rencana < ?`,
      [req.user.id, today],
    );

    if (Number(overdueRows[0].jumlah) > 0) {
      throw new ApiError(
        409,
        'PINJAMAN_TERLAMBAT',
        'Selesaikan pinjaman yang terlambat terlebih dahulu sebelum meminjam lagi',
      );
    }

    const toolIds = body.items.map((item) => item.tool_id);
    const placeholders = toolIds.map(() => '?').join(', ');

    // Kunci baris alat supaya dua permintaan bersamaan tidak bisa meminjam
    // unit terakhir di waktu yang sama.
    const [tools] = await connection.query(
      `SELECT t.id, t.kode, t.nama, t.stok_total,
              COALESCE((
                SELECT SUM(li.jumlah)
                FROM loan_items li
                JOIN loans l ON l.id = li.loan_id
                WHERE li.tool_id = t.id AND l.status = 'dipinjam'
              ), 0) AS stok_terpakai
       FROM tools t
       WHERE t.id IN (${placeholders})
       FOR UPDATE`,
      toolIds,
    );

    if (tools.length !== toolIds.length) {
      throw new ApiError(404, 'NOT_FOUND', 'Salah satu alat tidak ditemukan');
    }

    const toolById = new Map(tools.map((tool) => [Number(tool.id), tool]));
    const kekurangan = [];

    for (const item of body.items) {
      const tool = toolById.get(item.tool_id);
      const tersedia = Number(tool.stok_total) - Number(tool.stok_terpakai);
      if (item.jumlah > tersedia) {
        kekurangan.push({
          tool_id: item.tool_id,
          nama: tool.nama,
          diminta: item.jumlah,
          tersedia: Math.max(0, tersedia),
        });
      }
    }

    if (kekurangan.length) {
      const pesan = kekurangan
        .map((item) => `${item.nama} tersisa ${item.tersedia}`)
        .join('; ');
      throw new ApiError(409, 'STOK_TIDAK_CUKUP', `Stok tidak mencukupi: ${pesan}`, kekurangan);
    }

    const [activeRows] = await connection.query(
      `SELECT DISTINCT t.nama
       FROM loan_items li
       JOIN loans l ON l.id = li.loan_id
       JOIN tools t ON t.id = li.tool_id
       WHERE l.user_id = ? AND l.status = 'dipinjam'
         AND li.tool_id IN (${placeholders})`,
      [req.user.id, ...toolIds],
    );

    if (activeRows.length) {
      const nama = activeRows.map((row) => row.nama).join(', ');
      throw new ApiError(
        409,
        'SUDAH_DIPINJAM',
        `${nama} masih ada di pinjaman aktif Anda dan belum dikembalikan`,
      );
    }

    const prefix = `PJM-${today.slice(2).replace(/-/g, '')}-`;
    const [lastRows] = await connection.query(
      'SELECT kode FROM loans WHERE kode LIKE ? ORDER BY kode DESC LIMIT 1 FOR UPDATE',
      [`${prefix}%`],
    );
    const urutan = lastRows.length
      ? Number(lastRows[0].kode.slice(prefix.length)) + 1
      : 1;
    const kode = buatKodePinjam(today, urutan);

    const [insertResult] = await connection.query(
      `INSERT INTO loans
         (kode, user_id, tanggal_pinjam, tanggal_kembali_rencana, status, denda, catatan)
       VALUES (?, ?, ?, ?, 'dipinjam', 0, ?)`,
      [kode, req.user.id, today, dueDate, body.catatan || null],
    );
    const loanId = insertResult.insertId;

    for (const item of body.items) {
      await connection.query(
        'INSERT INTO loan_items (loan_id, tool_id, jumlah) VALUES (?, ?, ?)',
        [loanId, item.tool_id, item.jumlah],
      );
    }

    const ringkasan = body.items
      .map((item) => `${toolById.get(item.tool_id).nama} ×${item.jumlah}`)
      .join(', ');

    const notifikasi = [
      [
        req.user.id,
        'sistem',
        'Pinjaman berhasil dibuat',
        `${kode} berhasil dibuat. Tunjukkan QR pinjaman saat mengambil alat di laboratorium.`,
        'loan',
        loanId,
        `${today} 00:00:00`,
        0,
      ],
      [
        req.user.id,
        'jatuh_tempo',
        'Pengingat pengembalian',
        `${ringkasan} harus dikembalikan besok (${formatTanggal(dueDate)}). Kode pinjaman ${kode}.`,
        'loan',
        loanId,
        `${addDaysISO(dueDate, -1)} 08:00:00`,
        0,
      ],
      [
        req.user.id,
        'jatuh_tempo',
        'Jatuh tempo hari ini',
        `${ringkasan} jatuh tempo hari ini (${formatTanggal(dueDate)}). Kembalikan sebelum laboratorium tutup.`,
        'loan',
        loanId,
        `${dueDate} 08:00:00`,
        0,
      ],
    ];

    await connection.query(
      `INSERT INTO notifications
         (user_id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca)
       VALUES ?`,
      [notifikasi],
    );

    return getLoanDetail(connection, loanId, req.user);
  });

  res.status(201).json({ data: detail });
}));

router.post('/:id/return', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'ID pinjaman tidak valid');
  }

  const detail = await withTransaction(async (connection) => {
    const [rows] = await connection.query(
      'SELECT * FROM loans WHERE id = ? LIMIT 1 FOR UPDATE',
      [id],
    );

    if (!rows.length) throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');

    const loan = rows[0];
    const isAdmin = req.user.role === 'admin';
    if (loan.user_id !== req.user.id && !isAdmin) {
      throw new ApiError(403, 'FORBIDDEN', 'Anda tidak berhak mengubah pinjaman ini');
    }
    if (loan.status === 'dikembalikan') {
      throw new ApiError(409, 'SUDAH_DIKEMBALIKAN', 'Pinjaman ini sudah dikembalikan');
    }

    const today = todayISO();
    const denda = hitungDenda(loan.tanggal_kembali_rencana, today);

    await connection.query(
      `UPDATE loans
       SET status = 'dikembalikan', tanggal_kembali_aktual = ?, denda = ?
       WHERE id = ?`,
      [today, denda, id],
    );

    const pesan = denda > 0
      ? `${loan.kode} dikembalikan pada ${formatTanggal(today)}. Denda keterlambatan Rp${denda.toLocaleString('id-ID')} dicatat.`
      : `${loan.kode} dikembalikan pada ${formatTanggal(today)} tepat waktu. Terima kasih!`;

    await connection.query(
      `INSERT INTO notifications
         (user_id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca)
       VALUES (?, 'pengembalian', 'Pengembalian diterima', ?, 'loan', ?, NOW(), 0)`,
      [loan.user_id, pesan, loan.id],
    );

    await connection.query(
      `UPDATE notifications SET dibaca = 1
       WHERE user_id = ? AND ref_type = 'loan' AND ref_id = ?
         AND tipe IN ('jatuh_tempo', 'terlambat')`,
      [loan.user_id, loan.id],
    );

    return getLoanDetail(connection, id, req.user);
  });

  res.json({ data: detail });
}));

module.exports = router;
