var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products');
let cartModel = require('../schemas/carts');
let mongoose = require('mongoose');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
  let queries = req.query;
  let titleQ = queries.title ? queries.title.toLowerCase() : '';
  let max = queries.max ? queries.max : 10000;
  let min = queries.min ? queries.min : 0;
  let query = {
    isDeleted: false,
    title: new RegExp(titleQ, 'i'),
    price: {
      $gte: min,
      $lte: max
    }
  };
  if (queries.brand) {
    query.brand = queries.brand;
  }
  if (queries.category) {
    query.category = queries.category;
  }
  let data = await productModel.find(query).populate({
    path: 'category',
    select: 'name'
  }).populate({
    path: 'brand',
    select: 'name'
  });
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findOne({
      isDeleted: false,
      _id: id
    }).populate({
      path: 'category',
      select: 'name'
    }).populate({
      path: 'brand',
      select: 'name'
    });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({
        message: 'ID NOT FOUND'
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message
    });
  }
});

router.post('/', checkLogin, checkRole('admin', 'staff'), async function (req, res) {
  let newProduct = new productModel({
    sku: req.body.sku || ('SKU-' + Date.now()),
    title: req.body.title,
    slug: slugify(req.body.title, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    }),
    price: req.body.price,
    stock: req.body.stock || 0,
    description: req.body.description,
    category: req.body.category,
    brand: req.body.brand || null,
    images: req.body.images
  });
  await newProduct.save();
  res.send(newProduct);
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res) {
  try {
    let id = req.params.id;
    let result = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    });
    res.send(result);

  } catch (error) {
    res.status(404).send({
      message: error.message
    });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res) {
  try {
    let id = req.params.id;
    let result = await productModel.findOne({
      isDeleted: false,
      _id: id
    });
    if (result) {
      result.isDeleted = true;
      await result.save();
      res.send(result);
    } else {
      res.status(404).send({
        message: 'ID NOT FOUND'
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message
    });
  }
});

module.exports = router;
