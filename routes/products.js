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
  let query = {
    isDeleted: false,
    title: new RegExp(titleQ, 'i')
  };
  if (queries.min !== undefined || queries.max !== undefined) {
    query.price = {};
    if (queries.min !== undefined && queries.min !== '') {
      query.price.$gte = Number(queries.min);
    }
    if (queries.max !== undefined && queries.max !== '') {
      query.price.$lte = Number(queries.max);
    }
  }
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
  try {
    let title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).send({
        message: 'Tên sản phẩm không được để trống'
      });
    }

    let newProduct = new productModel({
      sku: req.body.sku || ('SKU-' + Date.now()),
      title: title,
      slug: slugify(title, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: true
      }),
      price: req.body.price,
      stock: req.body.stock || 0,
      description: req.body.description,
      category: req.body.category || req.body.categoryId,
      brand: req.body.brand || req.body.brandId || null,
      images: req.body.images
    });
    await newProduct.save();
    res.send(newProduct);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'Tên hoặc SKU sản phẩm đã tồn tại'
      });
    }
    res.status(400).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res) {
  try {
    if (req.body.title !== undefined) {
      req.body.title = String(req.body.title || '').trim();
      if (!req.body.title) {
        return res.status(400).send({
          message: 'Tên sản phẩm không được để trống'
        });
      }
    }
    let id = req.params.id;
    let result = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true,
      runValidators: true
    });
    res.send(result);

  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'Tên hoặc SKU sản phẩm đã tồn tại'
      });
    }
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
