const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    default: uuidv4 // Generates a unique ID for each new document
  },
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
  isVerified: {
    type: Boolean,
    default: function () {
      return this.userType === 'student'; // Defaults to true if userType is 'student'
    }
  },
  otpVerifiedAt: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['admin', 'student'],
    default: 'admin'
  },
  otp: {
    type: String
  },
  otpExpiration: {
    type: Date
  },
  otpResendTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
