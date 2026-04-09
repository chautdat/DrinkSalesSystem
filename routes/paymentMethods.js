var express = require('express');
var router = express.Router();
var slugify = require('slugify');
let paymentMethodModel = require('../schemas/paymentMethods');
const { checkLogin, checkRole } = require('../utils/authHandler');

function buildCode(name) {
  return slugify(String(name || ''), {
    replacement: '-',
    lower: false,
    strict: true,
    trim: true
  })
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
}

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
    let name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).send({
        message: 'Tên phương thức không được để trống'
      });
    }

    let code = String(req.body.code || '').trim();
    if (!code) {
      code = buildCode(name);
    }

    let newPaymentMethod = new paymentMethodModel({
      name: name,
      code: code,
      description: req.body.description,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await newPaymentMethod.save();
    res.send(newPaymentMethod);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'Tên hoặc mã phương thức đã tồn tại'
      });
    }
    res.status(400).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    if (req.body.name !== undefined) {
      req.body.name = String(req.body.name || '').trim();
      if (!req.body.name) {
        return res.status(400).send({
          message: 'Tên phương thức không được để trống'
        });
      }
    }
    if (req.body.code !== undefined) {
      req.body.code = String(req.body.code || '').trim();
      if (!req.body.code) {
        if (req.body.name !== undefined && String(req.body.name || '').trim()) {
          req.body.code = buildCode(req.body.name);
        } else {
          delete req.body.code;
        }
      }
    }
    let result = await paymentMethodModel.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!result) {
      return res.status(404).send({
        message: 'ID NOT FOUND'
      });
    }
    res.send(result);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'Tên hoặc mã phương thức đã tồn tại'
      });
    }
    res.status(400).send({
      message: error.message
    });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let result = await paymentMethodModel.findOneAndUpdate({
      _id: req.params.id,
      isDeleted: false
    },
    {
      isDeleted: true
    },
    {
      new: true
    });
    if (result) {
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
