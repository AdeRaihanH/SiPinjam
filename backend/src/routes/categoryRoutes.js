import { Router } from 'express';

export function createCategoryRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  return router;
}
