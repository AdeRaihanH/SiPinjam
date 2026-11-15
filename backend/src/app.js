import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { env } from './config/env.js';
import { createAuthController } from './controllers/authController.js';
import { createCategoryController } from './controllers/categoryController.js';
import { createLoanController } from './controllers/loanController.js';
import { createNotificationController } from './controllers/notificationController.js';
import { createStatsController } from './controllers/statsController.js';
import { createToolController } from './controllers/toolController.js';
import { asyncHandler } from './lib/errors.js';
import { errorHandler, notFound } from './middleware/error.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createCategoryRoutes } from './routes/categoryRoutes.js';
import { createLoanRoutes } from './routes/loanRoutes.js';
import { createNotificationRoutes } from './routes/notificationRoutes.js';
import { createStatsRoutes } from './routes/statsRoutes.js';
import { createToolRoutes } from './routes/toolRoutes.js';

export function createApp(models) {
  const app = express();
  const controllers = {
    auth: createAuthController(models),
    categories: createCategoryController(models),
    tools: createToolController(models),
    loans: createLoanController(models),
    notifications: createNotificationController(models),
    stats: createStatsController(models),
  };

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((item) => item.trim()),
  }));
  app.use(express.json({ limit: '100kb' }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  app.get('/', (_req, res) => {
    res.json({
      data: {
        name: 'SiPinjam API',
        version: '1.0.0',
        base: '/api/v1',
      },
    });
  });

  const healthHandler = asyncHandler(async (_req, res) => {
    try {
      await models.categories.list();
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

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  app.use('/api/v1/auth', createAuthRoutes(controllers.auth));
  app.use('/api/v1/categories', createCategoryRoutes(controllers.categories));
  app.use('/api/v1/tools', createToolRoutes(controllers.tools));
  app.use('/api/v1/loans', createLoanRoutes(controllers.loans));
  app.use('/api/v1/notifications', createNotificationRoutes(controllers.notifications));
  app.use('/api/v1/stats', createStatsRoutes(controllers.stats));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
