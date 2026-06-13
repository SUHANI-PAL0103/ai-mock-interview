const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyLoginOTP,
  getProfile,
  sendOTP,
  verifyOTP,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOTP);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;