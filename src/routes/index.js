const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const roleRoutes = require('./roles.routes');
const categoryRoutes = require('./categories.routes');
const productRoutes = require('./products.routes');
const voucherRoutes = require('./vouchers.routes');
const uploadRoutes = require('./uploads.routes');
const conversationRoutes = require('./conversations.routes');
const messageRoutes = require('./messages.routes');
const orderRoutes = require('./orders.routes');
const reviewRoutes = require('./reviews.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'DrinkSalesSystem API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/uploads', uploadRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
