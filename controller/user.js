const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otplib = require('otplib');
require('dotenv').config();

// Configure the SMTP transporter
const smtp = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER, // Your SMTP username from .env
        pass: "Test1234@*#"  // Your SMTP password from .env
    }
});

const sendVerifymail = async (firstName, lastName, email, user_id) => {
    try {
        // Assuming 'email' is a field in your User schema
        let user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.otpResendTime && (Date.now() - user.otpResendTime < 60000)) {
            throw new Error('Please wait before requesting another verification code');
        }

        const otp = otplib.authenticator.generate(process.env.OTP_SECRET);
        const otpExpiration = Date.now() + 10 * 60 * 1000;

        user.otp = otp;
        user.otpExpiration = otpExpiration;
        user.otpResendTime = Date.now();

        await user.save();

        const templatePath = path.join(__dirname, '../views/emailTemplates/verificationEmail.html');
        const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

        const formattedEmail = emailTemplate.replace(/{{ firstName }}/g, firstName)
                                            .replace(/{{ lastName }}/g, lastName)
                                            .replace(/{{ otp }}/g, otp);

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


// Function to register a new user
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ errorMessage: 'Invalid credentials.' });
        }

        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return res.status(400).json({ errorMessage: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isVerified: false,
            userType: 'admin'
        });

        await userData.save();

        const token = jwt.sign({ userId: userData._id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendVerifymail(firstName, lastName, email, userData._id);

        res.json({ token, message: 'User registered successfully. Verification email sent.' });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ errorMessage: 'Something went wrong.' });
    }
};

// Function to register a new student
const registerStudent = async (req, res) => {
    try {
        const {
            fullName,
            gender,
            userName,
            dateOfBirth,
            contactNumber,
            email,
            emergencyContact,
            address,
            matriculation,
            intermediate,
            bachelorDegree,
            enrollmentDate,
            courseName,
            academicLevel,
            studentAvatar,
            password
        } = req.body;

        if (!fullName || !gender || !userName || !dateOfBirth || !contactNumber || !email || !emergencyContact || !address || !matriculation || !intermediate || !bachelorDegree || !enrollmentDate || !courseName || !academicLevel || !password) {
            return res.status(400).json({ errorMessage: 'All fields are required.' });
        }

        // Check if email already exists in User model
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return res.status(400).json({ errorMessage: 'Email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user data
        const userData = new User({
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' '),
            email,
            password: hashedPassword,
            userType: 'student',
            isVerified: true, // Skip verification for students
        });

        await userData.save();

        // Save student data
        const studentData = new Student({
            student_id: userData._id,
            fullName,
            gender,
            userName,
            dateOfBirth,
            contactNumber,
            email,
            emergencyNumber: emergencyContact,
            address,
            matriculation,
            intermediate,
            bachelorDegree,
            enrollmentDate,
            courseName,
            academicLevel,
            studentAvatar, // Assuming this is the path to the uploaded image
            userType: 'student',
        });

        await studentData.save();

        // Send credentials email
        await sendCredentialsMail(fullName, email, password);

        res.json({ message: 'Student registered successfully. Credentials have been sent to the email.' });
    } catch (error) {
        console.error('Error in registerStudent:', error);
        res.status(500).json({ errorMessage: 'Something went wrong.' });
    }
};


const sendCredentialsMail = async (firstName, lastName, email, password) => {
    try {
        const templatePath = path.join(__dirname, '../views/emailTemplates/credentialsEmail.html');
        const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

        const formattedEmail = emailTemplate.replace(/{{ firstName }}/g, firstName)
                                            .replace(/{{ lastName }}/g, lastName)
                                            .replace(/{{ email }}/g, email)
                                            .replace(/{{ password }}/g, password);

        const mailOptions = {
            from: 'noreply@infutech.in',
            to: email,
            subject: 'Your Credentials',
            html: formattedEmail
        };

        await smtp.sendMail(mailOptions);
        console.log('Credentials email sent');
    } catch (error) {
        console.error('Error sending credentials email:', error);
        throw new Error('Failed to send credentials email.');
    }
};


// Function to verify user's email
const verifyMail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ errorMessage: 'User not found.' });
        }

        if (user.otp !== otp || user.otpExpiration < new Date()) {
            return res.status(400).json({ errorMessage: 'Invalid or expired OTP.' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiration = null;
        user.otpVerifiedAt = new Date();

        await user.save();

        res.json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Error in verifyMail:', error);
        res.status(500).json({ errorMessage: 'Something went wrong.' });
    }
};

// Function to resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        if (user.otpResendTime && (Date.now() - user.otpResendTime < 60000)) {
            return res.status(400).json({ errorMessage: 'Please wait before requesting another verification code.' });
        }

        const otp = otplib.authenticator.generate(process.env.OTP_SECRET);
        user.otp = otp;
        user.otpExpiration = Date.now() + 10 * 60 * 1000;
        user.otpResendTime = Date.now();

        await user.save();

        await sendVerifymail(user.firstName, user.lastName, user.email, user._id);

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error in resendOTP:', error);
        res.status(500).json({ errorMessage: 'Failed to resend OTP' });
    }
};

// Function to log in user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }

        const userDetails = await User.findOne({ email });
        if (!userDetails) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, userDetails.password);
        if (!passwordMatch) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }

        if (!userDetails.isVerified) {
            return res.status(400).json({ errorMessage: 'Please verify your email first.' });
        }

        const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'User logged in successfully' });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ errorMessage: 'Something went wrong' });
    }
};

// Function to log in student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }

        const userDetails = await User.findOne({ email });
        if (!userDetails) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, userDetails.password);
        if (!passwordMatch) {
            return res.status(400).json({ errorMessage: 'Invalid credentials' });
        }

        if (!userDetails.isVerified) {
            return res.status(400).json({ errorMessage: 'Please verify your email first.' });
        }

        const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Student logged in successfully' });
    } catch (error) {
        console.error('Error in loginStudent:', error);
        res.status(500).json({ errorMessage: 'Something went wrong' });
    }
};


// Add this to your backend (e.g., user.js controller)
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        res.json({ firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ errorMessage: 'Something went wrong' });
    }
};


module.exports = { registerUser, registerStudent, loginUser, loginStudent, verifyMail, resendOTP, getUserDetails };
