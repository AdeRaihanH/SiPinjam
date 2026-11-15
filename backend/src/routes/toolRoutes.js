import { Router } from 'express';

export function createToolRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.get('/kode/:kode', controller.byKode);
  router.get('/:id', controller.detail);
  return router;
}
