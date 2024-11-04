// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure uploads directory exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const basename = path.basename(file.originalname, ext);
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `${basename}-${uniqueSuffix}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 5 MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type'), false);
//     }
//   },
// });

// module.exports = upload;


///////////////////////
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure uploads directory exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     let filenameParts = file.originalname.split('.');
//     let [filename, ext] = filenameParts;
//     let timestamp = Date.now(); // Use current timestamp for uniqueness
//     cb(null, `${filename}-${timestamp}.${ext}`);
// },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 5 MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type'), false);
//     }
//   },
// });

// module.exports = upload;



// upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    let filenameParts = file.originalname.split('.');
    let [filename, ext] = filenameParts;
    let timestamp = Date.now(); // Use current timestamp for uniqueness
    const newFilename = `${filename}-${timestamp}.${ext}`; // Create new filename
    cb(null, newFilename); // Call the callback with the new filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Export the upload middleware
module.exports = upload;
