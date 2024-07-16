const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyMail } = require('../controller/user');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:userId', verifyMail);

module.exports = router;
