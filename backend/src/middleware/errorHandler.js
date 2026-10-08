const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for one or more fields',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred';

  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.message && (
    err.message.includes('Invalid status transition') ||
    err.message.includes('Validation failed') ||
    err.message.includes('must be one of')
  )) {
    statusCode = 400;
    code = 'BAD_REQUEST';
  } else if (err.message && err.message.toLowerCase().includes('not found')) {
    statusCode = 404;
    code = 'NOT_FOUND';
  } else if (err.name === 'SequelizeUniqueConstraintError' || (err.message && err.message.includes('already registered'))) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A record with these unique details already exists.';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
  } else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal system error occurred. Please contact recruitment support.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code
  });
};

module.exports = {
  errorHandler
};
