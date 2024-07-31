const Course = require('../models/course'); // Assuming your model is defined in models/course.js

// CREATE a new course
async function createCourse(req, res) {
  try {
    // Validate req.body as needed here
    const course = await Course.create(req.body); // Assuming req.body contains all fields for the course
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err.message); // Log error details
    res.status(500).json({ message: 'Error creating course', error: err.message });
  }
}

// READ all courses
async function getAllCourses(req, res) {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err.message); // Log error details
    res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
}

// READ one course by ID
async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err.message); // Log error details
    res.status(500).json({ message: 'Error fetching course', error: err.message });
  }
}

// UPDATE a course by ID
async function updateCourseById(req, res) {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating course:', err.message); // Log error details
    res.status(500).json({ message: 'Error updating course', error: err.message });
  }
}

// DELETE a course by ID
async function deleteCourseById(req, res) {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err.message); // Log error details
    res.status(500).json({ message: 'Error deleting course', error: err.message });
  }
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById
};
