// controllers/staffController.js

const Staff = require('../models/staff'); // Assuming Staff model is defined in models/staff.js

// Create a new staff
const addStaff = async (req, res) => {
    try {
        const { staff, contact, email, gender } = req.body;

        const newStaff = new Staff({
            staff,
            contact,
            email,
            gender
        });

        await newStaff.save();

        res.status(201).json({ message: 'Staff added successfully', staff: newStaff });
    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Get all staff
const getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find();
        res.json(staffList);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Get a single staff by ID
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.staffId);
        if (!staff) {
            return res.status(404).json({ errorMessage: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Update staff by ID
const updateStaff = async (req, res) => {
    try {
        const updates = req.body;
        const staff = await Staff.findByIdAndUpdate(req.params.staffId, updates, { new: true });
        
        if (!staff) {
            return res.status(404).json({ errorMessage: 'Staff not found' });
        }

        res.json({ message: 'Staff updated successfully', staff });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

// Delete staff by ID
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.Id);
        if (!staff) {
            return res.status(404).json({ errorMessage: 'Staff not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ errorMessage: 'Server error. Please try again later.' });
    }
};

module.exports = { addStaff, getAllStaff, updateStaff,getStaffById, deleteStaff };
