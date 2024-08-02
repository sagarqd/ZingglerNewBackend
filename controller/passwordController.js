
const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendOTPEmail  = require('../utils/emailSender');

function generateOTP(length = 6) {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('No user found with that email address.');

    const otp = generateOTP(); // Generate OTP
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    await user.save();

    // Send the OTP email
    await sendOTPEmail(email, otp);

    res.send('OTP sent to your email address.');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request.');
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Log incoming data for debugging
    console.log('Verifying OTP for email:', email);

    const user = await User.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Here you can mark OTP as used or expired if necessary

    res.json({ message: 'OTP verified successfully', status: 'success' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP.', error: error.message });
  }
};


  exports.resetPassword = async (req, res) => {
    const { email,newPassword, confirmPassword } = req.body;
  
    try {
      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
      }
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) return res.status(404).send('User not found.');
  
      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user password
      user.password = hashedPassword;
  
     
      await user.save();
  
      // Send success response
      res.send('Password has been reset.');
  
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).send('Error resetting password.');
    }
  };
