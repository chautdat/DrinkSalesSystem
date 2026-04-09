var express = require('express');
var router = express.Router();
const { checkLogin } = require('../utils/authHandler');
let cartModel = require('../schemas/carts');
let productModel = require('../schemas/products');

function findCartItemIndex(cart, productId) {
  return cart.products.findIndex(function (item) {
    return String(item.product) === String(productId);
  });
}

async function loadPopulatedCart(userId) {
  return cartModel.findOne({
    user: userId
  }).populate('products.product');
}

function getProductId(body) {
  return body.product || body.productId || body.id || '';
}

async function addCartItem(req, res) {
  let { quantity } = req.body;
  let product = getProductId(req.body);
  quantity = Number(quantity || 1);

  if (!product) {
    return res.status(400).send({
      message: 'product khong ton tai'
    });
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return res.status(400).send({
      message: 'so luong khong hop le'
    });
  }

  let productItem = await productModel.findOne({
    _id: product,
    isDeleted: false
  });
  if (!productItem) {
    return res.status(404).send({
      message: 'product khong ton tai'
    });
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
  let index = findCartItemIndex(cart, product);
  if (index > -1) {
    if (productItem.stock >= (quantity + cartItems[index].quantity)) {
      cartItems[index].quantity += Number(quantity);
      await cart.save();
    } else {
      return res.status(404).send({
        message: 'product khong du so du'
      });
    }
  } else {
    if (productItem.stock >= quantity) {
      cartItems.push({
        product: product,
        quantity: Number(quantity)
      });
      await cart.save();
    } else {
      return res.status(404).send({
        message: 'product khong du so du'
      });
    }
  }
  res.send(cart);
}

async function updateCartItem(req, res) {
  try {
    let product = getProductId(req.body);
    let { quantity } = req.body;
    quantity = Number(quantity);
    if (!product) {
      return res.status(400).send({
        message: 'product khong ton tai'
      });
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).send({
        message: 'so luong khong hop le'
      });
    }

    let productItem = await productModel.findOne({
      _id: product,
      isDeleted: false
    });
    if (!productItem) {
      return res.status(404).send({
        message: 'product khong ton tai'
      });
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

    let index = findCartItemIndex(cart, product);
    if (index > -1) {
      if (productItem.stock < quantity) {
        return res.status(404).send({
          message: 'product khong du so du'
        });
      }
      cart.products[index].quantity = quantity;
    } else {
      if (productItem.stock < quantity) {
        return res.status(404).send({
          message: 'product khong du so du'
        });
      }
      cart.products.push({
        product: product,
        quantity: quantity
      });
    }

    await cart.save();
    let populated = await loadPopulatedCart(user._id);
    res.send(populated);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
}

async function removeCartItem(req, res) {
  let product = getProductId(req.body);
  let { quantity } = req.body;
  quantity = Number(quantity || 1);

  if (!product) {
    return res.status(400).send({
      message: 'product khong ton tai'
    });
  }

  let productItem = await productModel.findOne({
    _id: product,
    isDeleted: false
  });
  if (!productItem) {
    return res.status(404).send({
      message: 'product khong ton tai'
    });
  }
  let user = req.user;
  let cart = await cartModel.findOne({
    user: user._id
  });
  if (!cart) {
    return res.status(404).send({
      message: 'gio hang khong ton tai'
    });
  }
  let cartItems = cart.products;
  let index = findCartItemIndex(cart, product);
  if (index > -1) {
    if (cartItems[index].quantity > quantity) {
      cartItems[index].quantity -= Number(quantity);
    } else {
      if (cartItems[index].quantity == quantity) {
        cartItems.splice(index, 1);
      } else {
        return res.status(404).send({
          message: 'so luong remove khong du'
        });
      }
    }
    await cart.save();
  } else {
    return res.status(404).send({
      message: 'gio hang khong ton tai vat pham nay'
    });
  }
  res.send(cart);
}

async function clearCart(req, res) {
  try {
    let user = req.user;
    let cart = await cartModel.findOne({
      user: user._id
    });
    if (!cart) {
      return res.send({
        user: user._id,
        products: []
      });
    }
    cart.products = [];
    await cart.save();
    let populated = await loadPopulatedCart(user._id);
    res.send(populated);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
}

router.get('/', checkLogin, async function (req, res, next) {
  let user = req.user;
  let cart = await loadPopulatedCart(user._id);
  res.send(cart);
});

router.post('/add', checkLogin, addCartItem);
router.post('/', checkLogin, addCartItem);

router.put('/update', checkLogin, updateCartItem);
router.put('/', checkLogin, updateCartItem);

router.post('/remove', checkLogin, removeCartItem);

router.delete('/clear', checkLogin, clearCart);
router.delete('/', checkLogin, clearCart);

module.exports = router;
