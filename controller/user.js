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
        const otp = otplib.authenticator.generate(process.env.OTP_SECRET);
        const otpExpiration = Date.now() + 10 * 60 * 1000;

        await User.findByIdAndUpdate(user_id, { otp, otp_expiration: otpExpiration });

        const mailOptions = {
            from: 'noreply@infutech.in',
            to: email,
            subject: 'Email Verification',
            text: `Dear ${firstName} ${lastName},\n\nPlease verify your email by using the following OTP: ${otp}\n\nThank you!`
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

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                errorMessage: "Invalid credentials.",
            });
        }

        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return res.status(400).json({
                errorMessage: "Email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            is_verified: false,
            userType: 'admin' // Set userType as 'admin' or as per your requirement
        });

        await userData.save();

        await sendVerifymail(firstName, lastName, email, userData._id);

        res.json({ message: "User registered successfully. Verification email sent." });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ errorMessage: "Something went wrong." });
    }
};

const verifyMail = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ errorMessage: "User not found" });
        }

        if (user.otp !== otp || user.otp_expiration < Date.now()) {
            return res.status(400).json({ errorMessage: "Invalid or expired OTP." });
        }

        user.is_verified = true;
        user.otp = null;
        user.otp_expiration = null;
        user.otp_verified_at = new Date(); // Set the timestamp when OTP is verified
        await user.save();

        res.json({ message: "Email verified successfully." });
    } catch (error) {
        console.error("Error in verifyMail:", error);
        res.status(500).json({ errorMessage: "Something went wrong" });
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

        if (!userDetails.is_verified) {
            return res.status(400).json({ errorMessage: "Please verify your email first." });
        }

        const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: "User logged in successfully" });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ errorMessage: "Something went wrong" });
    }
};

module.exports = { registerUser, loginUser, verifyMail };
