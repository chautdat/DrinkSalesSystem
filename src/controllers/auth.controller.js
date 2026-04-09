const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  register,
  login,
  me,
};
