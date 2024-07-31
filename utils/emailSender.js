const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER, // Your SMTP username from .env
        pass: "Test1234@*#"  // Your SMTP password from .env
    }
});

const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    to: email,
    from: process.env.SMTP_USER,
    subject: 'Password Reset',
     text: `Your OTP code is ${otp}. This code is valid for 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

module.exports =sendPasswordResetEmail;