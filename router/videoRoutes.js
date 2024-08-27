const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadVideo, streamVideo, convertVideoFormat, generateVideoThumbnail, fetchAllVideo, fetchVideoByID } = require('../controller/videoController');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload video
router.post('/upload', upload.single('file'), uploadVideo);

// FetchAll the videos
router.get('/fetchVideos',fetchAllVideo);

// Ferch By Id
router.get('/fetchById/:id',fetchVideoByID);


// Stream video
router.get('/:filename', streamVideo);

// Convert video format
router.get('/convert/:filename/:format', convertVideoFormat);

// Generate video thumbnail
router.get('/thumbnail/:filename', generateVideoThumbnail);

module.exports = router;
