// controllers/teacherController.js

const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs for teacher_id
require('dotenv').config();

// Register Teacher

const registerTeacher = async (req, res) => {
    try {
        console.log(req.body)
        const { firstName, lastName, email, country, mobileNo, password, role, gender } = req.body;

        // Check if teacher already exists by email
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ errorMessage: 'Teacher with this email already exists.' });
        }

        // Get the uploaded profile picture, if provided
        let profilePic = req.file ? req.file.path : null; // Use req.file.path for the full file path

        // Prepare the teacher data
        const teacherData = {
            firstName,
            lastName,
            email,
            country,
            mobileNo,
            password,  // Password will be hashed before saving
            role,
            gender,
            profilePic  // Assign profilePic if uploaded
        };

        // Create new teacher instance
        const newTeacher = new Teacher(teacherData);

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        newTeacher.password = await bcrypt.hash(password, salt);

        // Save the teacher to the database
        await newTeacher.save();

        // Generate JWT token for authentication
        const token = jwt.sign(
            { teacherId: newTeacher.teacher_id, email: newTeacher.email }, // Payload
            process.env.JWT_SECRET,  // Use your secret key from the .env file
            { expiresIn: '1h' } // Token expiry time
        );

        // Respond with the teacher details and token
        res.status(201).json({
            message: 'Teacher registered successfully.',
            token,
            teacher: {
                teacher_id: newTeacher.teacher_id,  // Unique teacher ID
                firstName: newTeacher.firstName,
                lastName: newTeacher.lastName,
                email: newTeacher.email,
                country: newTeacher.country,
                mobileNo: newTeacher.mobileNo,
                role: newTeacher.role,
                gender: newTeacher.gender,
                profilePic: newTeacher.profilePic  // Include the profile picture if it exists
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

// Get Teacher Details by id
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

// Get All Teachers
const getAllTeachers = async (req, res) => {
   
    try {
        const teachers = await Teacher.find(); // Fetch all teachers from the database
        res.json(teachers); // Return the list of teachers
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
    console.log(getAllTeachers)
};

// Delete Teacher by ID
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.teacherId);
        if (!teacher) {
            return res.status(404).json({ errorMessage: 'Teacher not found' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Update Teacher by ID
const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const updates = req.body;

        // Agar profilePic update hui hai to uska path handle karein
        if (req.file) {
            updates.profilePic = req.file.path;
        }

        // Find teacher by ID and update with new data
        const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, updates, { new: true });

        // Agar teacher nahi mila to 404 error
        if (!updatedTeacher) {
            return res.status(404).json({ errorMessage: 'Teacher not found.' });
        }

        res.json({
            message: 'Teacher updated successfully.',
            teacher: updatedTeacher  // Return updated teacher details
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};


module.exports = { registerTeacher, loginTeacher, getTeacherDetails, getAllTeachers, deleteTeacher, updateTeacher };



