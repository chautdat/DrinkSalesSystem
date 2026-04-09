var express = require('express');
var router = express.Router();
let brandModel = require('../schemas/brands');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
  let data = await brandModel.find({
    isDeleted: false
  }).sort({
    name: 1
  });
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await brandModel.findOne({
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
        message: 'Tên thương hiệu không được để trống'
      });
    }
    let newBrand = new brandModel({
      name: name,
      description: req.body.description,
      image: req.body.image,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await newBrand.save();
    res.send(newBrand);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'Tên thương hiệu đã tồn tại'
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
          message: 'Tên thương hiệu không được để trống'
        });
      }
    }
    let result = await brandModel.findOneAndUpdate(
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
        message: 'Tên thương hiệu đã tồn tại'
      });
    }
    res.status(400).send({
      message: error.message
    });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let result = await brandModel.findOneAndUpdate({
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
