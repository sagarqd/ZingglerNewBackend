const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  otp_verified_at: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  },
  otp: {
    type: String
  },
  otp_expiration: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
