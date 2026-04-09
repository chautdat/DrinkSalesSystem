var express = require('express');
var router = express.Router();
const { checkLogin } = require('../utils/authHandler');
let cartModel = require('../schemas/carts');
let productModel = require('../schemas/products');

router.get('/', checkLogin, async function (req, res, next) {
  let user = req.user;
  let cart = await cartModel.findOne({
    user: user._id
  }).populate('products.product');
  res.send(cart);
});

router.post('/add', checkLogin, async function (req, res, next) {
  let { product, quantity } = req.body;
  quantity = Number(quantity);
  let productItem = await productModel.findOne({
    _id: product,
    isDeleted: false
  });
  if (!productItem) {
    res.status(404).send({
      message: 'product khong ton tai'
    });
    return;
  }
  let user = req.user;
  let cart = await cartModel.findOne({
    user: user._id
  });
  if (!cart) {
    cart = new cartModel({
      user: user._id,
      products: []
    });
  }
  let cartItems = cart.products;
  let index = cartItems.findIndex(function (e) {
    return e.product == product;
  });
  if (index > -1) {
    if (productItem.stock >= (quantity + cartItems[index].quantity)) {
      cartItems[index].quantity += Number(quantity);
      await cart.save();
    } else {
      res.status(404).send({
        message: 'product khong du so du'
      });
      return;
    }
  } else {
    if (productItem.stock >= quantity) {
      cartItems.push({
        product: product,
        quantity: Number(quantity)
      });
      await cart.save();
    } else {
      res.status(404).send({
        message: 'product khong du so du'
      });
      return;
    }
  }
  res.send(cart);
});

router.post('/remove', checkLogin, async function (req, res, next) {
  let { product, quantity } = req.body;
  quantity = Number(quantity);
  let productItem = await productModel.findOne({
    _id: product,
    isDeleted: false
  });
  if (!productItem) {
    res.status(404).send({
      message: 'product khong ton tai'
    });
    return;
  }
  let user = req.user;
  let cart = await cartModel.findOne({
    user: user._id
  });
  if (!cart) {
    res.status(404).send({
      message: 'gio hang khong ton tai'
    });
    return;
  }
  let cartItems = cart.products;
  let index = cartItems.findIndex(function (e) {
    return e.product == product;
  });
  if (index > -1) {
    if (cartItems[index].quantity > quantity) {
      cartItems[index].quantity -= Number(quantity);
    } else {
      if (cartItems[index].quantity == quantity) {
        cartItems.splice(index, 1);
      } else {
        res.status(404).send({
          message: 'so luong remove khong du'
        });
        return;
      }
    }
    await cart.save();
  } else {
    res.status(404).send({
      message: 'gio hang khong ton tai vat pham nay'
    });
    return;
  }
  res.send(cart);
});

module.exports = router;
