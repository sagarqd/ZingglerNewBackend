const { v4: uuidv4 } = require('uuid');
const mongoose=require('mongoose');

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
    default: false
  },
  otpVerifiedAt: {
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
  otpExpiration: {
    type: Date
  },
  otpResendTime: {
    type: Date,
    default: null
},
otpVerifiedAt: {
    type: Date,
    default: null
}
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);
