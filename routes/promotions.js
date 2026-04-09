var express = require('express');
var router = express.Router();
let promotionModel = require('../schemas/promotions');
const { checkLogin, checkRole } = require('../utils/authHandler');

function normalizePromotion(body) {
  let payload = {};

  if (body.code !== undefined) {
    payload.code = String(body.code || '').trim().toUpperCase();
  }
  if (body.discount !== undefined) {
    payload.discount = Number(body.discount);
  }
  if (body.applyFor !== undefined) {
    payload.applyFor = String(body.applyFor || '').trim() || 'Tất cả';
  }
  if (body.expireDate !== undefined) {
    payload.expireDate = body.expireDate ? new Date(body.expireDate) : null;
  }
  if (body.usageCount !== undefined) {
    payload.usageCount = Number(body.usageCount);
  }
  if (body.maxUsage !== undefined) {
    payload.maxUsage = body.maxUsage === '' || body.maxUsage === null ? 0 : Number(body.maxUsage);
  }
  if (body.isActive !== undefined) {
    payload.isActive = body.isActive;
  }

  return payload;
}

router.get('/', checkLogin, checkRole('admin'), async function (req, res, next) {
  let data = await promotionModel.find({
    isDeleted: false
  }).sort({
    createdAt: -1
  });
  res.send(data);
});

router.get('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let result = await promotionModel.findOne({
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

router.post('/', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let payload = normalizePromotion(req.body);
    if (!payload.code) {
      return res.status(400).send({ message: 'Mã khuyến mãi là bắt buộc.' });
    }
    if (!Number.isFinite(payload.discount) || payload.discount <= 0 || payload.discount > 100) {
      return res.status(400).send({ message: 'Giảm giá phải từ 1 đến 100.' });
    }

    let newPromotion = new promotionModel({
      code: payload.code,
      discount: payload.discount,
      applyFor: payload.applyFor || 'Tất cả',
      expireDate: payload.expireDate || null,
      usageCount: Number.isFinite(payload.usageCount) ? payload.usageCount : 0,
      maxUsage: Number.isFinite(payload.maxUsage) ? payload.maxUsage : 0,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    });
    await newPromotion.save();
    res.send(newPromotion);
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.put('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let payload = normalizePromotion(req.body);
    let result = await promotionModel.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      payload,
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
    let result = await promotionModel.findOne({
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
