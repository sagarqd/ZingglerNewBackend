const express = require('express');
const { registerUser, loginUser, verifyMail, resendOTP, getUserDetails } = require('../controller/user');
const authenticateToken = require('../middlewares/authMiddleware'); // Import the auth middleware
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', authenticateToken, verifyMail);
router.post('/resend-otp', authenticateToken, resendOTP);
router.get('/user', authenticateToken, getUserDetails);

module.exports = router;

