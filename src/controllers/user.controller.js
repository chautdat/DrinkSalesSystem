const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/user.model');

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({
    success: true,
    data: users,
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const allowedFields = [
    'fullName',
    'phone',
    'avatar',
    'address',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

const removeUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

module.exports = {
  listUsers,
  getUser,
  updateMe,
  removeUser,
};
