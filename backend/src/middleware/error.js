import { env } from '../config/env.js';
import { ApiError } from '../lib/errors.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Body request bukan JSON yang valid' },
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Data yang sama sudah ada' },
    });
  }

  if (error.code === 'PGRST116') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan' },
    });
  }

  if (!env.isProduction) {
    console.error('[sipinjam] error tak tertangani:', error);
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server' },
  });
}
