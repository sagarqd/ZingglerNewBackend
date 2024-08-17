const express = require('express');
const router = express.Router();
const { registerStudent } = require('../controller/studentController');

router.post('/register', registerStudent);

module.exports = router;
