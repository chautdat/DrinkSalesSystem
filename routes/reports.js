var express = require('express');
var router = express.Router();
let orderModel = require('../schemas/orders');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/revenue', checkLogin, checkRole('admin'), async function (req, res, next) {
  let orders = await orderModel.find({
    isDeleted: false,
    status: {
      $ne: 'Cancelled'
    }
  }).select('total status paymentStatus');

  let totalRevenue = orders.reduce(function (sum, order) {
    return sum + Number(order.total || 0);
  }, 0);

  res.send({
    totalRevenue: totalRevenue,
    totalOrders: orders.length,
    completedOrders: orders.filter(function (order) {
      return order.status === 'Completed';
    }).length,
    pendingOrders: orders.filter(function (order) {
      return order.status === 'Pending';
    }).length
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
