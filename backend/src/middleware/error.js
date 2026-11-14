const { ApiError } = require('../lib/http');
const config = require('../config');

function notFound(req, _res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Body request bukan JSON yang valid' },
    });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Data yang sama sudah ada' },
    });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Database sedang tidak dapat diakses' },
    });
  }

  if (!config.isProduction) {
    console.error('[sipinjam] error tak tertangani:', error);
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan pada server',
    },
  });
}

module.exports = { notFound, errorHandler };
