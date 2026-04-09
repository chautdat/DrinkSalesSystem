var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let categoryModel = require('../schemas/categories');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', async function (req, res, next) {
  let data = await categoryModel.find({
    isDeleted: false
  });
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await categoryModel.find({
      isDeleted: false,
      _id: id
    });
    if (result.length) {
      res.send(result[0]);
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
  let newCate = new categoryModel({
    name: req.body.name,
    slug: slugify(req.body.name, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    }),
    image: req.body.image
  });
  await newCate.save();
  res.send(newCate);
});

router.put('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findByIdAndUpdate(
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
    let result = await categoryModel.findOne({
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
