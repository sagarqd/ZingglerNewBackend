const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    ref: 'User' // Reference to the User model
  },
  fullName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emergencyNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  matriculation: {
    type: String,
    required: true
  },
  intermediate: {
    type: String,
    required: true
  },
  bachelorDegree: {
    type: String,
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  academicLevel: {
    type: String,
    required: true
  },
  studentAvatar: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
