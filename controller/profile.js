const Profile = require('../models/profile');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Nodemailer setup (SMTP configuration)
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: 'Test1234@*#'
  }
});


// GET /api/profiles - Get all profiles
const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
  }
};


// POST /api/profiles - Create a new profile
const createProfile = async (req, res) => {
  const { firstName, lastName, email, country, mobileNo,password ,avatar,group} = req.body;
  
  try {
  

    // Create a new profile
    const newProfile = await Profile.create({ firstName, lastName, email, country, mobileNo, password,avatar,group });

    // Send email to the user
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Our Platform',
      text: `Hello ${firstName},\n\nThank you for connecting with us.\n\nYour email is: ${email}\n\nYour password is: ${password}\n\nBest regards,\nThe Platform Team`
    };

    await smtpTransport.sendMail(mailOptions);

    res.status(201).json(newProfile);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
      return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
    }
    res.status(400).json({ message: 'Failed to create profile', error: error.message });
  }
};


// PUT /api/profiles/:id - Update a profile by id
const updateProfile = async (req, res) => {
  const { id } = req.params;
  const profile = req.body;
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(id, profile, { new: true });
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
};

// DELETE /api/profiles/:id - Delete a profile by id
const deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProfile = await Profile.findByIdAndDelete(id);
    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete profile', error: error.message });
  }
};

module.exports = { getProfiles, createProfile, updateProfile, deleteProfile };
