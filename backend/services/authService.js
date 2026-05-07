const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendWelcomeEmail } = require('../utils/emailService');

/**
 * Generates a signed JWT access token (short-lived).
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generates a signed JWT refresh token (long-lived).
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

/**
 * Sends the access token in the JSON response body
 * and the refresh token as an HTTP-only cookie.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  // Strip sensitive fields before sending
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: userResponse,
    });
};

/**
 * Registers a new user.
 */
const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const user = await User.create({ name, email, password });
  sendWelcomeEmail(user).catch(() => {}); // fire-and-forget
  return user;
};

/**
 * Authenticates a user with email & password.
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password since it's select:false
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact support.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Refreshes the access token using a valid refresh token from cookie.
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401);
  }

  const newAccessToken = generateAccessToken(user._id);
  return { accessToken: newAccessToken, user };
};

/**
 * Changes a user's password after verifying the old one.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  sendTokenResponse,
  changePassword,
};
