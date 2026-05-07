const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { forgotPassword, resetPassword } = require('../services/passwordService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });
  authService.sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser({ email, password });
  authService.sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user (clear refresh token cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Refresh access token using cookie
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({
    success: true,
    accessToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, { currentPassword, newPassword });
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

/**
 * @desc    Send password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await forgotPassword(req.body.email);
  res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

/**
 * @desc    Reset password using token from email
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPasswordHandler = asyncHandler(async (req, res) => {
  const user = await resetPassword(req.params.token, req.body.newPassword);
  authService.sendTokenResponse(user, 200, res);
});

module.exports = { register, login, logout, refresh, getMe, changePassword, forgotPasswordHandler, resetPasswordHandler };
