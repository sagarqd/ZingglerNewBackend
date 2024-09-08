const User=require('../models/user');
const EnrolledStudents = require('../models/enrolledstudents');
const Student = require('../models/student');
const Course = require('../models/course');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER, // Your SMTP username from .env
        pass: "Test1234@*#"  // Your SMTP password from .env
    }
});

// Create student
exports.addStudent = async (req, res) => {
    try {
        const {email, password, fullName, gender, userName, dateOfBirth, contactNumber, emergencyNumber, address, matriculation, intermediate, bachelorDegree, courseName, academicLevel, enrollmentDate } = req.body;

        const studentAvatar = req.file ? req.file.path : null;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Split fullName into firstName and lastName if needed
        const [firstName, lastName] = fullName.split(' ');

        // Create and save the user with role 'student'
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            userType: 'student'
        });

        const savedUser = await newUser.save();

        // Create and save the student info
        const newStudent = new Student({
            student_id: savedUser._id,
            fullName, // Using fullName directly
            gender,
            userName,
            dateOfBirth,
            password: hashedPassword, // Use the hashed password
            contactNumber,
            email,
            emergencyNumber,
            address,
            matriculation,
            intermediate,
            bachelorDegree,
            enrollmentDate,
            courseName,
            academicLevel,
            studentAvatar
        });

        await newStudent.save();

        const mailOptions = {
            from: process.env.SMTP_USER, // sender address
            to: email, // list of receivers
            subject: 'Welcome to Our Institution', // Subject line
            html: `
                <h1>Welcome, ${fullName}!</h1>
                <p>Thank you for registering as a student. Below are your account details:</p>
                <ul>
                    <li><strong>Username:</strong> ${userName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                </ul>
                <p>Please keep your password secure. If you have any questions, feel free to contact us.</p>
                <p>Best regards,<br>Zinggerr Team</p>
            ` // HTML body content

         };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add student', details: error.message });
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
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find(); // Retrieve all students from the database
        res.status(200).json(students); // Send the list of students as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
};

exports.enrollStudent = async (req, res) => {
    const { studentId, courseId } = req.body;

    try {
        // Fetch the student by studentId
        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch the course by courseId
        const course = await Course.findOne({ _id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch the logged-in admin's userType from the database
        const adminUser = await User.findById(req.user.userId); // Assuming req.user contains the logged-in user's info
        if (!adminUser || adminUser.userType !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Create a new enrolled student entry
        const newEnrollment = new EnrolledStudents({
            studentId,
            courseId,
            enrolledBy: adminUser.userType, // Admin's userType
            enrollmentId: uuidv4(), // Generate a unique enrollmentId
            enrolledId: uuidv4(), // Generate a unique enrolledId
            enrollmentDate: new Date(), // Current date and time
        });

        // Save the enrollment entry to the database
        const savedEnrollment = await newEnrollment.save();

        // Log the enrollment details
        console.log('Enrollment ID:', savedEnrollment.enrollmentId);
        console.log('Enrolled ID:', savedEnrollment.enrolledId);
        console.log('Student ID:', savedEnrollment.studentId);
        console.log('Course ID:', savedEnrollment.courseId);
        console.log('Enrolled By:', savedEnrollment.enrolledBy);
        console.log('Enrollment Date:', savedEnrollment.enrollmentDate);

        res.status(200).json({ message: 'Student enrolled successfully', enrollment: savedEnrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};