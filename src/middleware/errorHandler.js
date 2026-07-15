const AppError = require('../utils/AppError');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : 'Internal server error';

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Email is already registered';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  } else if (!err.isOperational) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
