var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
const { checkLogin, checkRole } = require('../utils/authHandler');
let cartModel = require('../schemas/carts');
let orderModel = require('../schemas/orders');
let productModel = require('../schemas/products');
let userModel = require('../schemas/users');
let paymentMethodModel = require('../schemas/paymentMethods');
let socket = require('../utils/socket');

function normalizeOrderStatus(status) {
  let value = String(status || '').trim();
  let map = {
    Shipped: 'Shipping',
    Delivered: 'Completed',
    Pending: 'Pending',
    Confirmed: 'Confirmed',
    Preparing: 'Preparing',
    Shipping: 'Shipping',
    Completed: 'Completed',
    Cancelled: 'Cancelled'
  };
  return map[value] || value;
}

async function resolvePaymentMethod(session, body) {
  let paymentMethodCode = String(body.paymentMethod || body.paymentMethodCode || 'COD').toUpperCase();
  let selectedPaymentMethodId = null;

  if (body.paymentMethodId) {
    let selectedPaymentMethod = await paymentMethodModel.findOne({
      _id: body.paymentMethodId,
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

  return {
    paymentMethodCode: paymentMethodCode,
    selectedPaymentMethodId: selectedPaymentMethodId
  };
}

async function populateOrder(orderId) {
  return orderModel.findById(orderId)
    .populate('user')
    .populate('paymentMethodId')
    .populate('items.product');
}

async function createOrderFromCart(user, body, session) {
  let cart = await cartModel.findOne({
    user: user._id
  }).session(session).populate('products.product');
  if (!cart || !cart.products.length) {
    throw new Error('gio hang rong');
  }

  let items = [];
  let subtotal = 0;
  let paymentMethodResult = await resolvePaymentMethod(session, body);
  let paymentMethodCode = paymentMethodResult.paymentMethodCode;
  let selectedPaymentMethodId = paymentMethodResult.selectedPaymentMethodId;

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
    shippingName: body.shippingName || user.fullName || '',
    shippingPhone: body.shippingPhone || user.phone || '',
    shippingAddress: body.shippingAddress || user.address || '',
    items: items,
    subtotal: subtotal,
    total: subtotal,
    note: body.note || '',
    paymentMethod: paymentMethodCode,
    paymentMethodId: selectedPaymentMethodId
  });
  await newOrder.save({ session });
  cart.products = [];
  await cart.save({ session });
  return newOrder;
}

async function createManualOrder(body, session) {
  let { paymentMethodCode, selectedPaymentMethodId } = await resolvePaymentMethod(session, body);
  let user = await userModel.findOne({
    _id: body.userId,
    isDeleted: false
  }).session(session);
  if (!user) {
    throw new Error('user khong ton tai');
  }

  let itemsInput = Array.isArray(body.items) ? body.items : [];
  let items = [];
  let subtotal = 0;
  let total = Number(body.total || 0);

  if (itemsInput.length > 0) {
    for (const item of itemsInput) {
      let productId = item.productId || item.product;
      let product = await productModel.findById(productId).session(session);
      if (!product) {
        throw new Error('product khong ton tai');
      }
      let quantity = Number(item.quantity || 1);
      if (quantity < 1) {
        throw new Error('so luong khong hop le');
      }
      if (product.stock < quantity) {
        throw new Error('product khong du so du');
      }
      let price = Number(item.price || product.price || 0);
      let title = item.title || product.title;
      let lineTotal = Number(item.subtotal || price * quantity);
      items.push({
        product: product._id,
        title: title,
        quantity: quantity,
        price: price,
        subtotal: lineTotal
      });
      subtotal += lineTotal;
      product.stock -= quantity;
      await product.save({ session });
    }
    total = Number(body.total || subtotal);
  }

  let newOrder = new orderModel({
    user: user._id,
    shippingName: body.shippingName || user.fullName || '',
    shippingPhone: body.shippingPhone || user.phone || '',
    shippingAddress: body.shippingAddress || user.address || '',
    items: items,
    subtotal: subtotal || total,
    total: total,
    note: body.note || '',
    paymentMethod: paymentMethodCode,
    paymentMethodId: selectedPaymentMethodId,
    status: normalizeOrderStatus(body.status || 'Pending')
  });
  await newOrder.save({ session });
  return newOrder;
}

router.post('/checkout', checkLogin, async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let newOrder = await createOrderFromCart(req.user, req.body, session);
    await session.commitTransaction();
    session.endSession();
    let populatedOrder = await populateOrder(newOrder._id);
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

router.post('/', checkLogin, async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let role = String(req.user.role || '').toLowerCase();
    let newOrder = ['admin', 'staff'].includes(role)
      ? await createManualOrder(req.body, session)
      : await createOrderFromCart(req.user, req.body, session);

    await session.commitTransaction();
    session.endSession();

    let populatedOrder = await populateOrder(newOrder._id);
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

router.get('/', checkLogin, async function (req, res, next) {
  let role = String(req.user.role || '').toLowerCase();
  let query = orderModel.find({ isDeleted: false });
  if (['admin', 'staff'].includes(role)) {
    query = query.populate('user');
  } else {
    query = query.find({ user: req.user._id });
  }
  let orders = await query
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

router.put('/:id/status', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let status = normalizeOrderStatus(req.body.status);
    let updatedItem = await orderModel.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      {
        status: status
      },
      {
        new: true
      }
    ).populate('user').populate('paymentMethodId').populate('items.product');
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    socket.emit('order:updated', updatedItem);
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id/cancel', checkLogin, async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let order = await orderModel.findOne({
      _id: req.params.id,
      isDeleted: false
    }).session(session).populate('items.product');
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({
        message: 'id not found'
      });
    }

    let isPrivileged = ['admin', 'staff'].includes(String(req.user.role || '').toLowerCase());
    if (!isPrivileged) {
      if (order.user.toString() !== req.user._id.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).send({
          message: 'ban khong co quyen'
        });
      }
      if (!['Pending', 'Confirmed'].includes(order.status)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
          message: 'khong the huy don o trang thai nay'
        });
      }
    }

    if (order.status === 'Cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({
        message: 'don hang da bi huy'
      });
    }

    for (const item of order.items) {
      let productId = item.product && item.product._id ? item.product._id : item.product;
      let product = await productModel.findById(productId).session(session);
      if (!product) {
        throw new Error('product khong ton tai');
      }
      product.stock += Number(item.quantity || 0);
      await product.save({ session });
    }

    order.status = 'Cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    let populatedOrder = await orderModel.findById(order._id)
      .populate('user')
      .populate('paymentMethodId')
      .populate('items.product');
    socket.emit('order:updated', populatedOrder || order);
    res.send(populatedOrder || order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send({
      message: error.message
    });
  }
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
    let role = String(req.user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'staff' && order.user._id.toString() !== req.user._id.toString()) {
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
    let updateBody = Object.assign({}, req.body);
    if (updateBody.status) {
      updateBody.status = normalizeOrderStatus(updateBody.status);
    }
    let updatedItem = await orderModel.findByIdAndUpdate(req.params.id, updateBody, { new: true });
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
