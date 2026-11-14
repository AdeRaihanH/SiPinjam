const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const { ApiError, asyncHandler } = require('../lib/http');
const { validate } = require('../lib/validate');
const { optionalAuth } = require('../middleware/auth');
const { parseScanCode } = require('../lib/loans');

const router = express.Router();

const FROM_TOOLS = `
  FROM tools t
  JOIN categories c ON c.id = t.category_id
  LEFT JOIN (
    SELECT li.tool_id, SUM(li.jumlah) AS jumlah
    FROM loan_items li
    JOIN loans l ON l.id = li.loan_id
    WHERE l.status = 'dipinjam'
    GROUP BY li.tool_id
  ) a ON a.tool_id = t.id
`;

const TOOL_FIELDS = `
  t.id, t.kode, t.nama, t.deskripsi, t.stok_total, t.kondisi, t.foto_url,
  c.id AS kategori_id, c.nama AS kategori_nama,
  c.slug AS kategori_slug, c.icon AS kategori_icon,
  GREATEST(t.stok_total - COALESCE(a.jumlah, 0), 0) AS stok_tersedia
`;

const listSchema = z.object({
  search: z.string().trim().max(100).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  tersedia: z.enum(['0', '1', 'true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

function buildFilters(query) {
  const filters = [];
  const params = [];

  if (query.search) {
    filters.push('(t.nama LIKE ? OR t.kode LIKE ? OR c.nama LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }
  if (query.category_id) {
    filters.push('t.category_id = ?');
    params.push(query.category_id);
  }
  if (query.tersedia === '1' || query.tersedia === 'true') {
    filters.push('(t.stok_total - COALESCE(a.jumlah, 0)) > 0');
  }

  return {
    where: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    params,
  };
}

function normalizeTool(row) {
  return {
    ...row,
    stok_total: Number(row.stok_total),
    stok_tersedia: Number(row.stok_tersedia),
    dipinjam_oleh_saya: row.dipinjam_oleh_saya != null
      ? Boolean(Number(row.dipinjam_oleh_saya))
      : undefined,
  };
}

async function findTool({ id, kode, userId }) {
  const filter = id ? 't.id = ?' : 't.kode = ?';
  const params = [userId || 0, id || kode];

  const [rows] = await pool.query(
    `SELECT ${TOOL_FIELDS},
       EXISTS(
         SELECT 1 FROM loans l2
         JOIN loan_items li2 ON li2.loan_id = l2.id
         WHERE li2.tool_id = t.id AND l2.user_id = ? AND l2.status = 'dipinjam'
       ) AS dipinjam_oleh_saya
     ${FROM_TOOLS}
     WHERE ${filter}
     LIMIT 1`,
    params,
  );

  if (!rows.length) return null;
  return normalizeTool(rows[0]);
}

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const query = validate(listSchema, req.query);
  const { where, params } = buildFilters(query);

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total ${FROM_TOOLS} ${where}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT ${TOOL_FIELDS}
     ${FROM_TOOLS}
     ${where}
     ORDER BY t.nama ASC
     LIMIT ? OFFSET ?`,
    [...params, query.limit, query.offset],
  );

  res.json({
    data: rows.map(normalizeTool),
    meta: {
      total: Number(countRows[0].total),
      limit: query.limit,
      offset: query.offset,
      has_more: query.offset + rows.length < Number(countRows[0].total),
    },
  });
}));

router.get('/kode/:kode', optionalAuth, asyncHandler(async (req, res) => {
  const kode = parseScanCode(req.params.kode, 'tool');
  if (!kode) {
    throw new ApiError(400, 'INVALID_CODE', 'Kode QR alat tidak dikenali');
  }

  const tool = await findTool({ kode, userId: req.user?.id });
  if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

  res.json({ data: tool });
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'ID alat tidak valid');
  }

  const tool = await findTool({ id, userId: req.user?.id });
  if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

  res.json({ data: tool });
}));

module.exports = router;
