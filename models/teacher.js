const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const teacherSchema = new mongoose.Schema({
    teacher_id: {
        type: String,
        unique: true,
        default: uuidv4 // Automatically generate unique teacher ID
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNo: {
        type: String,  // Changed to string to store phone numbers
        required: true
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    }
});

// Pre-save hook to hash password before saving it to the database
// teacherSchema.pre('save', async function (next) {
//     try {
//         if (!this.isModified('password')) return next(); // Only hash if password is new or modified

//         // Generate salt and hash the password
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         return next(error);
//     }
// });

module.exports = mongoose.model('teacher', teacherSchema);
