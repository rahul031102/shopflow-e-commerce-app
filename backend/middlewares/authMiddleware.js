const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protects routes — verifies the Bearer access token.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired. Please refresh.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists', 401);
  if (!user.isActive) throw new AppError('Your account has been deactivated', 403);

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Must be used after `protect`.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(`Access denied. Requires role: ${roles.join(' or ')}`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
