const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt');

async function registerUser(payload) {
  const exists = await User.findOne({ email: payload.email.toLowerCase() });
  if (exists) {
    throw new ApiError(409, 'Email already exists');
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    role: 'customer',
  });

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return { user, token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
};
