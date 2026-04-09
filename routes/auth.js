let express = require('express');
let router = express.Router();
let { RegisterValidator, validatedResult, ChangePasswordValidator } = require('../utils/validator');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
const { checkLogin } = require('../utils/authHandler');
let mongoose = require('mongoose');
let cartModel = require('../schemas/carts');
let userModel = require('../schemas/users');

router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { fullName, password, email, avatarUrl, phone, address } = req.body;
    let existedUser = await userModel.findOne({
      email: email.toLowerCase(),
      isDeleted: false
    }).session(session);
    if (existedUser) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({
        message: 'email da ton tai'
      });
      return;
    }
    let newUser = new userModel({
      fullName: fullName,
      password: password,
      email: email.toLowerCase(),
      avatarUrl: avatarUrl,
      phone: phone || '',
      address: address || '',
      status: true,
      role: 'customer',
      loginCount: 0
    });
    await newUser.save({ session });
    let newCart = new cartModel({
      user: newUser._id
    });
    await newCart.save({ session });
    await session.commitTransaction();
    session.endSession();
    let token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '7d'
      }
    );
    res.cookie('TOKEN_LOGIN', token, {
      maxAge: 24 * 3600 * 1000,
      httpOnly: true,
      secure: false
    });
    res.send({
      user: newUser,
      token: token,
      cart: newCart
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(404).send(error.message);
  }
});

router.post('/login', async function (req, res, next) {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(404).send({
      message: 'thong tin dang nhap khong dung'
    });
    return;
  }
  let user = await userModel.findOne({
    email: email.toLowerCase(),
    isDeleted: false
  });
  if (!user) {
    res.status(404).send({
      message: 'thong tin dang nhap khong dung'
    });
    return;
  }
  if (user.isDeleted) {
    res.status(404).send({
      message: 'user khong ton tai'
    });
    return;
  }
  if (user.status === false) {
    res.status(404).send({
      message: 'user dang bi ban'
    });
    return;
  }
  if (!user.lockTime || user.lockTime < Date.now()) {
    if (bcrypt.compareSync(password, user.password)) {
      user.loginCount = 0;
      user.lockTime = null;
      await user.save();
      let token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        {
          expiresIn: '7d'
        }
      );
      res.cookie('TOKEN_LOGIN', token, {
        maxAge: 24 * 3600 * 1000,
        httpOnly: true,
        secure: false
      });
      res.send({
        token: token,
        user: user
      });
    } else {
      user.loginCount++;
      if (user.loginCount == 3) {
        user.loginCount = 0;
        user.lockTime = new Date(Date.now() + 60 * 60 * 1000);
      }
      await user.save();
      res.status(404).send({
        message: 'thong tin dang nhap khong dung'
      });
    }
  } else {
    res.status(404).send({
      message: 'user dang bi ban'
    });
  }
});

router.post('/logout', checkLogin, function (req, res, next) {
  res.cookie('TOKEN_LOGIN', null, {
    maxAge: 0,
    httpOnly: true,
    secure: false
  });
  res.send('logout thanh cong');
});

router.post('/changepassword', checkLogin, ChangePasswordValidator, async function (req, res, next) {
  let { oldpassword, newpassword } = req.body;
  if (bcrypt.compareSync(oldpassword, req.user.password)) {
    req.user.password = newpassword;
    await req.user.save();
    res.send('doi pass thanh cong');
  } else {
    res.status(404).send('old password khong dung');
  }
});

router.get('/me', checkLogin, function (req, res, next) {
  res.send(req.user);
});

module.exports = router;
