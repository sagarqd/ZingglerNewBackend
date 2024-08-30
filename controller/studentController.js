const Student = require('../models/student');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    connectionTimeout: 10000, // 10 seconds
    debug: true
});
// Create student
exports.registerStudent = async (req, res) => {
    const { fullName, gender, userName, dateOfBirth, password, contactNumber, email, emergencyNumber, address, matriculation, intermediate, bachelorDegree, enrollmentDate, courseName, academicLevel, studentAvatar } = req.body;

    try {
        // Check if email or username already exists
        const existingStudent = await Student.findOne({ $or: [{ email }, { userName }] });
        if (existingStudent) {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const newStudent = new Student({
            fullName,
            gender,
            userName,
            dateOfBirth,
            password: hashedPassword,
            contactNumber,
            email,
            emergencyNumber,
            address,
            matriculation,
            intermediate,
            bachelorDegree,
            enollmentDate,
            courseName,
            academicLevel,
            studentAvatar
            isVerified: true // Skip verification and set as verified
        });

        // Save student
        await newStudent.save();

        // Send email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: newStudent.email,
            subject: 'Your Registration Details',
            text: `Hello ${newStudent.fullName},\n\nYour account has been created successfully.\n\nUsername: ${newStudent.userName}\nPassword: ${password}\n\nPlease keep these credentials safe.\n\nBest regards,\nThe Team`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        res.status(201).json({ message: 'Student registered successfully and email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
    exports.loginStudent = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ errorMessage: 'Invalid credentials' });
            }

            const userDetails = await User.findOne({ email, userType: 'student' });
            if (!userDetails) {
                return res.status(404).json({ errorMessage: 'Student not found' });
            }

            const passwordMatch = await bcrypt.compare(password, userDetails.password);
            if (!passwordMatch) {
                return res.status(400).json({ errorMessage: 'Invalid credentials' });
            }

            // Skip isVerified check for students
            if (userDetails.userType === 'student') {
                // No check for isVerified for students
            } else if (!userDetails.isVerified) {
                return res.status(400).json({ errorMessage: 'Please verify your email first.' });
            }

            const token = jwt.sign(
                { userId: userDetails._id, email: userDetails.email, userType: userDetails.userType },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                token,
                userId: userDetails._id,
                email: userDetails.email,
                userType: userDetails.userType,
                message: 'Student logged in successfully',
            });
        } catch (error) {
            console.error('Error in loginStudent:', error);
            res.status(500).json({ errorMessage: 'Something went wrong' });
        }
    };
};
