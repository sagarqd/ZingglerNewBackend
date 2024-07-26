const express = require('express');
const router = express.Router();
const profileController=require('../controller/profile');

// Routes
router.post('/profiles', profileController.createProfile);
router.get('/profiles', profileController.getProfiles);
router.put('/profiles/:id', profileController.updateProfile);
router.delete('/profiles/:id', profileController.deleteProfile);

module.exports = router;