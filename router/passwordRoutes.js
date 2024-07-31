const express = require('express');
const router = express.Router();
const { requestPasswordReset, resetPassword, verifyOTP } = require('../controller/passwordController');

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp',verifyOTP)
router.post('/reset-password', resetPassword);

module.exports = router;
