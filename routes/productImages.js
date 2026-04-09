var express = require('express');
var router = express.Router();
let productImageModel = require('../schemas/productImages');
let productModel = require('../schemas/products');
let { uploadImage } = require('../utils/uploadHandler');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
  let query = {
    isDeleted: false
  };
  if (req.query.product) {
    query.product = req.query.product;
  }
  let data = await productImageModel.find(query)
    .populate({
      path: 'product',
      select: 'title sku'
    })
    .sort({
      createdAt: -1
    });
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await productImageModel.findOne({
      isDeleted: false,
      _id: req.params.id
    }).populate({
      path: 'product',
      select: 'title sku'
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

router.post('/', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let product = await productModel.findOne({
      _id: req.body.product,
      isDeleted: false
    });
    if (!product) {
      return res.status(404).send({
        message: 'product khong ton tai'
      });
    }

    let newImage = new productImageModel({
      product: req.body.product,
      imageUrl: req.body.imageUrl,
      isPrimary: req.body.isPrimary !== undefined ? req.body.isPrimary : false
    });
    await newImage.save();

    if (newImage.imageUrl && !product.images.includes(newImage.imageUrl)) {
      product.images.push(newImage.imageUrl);
      await product.save();
    }

    res.send(newImage);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.post('/upload', checkLogin, checkRole('admin', 'staff'), uploadImage.single('file'), async function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: 'file khong ton tai'
      });
    }

    let product = await productModel.findOne({
      _id: req.body.product,
      isDeleted: false
    });
    if (!product) {
      return res.status(404).send({
        message: 'product khong ton tai'
      });
    }

    let imageUrl = '/api/v1/upload/' + req.file.filename;
    let newImage = new productImageModel({
      product: req.body.product,
      imageUrl: imageUrl,
      isPrimary: req.body.isPrimary !== undefined ? req.body.isPrimary : false
    });
    await newImage.save();

    if (!product.images.includes(imageUrl)) {
      product.images.push(imageUrl);
      await product.save();
    }

    res.send(newImage);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let result = await productImageModel.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      req.body,
      {
        new: true
      }
    );
    if (!result) {
      return res.status(404).send({
        message: 'ID NOT FOUND'
      });
    }
    res.send(result);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let result = await productImageModel.findOne({
      _id: req.params.id,
      isDeleted: false
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
    res.status(400).send({
      message: error.message
    });
  }
});

module.exports = router;
