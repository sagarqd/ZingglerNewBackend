const mongoose = require('mongoose');


const staffSchema = new mongoose.Schema({
    staff_id: {
        type: String,
        ref: 'staffs',
        auto: true  // Automatically generates an ObjectId
    },
    staff: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    gender: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);
