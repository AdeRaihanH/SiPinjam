const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('../lib/http');

function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (!/^Bearer$/i.test(scheme || '') || !token) return null;
  return token;
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) throw new Error('sub tidak valid');
    return { id, role: payload.role || 'peminjam' };
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Sesi Anda tidak valid atau sudah kedaluwarsa');
  }
}

function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(new ApiError(401, 'UNAUTHORIZED', 'Token autentikasi diperlukan'));
  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = null;
    }
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
