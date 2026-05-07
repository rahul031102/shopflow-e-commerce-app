const express = require('express');
const router = express.Router();
const {
  register, login, logout, refresh, getMe, changePassword,
  forgotPasswordHandler, resetPasswordHandler,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/authValidator');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);
router.post('/forgot-password', forgotPasswordHandler);
router.put('/reset-password/:token', resetPasswordHandler);

module.exports = router;
