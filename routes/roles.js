var express = require('express');
var router = express.Router();
const { checkLogin, checkRole } = require('../utils/authHandler');
let roleModel = require('../schemas/roles');

router.get('/', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  let roles = await roleModel.find({ isDeleted: false });
  res.send(roles);
});

router.get('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let result = await roleModel.findOne({ _id: req.params.id, isDeleted: false });
    if (result) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: 'id not found' });
    }
  } catch (error) {
    res.status(404).send({ message: 'id not found' });
  }
});

router.post('/', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let newItem = new roleModel({
      name: req.body.name,
      description: req.body.description
    });
    await newItem.save();
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let updatedItem = await roleModel.findOneAndUpdate(
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
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let updatedItem = await roleModel.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      { isDeleted: true },
      {
        new: true
      }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
