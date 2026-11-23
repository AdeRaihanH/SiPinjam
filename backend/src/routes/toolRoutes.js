import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export function createToolRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.get('/kode/:kode', controller.byKode);
  router.get('/:id/qr.png', controller.qr);
  router.get('/:id', controller.detail);
  router.post('/', requireAuth, requireAdmin, controller.create);
  router.patch('/:id', requireAuth, requireAdmin, controller.update);
  router.delete('/:id', requireAuth, requireAdmin, controller.remove);
  return router;
}
