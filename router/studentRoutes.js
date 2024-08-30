const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const multer = require('multer');
const { registerStudent } = require('../controller/user');

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname); // Rename the file to avoid conflicts
    }
});

const upload = multer({ storage: storage });

// Define the route with file upload handling
router.post('/register', upload.single('studentAvatar'), registerStudent);
=======
const upload=require('../middlewares/multerConfig')
const studentController = require('../controller/studentController');

router.post('/add-student', upload.single('studentAvatar'), studentController.addStudent);
router.post('/enroll',studentController.enrollStudent);
>>>>>>> Stashed changes

module.exports = router;
