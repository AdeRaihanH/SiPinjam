import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export function createNotificationRoutes(controller) {
  const router = Router();
  router.use(requireAuth);
  router.get('/', controller.list);
  router.patch('/read-all', controller.markAll);
  router.patch('/:id/read', controller.markRead);
  return router;
}
