const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const enrolledStudentsSchema = new mongoose.Schema({
    enrollmentId: {
        type: String,
        default: uuidv4, // Generate a unique ID for each enrollment
    },
    enrolledId: {
        type: String,
        default: uuidv4, // Generate a unique ID for each enrolled student
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    enrolledBy: {
        type: String, // e.g., 'admin', 'teacher'
        required: true,
    },
    enrollmentDate: {
        type: Date,
        default: Date.now,
    },
});

const EnrolledStudents = mongoose.model('EnrolledStudents', enrolledStudentsSchema);

module.exports = EnrolledStudents;
