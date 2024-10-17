// controllers/teacherController.js

const Teacher = require('../models/teacher'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs for teacher_id
require('dotenv').config();

// Register Teacher
const registerTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, country, mobileNo, password, role, gender } = req.body;

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ errorMessage: 'Teacher with this email already exists.' });
        }

        // Create new teacher
        const newTeacher = new Teacher({
            teacher_id: uuidv4(), // Generate a unique ID for teacher
            firstName,
            lastName,
            email,
            country,
            mobileNo,
            password,
            role,
            gender
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        newTeacher.password = await bcrypt.hash(password, salt);

        await newTeacher.save();

        // Create JWT token
        const token = jwt.sign({ teacherId: newTeacher._id, email: newTeacher.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(201).json({
            message: 'Teacher registered successfully.',
            token,
            teacher: {
                teacher_id: newTeacher.teacher_id,
                firstName: newTeacher.firstName,
                lastName: newTeacher.lastName,
                email: newTeacher.email,
                country: newTeacher.country,
                mobileNo: newTeacher.mobileNo,
                role: newTeacher.role,
                teacher: newTeacher.gender
            }
        });
    } catch (error) {
        console.error('Error registering teacher:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Teacher Login
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find teacher by email
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ errorMessage: 'Teacher not found.' });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ errorMessage: 'Invalid credentials.' });
        }

        // Create JWT token
        const token = jwt.sign({ teacherId: teacher._id, email: teacher.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({
            message: 'Login successful.',
            token,
            teacher: {
                teacher_id: teacher.teacher_id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                country: teacher.country,
                mobileNo: teacher.mobileNo,
                role: teacher.role,
                gender: teacher.gender
            }
        });
    } catch (error) {
        console.error('Error logging in teacher:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Get Teacher Details
const getTeacherDetails = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.teacherId); // Assuming teacherId is passed as a URL parameter
        if (!teacher) {
            return res.status(404).json({ errorMessage: 'Teacher not found.' });
        }

        res.json({
            teacher: {
                teacher_id: teacher.teacher_id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                country: teacher.country,
                mobileNo: teacher.mobileNo,
                role: teacher.role,
                gender: teacher.gender
            }
        });
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

module.exports = { registerTeacher, loginTeacher, getTeacherDetails };
