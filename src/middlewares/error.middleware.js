const mongoose = require('mongoose');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err instanceof mongoose.Error.ValidationError) {
    message = 'Validation failed';
    details = Object.values(err.errors).map((item) => item.message);
  } else if (err.code === 11000) {
    message = 'Duplicate key error';
    details = err.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

module.exports = errorHandler;
