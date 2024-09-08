const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig'); // Import multer config
const courseController = require('../controller/course');

// Routes for handling course operations
router.post('/courses', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), courseController.createCourse);

// Fetch all courses
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.get('/courses/slug/:slug', courseController.getCourseBySlug);

// Update a specific course by its ID (including file uploads)
router.put('/courses/:id', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), courseController.updateCourseById);

// Delete a specific course by its ID
router.delete('/courses/:id', courseController.deleteCourseById);

// Additional route to fetch the number of sections of a specific course by its ID
router.get('/courses/:id/sections', courseController.getNoOfSections);

// Optional: If you still need the route to fetch a course by its ID but with a different URL pattern
router.get('/coursesById/:id', courseController.getCourseById);

router.get('/my-course', courseController.getMyCourses);

module.exports = router;
