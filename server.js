const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoute = require('./router/auth');
const profileRoute = require('./router/profile');
const groupRoute = require('./router/group');
const courseRoute = require('./router/course');
const resetPassword = require('./router/passwordRoutes');
const videoRoute = require('./router/videoRoutes');
const studentRoute= require('./router/studentRoutes');
// Import Course model
const Course = require('./models/course');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('DB connected Successfully'))
  .catch((error) => console.log('DB unable to connect', error));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Express!');
});

// Course route

// Course route
app.get('/api/courses/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
      const course = await Course.findOne({ slug }).exec(); // Use Course model
      if (course) {
        res.json({
          courseFullName: course.general?.courseInformation?.courseFullName || 'Not available',
          courseVideo: course.description?.thumbnail?.courseVideo || 'Not available',
        });
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

// Use route files
app.use('/api/auth', authRoute);
app.use('/api', profileRoute);
app.use('/api', groupRoute);
app.use('/api', courseRoute);
app.use('/api', resetPassword);
app.use('/api/video', videoRoute);
app.use('/api/student', studentRoute);
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});