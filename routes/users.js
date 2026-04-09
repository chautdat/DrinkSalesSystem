var express = require('express');
var router = express.Router();
let { validatedResult, CreateUserValidator, ModifyUserValidator } = require('../utils/validator');
let userModel = require('../schemas/users');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/profile', checkLogin, async function (req, res, next) {
  try {
    let user = await userModel.findOne({
      _id: req.user._id,
      isDeleted: false
    });
    if (!user) {
      return res.status(404).send({ message: 'id not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(404).send({ message: 'id not found' });
  }
});

router.put('/profile', checkLogin, async function (req, res, next) {
  try {
    let updateBody = {};
    if (req.body.fullName !== undefined) updateBody.fullName = req.body.fullName;
    if (req.body.phone !== undefined) updateBody.phone = req.body.phone;
    if (req.body.address !== undefined) updateBody.address = req.body.address;
    if (req.body.avatarUrl !== undefined) updateBody.avatarUrl = req.body.avatarUrl;
    let updatedItem = await userModel.findByIdAndUpdate(
      req.user._id,
      updateBody,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: 'id not found' });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.get('/', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  let users = await userModel.find({ isDeleted: false });
  res.send(users);
});

router.get('/:id', checkLogin, checkRole('admin', 'staff'), async function (req, res, next) {
  try {
    let result = await userModel.findOne({ _id: req.params.id, isDeleted: false });
    if (result) {
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
    let newUser = new userModel({
      fullName: req.body.fullName,
      password: req.body.password,
      email: req.body.email.toLowerCase(),
      role: req.body.role || 'customer',
      avatarUrl: req.body.avatarUrl,
      phone: req.body.phone || '',
      address: req.body.address || '',
      status: req.body.status !== undefined ? req.body.status : true,
      loginCount: req.body.loginCount || 0
    });
    await newUser.save();
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
