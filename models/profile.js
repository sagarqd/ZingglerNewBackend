// models/profile.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const profileSchema = new mongoose.Schema({
  _id: {
    type: String, // Explicitly define _id as String type
    default: uuidv4, // Optional: Use uuidv4 to generate default IDs
  },
  
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
  },
  country: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male',
  },
  group: {
    type: String
  },
});

module.exports = mongoose.model('Profile', profileSchema);

//module.exports = Profile;
