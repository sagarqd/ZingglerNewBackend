const express = require('express');
const router = express.Router();
const { addStaff, getAllStaff, getStaffById, updateStaff, deleteStaff } = require('../controller/staff')




// Route to create a new staff member
router.post('/create', addStaff);

// Route to get all staff members
router.get('/list', getAllStaff);

// Route to get a single staff member by ID
router.get('/:staffId', getStaffById);

// Route to update a staff member by ID
router.put('/update/:staffId', updateStaff);

// Route to delete a staff member by ID
router.delete('/delete/:Id', deleteStaff);


module.exports = router;