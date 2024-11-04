// routes/teacherRoutes.js
// const upload = require('../middlewares/multerConfig')
const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher, getAllTeachers, deleteTeacher, updateTeacher } = require('../controller/teacher');

const upload = require('../middlewares/multerConfig');

// Register teacher
router.post('/register', upload.single('profilePic'), registerTeacher);

// Teacher login
router.post('/login', loginTeacher);

// Get teacher details
// router.get('/:teacherId', getTeacherDetails);


// Route to get all teachers
router.get("/teachers", getAllTeachers);// This will return all teachers


// Delete teacher by ID
router.delete('/:teacherId', deleteTeacher);

router.put('/update/:teacherId', upload.single('profilePic'), updateTeacher);


module.exports = router;
