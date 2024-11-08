const express = require('express');
const router = express.Router();
const upload=require('../middlewares/multerConfig')
const studentController = require('../controller/studentController');

router.post('/add-student', upload.single('studentAvatar'), studentController.addStudent);
router.post('/enroll',studentController.enrollStudent);
router.get('/student-list', studentController.getAllStudents);


module.exports = router;
