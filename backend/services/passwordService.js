const crypto = require('crypto');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

/**
 * Initiates forgot-password flow.
 * Generates a hashed reset token, stores it on the user, emails the raw token.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Return success either way to prevent email enumeration attacks
    return;
  }

  // Generate raw token (sent in email) and hashed token (stored in DB)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user, rawToken);
};

/**
 * Validates reset token and sets new password.
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Reset token is invalid or has expired', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};

module.exports = { forgotPassword, resetPassword };
