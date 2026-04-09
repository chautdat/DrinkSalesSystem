var express = require('express');
var router = express.Router();
let { validatedResult, CreateUserValidator, ModifyUserValidator } = require('../utils/validator');
let userModel = require('../schemas/users');
let userController = require('../controllers/users');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  let users = await userModel.find({ isDeleted: false });
  res.send(users);
});

router.get('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let result = await userModel.find({ _id: req.params.id, isDeleted: false });
    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send({ message: 'id not found' });
    }
  } catch (error) {
    res.status(404).send({ message: 'id not found' });
  }
});

router.post('/', checkLogin, checkRole('admin'), CreateUserValidator, validatedResult, async function (req, res, next) {
  try {
    let newUser = await userController.CreateAnUser(
      req.body.fullName,
      req.body.password,
      req.body.email,
      req.body.role || 'customer',
      req.body.avatarUrl,
      req.body.status !== undefined ? req.body.status : true,
      req.body.loginCount || 0
    );
    res.send(newUser);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put('/:id', checkLogin, checkRole('admin'), ModifyUserValidator, validatedResult, async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) return res.status(404).send({ message: 'id not found' });
    let populated = await userModel.findById(updatedItem._id);
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('admin'), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
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
