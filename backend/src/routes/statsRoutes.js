import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export function createStatsRoutes(controller) {
  const router = Router();
  router.use(requireAuth);
  router.get('/summary', controller.summary);
  router.get('/populer', controller.populer);
  return router;
}
