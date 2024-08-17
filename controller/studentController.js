const Student = require('../models/student');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
    const { fullName, gender, userName, dateOfBirth, password, contactNumber, email, emergencyNumber, address, matriculation, intermediate, bachelorDegree, enollmentDate, courseName, academicLevel, studentAvatar } = req.body;

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

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Student registered successfully and email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
