const express = require('express');
const router = express.Router();
const upload=require('../middlewares/multerConfig')
const courseController = require('../controller/course');

// Routes
router.post('/courses', courseController.createCourse);
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.get('/courses/slug/:slug',courseController.getCourseBySlug);
router.put('/courses/:id', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), courseController.updateCourseById);
router.delete('/courses/:id', courseController.deleteCourseById);


module.exports = router;