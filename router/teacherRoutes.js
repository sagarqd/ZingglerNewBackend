// routes/teacherRoutes.js

const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher, getTeacherDetails } = require('../controller/teacher');

// Register teacher
router.post('/register', registerTeacher);

// Teacher login
router.post('/login', loginTeacher);

// Get teacher details
router.get('/:teacherId', getTeacherDetails);

module.exports = router;
