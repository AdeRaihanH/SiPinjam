const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { pool } = require('../db');
const config = require('../config');
const { ApiError, asyncHandler } = require('../lib/http');
const { validate } = require('../lib/validate');
const { requireAuth } = require('../middleware/auth');
const { serializeUser } = require('../lib/serializers');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(100),
});

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = validate(loginSchema, req.body);

  const [rows] = await pool.query(
    `SELECT id, nama, nim, email, password_hash, role, avatar_url
     FROM users WHERE email = ? LIMIT 1`,
    [email],
  );

  const user = rows[0];
  const cocok = user ? await bcrypt.compare(password, user.password_hash) : false;

  if (!cocok) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Email atau kata sandi salah');
  }

  const token = jwt.sign(
    { sub: String(user.id), role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );

  res.json({
    data: {
      token,
      expires_in: 7 * 24 * 60 * 60,
      user: serializeUser(user),
    },
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nama, nim, email, role, avatar_url
     FROM users WHERE id = ? LIMIT 1`,
    [req.user.id],
  );

  if (!rows.length) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Akun tidak ditemukan');
  }

  res.json({ data: { user: serializeUser(rows[0]) } });
}));

module.exports = router;
