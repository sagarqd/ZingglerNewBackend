const express = require('express');
const router = express.Router();
const groupController = require('../controller/group');   // eslint-disable-line

// Routes
router.post('/groups', groupController.createGroup);
router.get('/groups', groupController.getAllGroups);
router.get('/groups/:id', groupController.getGroupById);
router.put('/groups/:id', groupController.updateGroupById);
router.delete('/groups/:id', groupController.deleteGroupById);

module.exports = router;
