const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../lib/http');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.nama, c.slug, c.icon,
            COUNT(t.id) AS jumlah_alat,
            COALESCE(SUM(t.stok_total), 0) AS total_unit
     FROM categories c
     LEFT JOIN tools t ON t.category_id = c.id
     GROUP BY c.id, c.nama, c.slug, c.icon
     ORDER BY c.id ASC`,
  );

  res.json({
    data: rows.map((row) => ({
      ...row,
      jumlah_alat: Number(row.jumlah_alat),
      total_unit: Number(row.total_unit),
    })),
  });
}));

module.exports = router;
