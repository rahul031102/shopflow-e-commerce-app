const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator chains.
 * If there are validation errors, formats them and throws an AppError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    const err = new AppError('Validation failed', 422);
    err.errors = formatted;
    return next(err);
  }
  next();
};

module.exports = { validate };
