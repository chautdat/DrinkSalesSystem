const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const createCrudController = require('../controllers/crud.controller');
const User = require('../models/user.model');

const router = express.Router();
const crud = createCrudController(User, {
  searchFields: ['fullName', 'email', 'phone'],
});

router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

router.patch('/me', authenticate, userController.updateMe);

router
  .route('/')
  .get(authenticate, authorize('admin'), userController.listUsers)
  .post(authenticate, authorize('admin'), crud.createOne);

router
  .route('/:id')
  .get(authenticate, authorize('admin'), userController.getUser)
  .patch(authenticate, authorize('admin'), crud.updateOne)
  .delete(authenticate, authorize('admin'), userController.removeUser);

module.exports = router;
