var express = require('express');
var router = express.Router();
let orderModel = require('../schemas/orders');
const { checkLogin, checkRole } = require('../utils/authHandler');

function normalizeOrderStatus(status) {
  let value = String(status || '').trim();
  let map = {
    Shipped: 'Shipping',
    Delivered: 'Completed'
  };
  return map[value] || value;
}

router.get('/revenue', checkLogin, checkRole('admin'), async function (req, res, next) {
  let orders = await orderModel.find({
    isDeleted: false,
    status: {
      $ne: 'Cancelled'
    }
  }).select('total status paymentStatus');

  let normalizedOrders = orders.map(function (order) {
    return {
      total: Number(order.total || 0),
      status: normalizeOrderStatus(order.status)
    };
  });

  let revenueOrders = normalizedOrders.filter(function (order) {
    return ['Shipping', 'Completed'].includes(order.status);
  });

  let totalRevenue = revenueOrders.reduce(function (sum, order) {
    return sum + Number(order.total || 0);
  }, 0);

  let shippedOrders = normalizedOrders.filter(function (order) {
    return order.status === 'Shipping';
  }).length;

  let deliveredOrders = normalizedOrders.filter(function (order) {
    return order.status === 'Completed';
  }).length;

  let pendingOrders = normalizedOrders.filter(function (order) {
    return ['Pending', 'Confirmed', 'Preparing'].includes(order.status);
  }).length;

  res.send({
    totalRevenue: totalRevenue,
    totalOrders: revenueOrders.length,
    completedOrders: deliveredOrders,
    deliveredOrders: deliveredOrders,
    shippedOrders: shippedOrders,
    pendingOrders: pendingOrders
  });
});

router.get('/top-products', checkLogin, checkRole('admin'), async function (req, res, next) {
  let result = await orderModel.aggregate([
    {
      $match: {
        isDeleted: false,
        status: {
          $ne: 'Cancelled'
        }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        title: {
          $first: '$items.title'
        },
        quantity: {
          $sum: '$items.quantity'
        },
        revenue: {
          $sum: '$items.subtotal'
        }
      }
    },
    {
      $sort: {
        quantity: -1
      }
    },
    {
      $limit: 5
    }
  ]);

  res.send(result.map(function (item) {
    return {
      productId: item._id,
      productName: item.title,
      quantity: item.quantity,
      revenue: item.revenue
    };
  }));
});

module.exports = router;
