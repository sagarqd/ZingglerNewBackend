const fs = require('fs');
const path = require('path');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otplib = require('otplib');
require('dotenv').config();

const smtp = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Replace with your SMTP host
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'noreply@infutech.in', // Your SMTP username
        pass: 'Test1234@*#' // Your SMTP password
    }
});

const sendVerifymail = async (firstName, lastName, email, user_id) => {
    try {
        let user = await User.findById(user_id);

        if (!user) {
            throw new Error('User not found');
        }

        // Check if a verification code was sent within the last minute
        if (user.otpResendTime && (Date.now() - user.otpResendTime < 60000)) {
            throw new Error('Please wait before requesting another verification code');
        }

        const otp = otplib.authenticator.generate(process.env.OTP_SECRET);
        const otpExpiration = Date.now() + 10 * 60 * 1000;

        // Update user with new OTP, OTP expiration, and resend time
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        user.otpResendTime = Date.now();

        await user.save();

        // Read the HTML email template
        const templatePath = path.join(__dirname, '../views/emailTemplates/verificationEmail.html');
        const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders with actual data
        const formattedEmail = emailTemplate.replace(/{{ firstName }}/g, firstName)
                                            .replace(/{{ lastName }}/g, lastName)
                                            .replace(/{{ otp }}/g, otp);

        // Send email using nodemailer
        const mailOptions = {
            from: 'noreply@infutech.in',
            to: email,
            subject: 'Email Verification',
            html: formattedEmail
        };

        await smtp.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email.');
    }
};


const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                errorMessage: "Invalid credentials.",
            });
        }

        // Check if user already exists
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return res.status(400).json({
                errorMessage: "Email already exists.",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user instance
        const userData = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            is_verified: false,
            userType: 'admin' // Set userType as 'admin' or as per your requirement
        });

        // Save user to database
        await userData.save();

        // Generate access token for the newly registered user
        const token = jwt.sign({ userId: userData._id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        await sendVerifymail(firstName, lastName, email, userData._id);

        // Respond with token and success message
        res.json({ token, message: "User registered successfully. Verification email sent." });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ errorMessage: "Something went wrong." });
    }
};


const verifyMail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ errorMessage: "User not found." });
        }

        // Check if OTP matches and is within validity period
        if (user.otp !== otp || user.otpExpiration < new Date()) {
            return res.status(400).json({ errorMessage: "Invalid or expired OTP." });
        }

        // Update user document to mark email as verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpiration = null;
        user.otpVerifiedAt = new Date(); // Set timestamp when OTP is verified
        await user.save();

        res.json({ message: "Email verified successfully." });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ errorMessage: "Something went wrong." });
    }
};
const resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ errorMessage: "User not found" });
      }
  
      // Generate new OTP
      const otp = generateOTP();
  
      // Update user document with new OTP and resend time
      user.otp = otp;
      user.otpExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes validity
      user.otpResendTime = Date.now();
  
      await user.save();
  
      // Send OTP via email
      await sendVerifymail(user.firstName, user.lastName, user.email, user._id, otp);
  
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Error in resendOTP:", error);
      res.status(500).json({ errorMessage: "Failed to resend OTP" });
    }
  };

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errorMessage: "Invalid credentials" });
        }

        const userDetails = await User.findOne({ email: email });
        if (!userDetails) {
            return res.status(404).json({ errorMessage: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, userDetails.password);
        if (!passwordMatch) {
            return res.status(400).json({ errorMessage: "Invalid credentials" });
        }

        if (!userDetails.isVerified) {
            return res.status(400).json({ errorMessage: "Please verify your email first." });
        }

        const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: "User logged in successfully" });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ errorMessage: "Something went wrong" });
    }
};

module.exports = { registerUser, loginUser, verifyMail,resendOTP };
