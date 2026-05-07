/**
 * Custom operational error class.
 * Distinguishes expected errors (user input, auth, not found)
 * from programmer errors (bugs), allowing the error handler
 * to respond appropriately.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
