const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig'); // Import multer config
const courseController = require('../controller/course');

// Routes
router.post('/courses', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), courseController.createCourse); // Add upload middleware here
router.get('/courses', courseController.getAllCourses);
router.get('/coursesById/:id', courseController.getCourseById);
router.get('/courses/slug/:slug', courseController.getCourseBySlug);
router.put('/courses/:id', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), courseController.updateCourseById); // Add upload middleware here
router.delete('/courses/:id', courseController.deleteCourseById);

module.exports = router;
