const logger = require('../utils/logger');

/**
 * 404 handler — catches requests to undefined routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Central error handler — formats all errors into a consistent JSON shape.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Mongoose: Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 409;
  }

  // Mongoose: Validation errors
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    statusCode = 422;
  }

  // express-validator errors (passed via AppError.errors)
  if (err.errors && Array.isArray(err.errors)) {
    errors = err.errors;
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
      logger.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
