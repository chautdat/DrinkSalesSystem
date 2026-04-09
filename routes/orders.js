var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const { checkLogin, checkRole } = require('../utils/authHandler');
let cartModel = require('../schemas/carts');
let orderModel = require('../schemas/orders');
let productModel = require('../schemas/products');
let paymentMethodModel = require('../schemas/paymentMethods');
let socket = require('../utils/socket');

router.post('/checkout', checkLogin, async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let user = req.user;
    let cart = await cartModel.findOne({
      user: user._id
    }).session(session).populate('products.product');
    if (!cart || !cart.products.length) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({
        message: 'gio hang rong'
      });
      return;
    }

    let items = [];
    let subtotal = 0;
    let paymentMethodCode = String(req.body.paymentMethod || 'COD').toUpperCase();
    let selectedPaymentMethodId = null;

    if (req.body.paymentMethodId) {
      let selectedPaymentMethod = await paymentMethodModel.findOne({
        _id: req.body.paymentMethodId,
        isDeleted: false
      }).session(session);
      if (!selectedPaymentMethod) {
        throw new Error('payment method khong ton tai');
      }
      if (selectedPaymentMethod.isActive === false) {
        throw new Error('payment method dang bi tat');
      }
      paymentMethodCode = selectedPaymentMethod.code;
      selectedPaymentMethodId = selectedPaymentMethod._id;
    }

    let allowedPaymentMethods = ['COD', 'BANKING', 'WALLET'];
    if (!allowedPaymentMethods.includes(paymentMethodCode)) {
      throw new Error('payment method khong hop le');
    }

    for (const item of cart.products) {
      let product = await productModel.findById(item.product._id).session(session);
      if (!product) {
        throw new Error('product khong ton tai');
      }
      let quantity = Number(item.quantity);
      if (product.stock < quantity) {
        throw new Error('product khong du so du');
      }
      let price = Number(product.price || 0);
      let lineTotal = price * quantity;
      items.push({
        product: product._id,
        title: product.title,
        quantity: quantity,
        price: price,
        subtotal: lineTotal
      });
      subtotal += lineTotal;
      product.stock -= quantity;
      await product.save({ session });
    }

    let newOrder = new orderModel({
      user: user._id,
      items: items,
      subtotal: subtotal,
      total: subtotal,
      note: req.body.note || '',
      paymentMethod: paymentMethodCode,
      paymentMethodId: selectedPaymentMethodId
    });
    await newOrder.save({ session });
    cart.products = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();
    let populatedOrder = await orderModel.findById(newOrder._id)
      .populate('user')
      .populate('paymentMethodId')
      .populate('items.product');
    socket.emit('order:created', populatedOrder || newOrder);
    res.send(populatedOrder || newOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(404).send({
      message: error.message
    });
  }
});

router.get('/', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  let orders = await orderModel.find({ isDeleted: false })
    .populate('user')
    .populate('paymentMethodId')
    .populate('items.product')
    .sort({ createdAt: -1 });
  res.send(orders);
});

router.get('/mine', checkLogin, async function (req, res, next) {
  let orders = await orderModel.find({
    user: req.user._id,
    isDeleted: false
  }).populate('paymentMethodId').populate('items.product').sort({ createdAt: -1 });
  res.send(orders);
});

router.get('/:id', checkLogin, async function (req, res, next) {
  try {
    let order = await orderModel.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('user').populate('paymentMethodId').populate('items.product');
    if (!order) {
      res.status(404).send({
        message: 'id not found'
      });
      return;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && order.user._id.toString() !== req.user._id.toString()) {
      res.status(403).send({
        message: 'ban khong co quyen'
      });
      return;
    }
    res.send(order);
  } catch (error) {
    res.status(404).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let updatedItem = await orderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    socket.emit('order:updated', updatedItem);
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let updatedItem = await orderModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
