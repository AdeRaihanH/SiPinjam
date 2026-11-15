import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../lib/errors.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (!/^Bearer$/i.test(scheme || '') || !token) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Token autentikasi diperlukan'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new Error('sub tidak valid');
    }
    req.auth = { id: payload.sub, role: payload.role || 'praktikan' };
    return next();
  } catch {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Sesi tidak valid atau sudah kedaluwarsa'));
  }
}
