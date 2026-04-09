const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

function createCrudRoutes(controller, options = {}) {
  const router = express.Router();
  const readMiddleware = options.readAuth ? [authenticate] : [];
  const writeRoles = options.writeRoles || ['admin'];
  const writeMiddleware = [authenticate, authorize(...writeRoles)];

  router
    .route('/')
    .get(...readMiddleware, controller.getAll)
    .post(...writeMiddleware, controller.createOne);

  router
    .route('/:id')
    .get(...readMiddleware, controller.getOne)
    .patch(...writeMiddleware, controller.updateOne)
    .delete(...writeMiddleware, controller.deleteOne);

  return router;
}

module.exports = createCrudRoutes;
