const Group = require('../models/group');

// POST /groups - Create a new group
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if the group being created is "Admin", "Educator", or "Student"
        if (name === 'Admin' || name === 'Educator' || name === 'Student') {
            // Handle special logic for these groups (e.g., special validation or restrictions)
            // For now, simply create the group
            const newGroup = await Group.create(req.body);
            return res.status(201).json(newGroup);
        } else {
            // For other groups, allow normal creation
            const newGroup = await Group.create(req.body);
            return res.status(201).json(newGroup);
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /groups - Get all groups
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /groups/:id - Get a group by ID
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /groups/:id - Update a group by ID
const updateGroupById = async (req, res) => {
    try {
        const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(updatedGroup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /groups/:id - Delete a group by ID
const deleteGroupById = async (req, res) => {
    try {
        const groupToDelete = await Group.findById(req.params.id);
        if (!groupToDelete) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the group is "Admin", "Educator", or "Student"
        if (groupToDelete.name === 'Admin' || groupToDelete.name === 'Educator' || groupToDelete.name === 'Student') {
            return res.status(403).json({ message: 'Cannot delete the group. Only editing is allowed for "Admin", "Educator", and "Student" groups.' });
        } else {
            const deletedGroup = await Group.findByIdAndDelete(req.params.id);
            if (!deletedGroup) {
                return res.status(404).json({ message: 'Group not found' });
            }
            res.json({ message: 'Group deleted successfully' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createGroup, getAllGroups, getGroupById, updateGroupById, deleteGroupById };
