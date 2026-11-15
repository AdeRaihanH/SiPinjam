import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export function createLoanRoutes(controller) {
  const router = Router();
  router.use(requireAuth);
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/kode/:kode', controller.byKode);
  router.get('/:id', controller.detail);
  router.post('/:id/return', controller.returnLoan);
  return router;
}
