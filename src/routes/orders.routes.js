const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.post('/checkout', authenticate, authorize('admin', 'staff', 'customer'), orderController.checkout);
router.get('/mine', authenticate, authorize('admin', 'staff', 'customer'), orderController.listMine);
router.get('/', authenticate, authorize('admin', 'staff'), orderController.getAll);
router.get('/:id', authenticate, authorize('admin', 'staff'), orderController.getOne);
router.patch('/:id', authenticate, authorize('admin', 'staff'), orderController.updateOne);
router.delete('/:id', authenticate, authorize('admin'), orderController.deleteOne);

module.exports = router;
