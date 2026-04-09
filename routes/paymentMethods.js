var express = require('express');
var router = express.Router();
let paymentMethodModel = require('../schemas/paymentMethods');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
  let data = await paymentMethodModel.find({
    isDeleted: false
  }).sort({
    name: 1
  });
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await paymentMethodModel.findOne({
      isDeleted: false,
      _id: req.params.id
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
    let newPaymentMethod = new paymentMethodModel({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await newPaymentMethod.save();
    res.send(newPaymentMethod);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let result = await paymentMethodModel.findOneAndUpdate(
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
    let result = await paymentMethodModel.findOne({
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
