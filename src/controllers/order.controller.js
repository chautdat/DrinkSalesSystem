const asyncHandler = require('../utils/asyncHandler');
const createCrudController = require('./crud.controller');
const Order = require('../models/order.model');
const orderService = require('../services/order.service');
const socketService = require('../services/socket.service');

const crud = createCrudController(Order, {
  searchFields: ['orderNumber', 'note'],
  populate: [
    { path: 'user', select: 'fullName email role' },
    { path: 'items.product', select: 'name price salePrice images' },
    { path: 'voucher', select: 'code discountType discountValue' },
  ],
});

const listMine = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate([
      { path: 'user', select: 'fullName email role' },
      { path: 'items.product', select: 'name price salePrice images' },
      { path: 'voucher', select: 'code discountType discountValue' },
    ])
    .sort('-createdAt');

  res.json({
    success: true,
    data: orders,
  });
});

const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);

  socketService.emit('order:created', {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

module.exports = {
  ...crud,
  checkout,
  listMine,
};
