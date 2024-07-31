const express = require('express');
const { registerUser, loginUser, verifyMail,resendOTP } = require('../controller/user');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyMail); // Change to POST to accept OTP from request body
router.post('/resend-otp', resendOTP);
module.exports = router;
