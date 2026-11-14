const express = require('express');
const cors = require('cors');
const config = require('./config');
const { pool } = require('./db');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const toolRoutes = require('./routes/tools');
const loanRoutes = require('./routes/loans');
const notificationRoutes = require('./routes/notifications');
const statsRoutes = require('./routes/stats');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((item) => item.trim()),
}));
app.use(express.json({ limit: '100kb' }));

if (!config.isProduction) {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
}

app.get('/', (_req, res) => {
  res.json({
    data: {
      name: 'SiPinjam API',
      version: '1.0.0',
      description: 'REST API peminjaman alat laboratorium',
      docs: '/api/v1',
    },
  });
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      data: {
        status: 'ok',
        database: 'connected',
        time: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Database tidak dapat diakses' },
    });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tools', toolRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
