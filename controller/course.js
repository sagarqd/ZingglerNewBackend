const Course = require("../models/course");
const upload = require("../middlewares/multerConfig");
const slugify = require('slugify');
const User= require('../models/user');

// CREATE a new course
async function createCourse(req, res) {
  try {
    // Initialize file paths as undefined
    let thumbnailFile;
    let videoFile;

    // Check if files are present in req.files and set file paths
    if (req.files && req.files["thumbnail"]) {
      thumbnailFile = `/uploads/${req.files["thumbnail"][0].filename}`;
    }
    if (req.files && req.files["video"]) {
      videoFile = `/uploads/${req.files["video"][0].filename}`;
    }

    // Construct the course data object
    const courseData = {
      ...req.body,
      description: {
        ...req.body.description,
        thumbnail: {
          courseThumbnail: thumbnailFile,
          courseVideo: videoFile,
        },
      },
      slug: slugify(req.body.general.courseInformation.courseFullName, { lower: true, strict: true }),
      createdBy: req.body.createdBy,
    };

    let status = determineStatus(courseData);

    // Check if this is the final submission
    if (req.body.isFinal === 'true') {
      status = 'completed';
    }

    const courseDataWithStatus = { ...courseData, status };

    // Create a new course document
    const course = new Course(courseDataWithStatus);
    await course.save();

    // Respond with the created course document
    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error.message);
    res.status(500).json({
      message: "Error creating course",
      error: error.message,
    });
  }
}

// READ all courses
async function getAllCourses(req, res) {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err.message); // Log error details
    res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
}

// READ one course by ID
async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err.message); // Log error details
    res.status(500).json({ message: "Error fetching course", error: err.message });
  }
}

//Read one course by Slug
async function getCourseBySlug(req,res){
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err.message); // Log error details
    res.status(500).json({ message: "Error fetching course", error: err.message });
  }
}

// Get all courses created by the current user
const getMyCourses = async (req, res) => {
  try {
      // Fetch all courses where createdBy matches the current user's ID
      const myCourses = await Course.find({ createdBy: req.body.userId });

      // Return the list of courses
      res.status(200).json(myCourses);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// UPDATE a course by ID with file handling
const updateCourseById = async (req, res) => {
  try {
    let thumbnailFile, videoFile;

    if (req.files && req.files['thumbnail']) {
      thumbnailFile = `/uploads/${req.files['thumbnail'][0].filename}`;
    }
    if (req.files && req.files['video']) {
      videoFile = `/uploads/${req.files['video'][0].filename}`;
    }

    const description = req.body.description ? JSON.parse(req.body.description) : {};

    const {
      hiddenSection,
      courseLayout,
      courseSection,
      typeOfActivity,
      noOfSection
    } = req.body;

    const {
      theme,
      showReportActivity,
      showGradeBook,
      language,
      showActivityDates,
      noOfAnnouncement
    } = req.body;

    const {
      enableCompletionTracking,
      showActivityCompletionConditions
    } = req.body;

    const {
      groupMode,
      forcedGroupMode,
      tags,
      numberOfAnnouncement
    } = req.body;

    // Handle courseSections
    let courseSections = [];
    if (req.body.courseSections) {
      try {
        courseSections = JSON.parse(req.body.courseSections);
      } catch (error) {
        console.error("Error parsing courseSections:", error.message);
        return res.status(400).json({ message: "Invalid courseSections format" });
      }
    } else {
      // If courseSections is not provided, use the existing one
      const existingCourse = await Course.findById(req.params.id);
      if (!existingCourse) {
        console.log('Course not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Course not found' });
      }
      courseSections = existingCourse.courseSections || [];
    }

    const status = req.body.isFinal === 'true' ? 'completed' : determineStatus(req.body);

    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      console.log('Course not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Course not found' });
    }

    const updateData = {
      ...existingCourse.toObject(),
      format: {
        hiddenSection: hiddenSection || existingCourse.format.hiddenSection,
        courseLayout: courseLayout || existingCourse.format.courseLayout,
        courseSection: courseSection || existingCourse.format.courseSection,
        typeOfActivity: typeOfActivity || existingCourse.format.typeOfActivity,
        noOfSection: noOfSection || existingCourse.format.noOfSection,
      },
      appearance: {
        theme: theme || existingCourse.appearance.theme,
        showReportActivity: showReportActivity || existingCourse.appearance.showReportActivity,
        showGradeBook: showGradeBook || existingCourse.appearance.showGradeBook,
        language: language || existingCourse.appearance.language,
        showActivityDates: showActivityDates || existingCourse.appearance.showActivityDates,
        noOfAnnouncement: noOfAnnouncement || existingCourse.appearance.noOfAnnouncement,
      },
      completion: {
        enableCompletionTracking: enableCompletionTracking || existingCourse.completion.enableCompletionTracking,
        showActivityCompletionConditions: showActivityCompletionConditions || existingCourse.completion.showActivityCompletionConditions,
      },
      group: {
        groupMode: groupMode || existingCourse.group.groupMode,
        forcedGroupMode: forcedGroupMode || existingCourse.group.forcedGroupMode,
        tags: tags || existingCourse.group.tags,
        numberOfAnnouncement: numberOfAnnouncement || existingCourse.group.numberOfAnnouncement,
      },
      description: {
        ...existingCourse.description,
        ...description,
        thumbnail: {
          courseThumbnail: thumbnailFile || existingCourse.description?.thumbnail?.courseThumbnail,
          courseVideo: videoFile || existingCourse.description?.thumbnail?.courseVideo,
        }
      },
      courseSections: courseSections, // Update courseSections
      status // Update the status
    };

    if (req.body.general && req.body.general.courseInformation && req.body.general.courseInformation.courseFullName) {
      updateData.slug = slugify(req.body.general.courseInformation.courseFullName, { lower: true, strict: true });
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updatedCourse) {
      console.log('Update failed for course ID:', req.params.id);
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating course:', err.message);
    res.status(500).json({ message: 'Error updating course', error: err.message });
  }
};


// Helper function to determine status based on completion criteria
const determineStatus = (body) => {
  // Conditions to check if all necessary fields are filled
  const isCompletionTrackingEnabled = body.enableCompletionTracking === 'Yes';
  const isActivityCompletionConditionsShown = body.showActivityCompletionConditions === 'Yes';
  const isCourseInformationComplete = body.general && body.general.courseInformation && body.general.courseInformation.courseFullName && body.general.courseInformation.courseShortName;
  const isDescriptionComplete = body.description && body.description.courseDescription && body.description.thumbnail && body.description.thumbnail.courseThumbnail && body.description.thumbnail.courseVideo;
  const isFormatComplete = body.format && body.format.hiddenSection && body.format.courseLayout&&body.format.typeOfActivity && body.format.courseSection;
  const isAppearanceComplete = body.appearance && body.appearance.theme && body.appearance.showReportActivity && body.appearance.showGradeBook && body.appearance.language && body.appearance.noOfAnnouncement !== undefined;
  const isGroupComplete = body.group && body.group.groupMode && body.group.tags;

  // Return 'completed' if all conditions are met, otherwise 'draft'
  return (
    isCompletionTrackingEnabled &&
    isActivityCompletionConditionsShown &&
    isCourseInformationComplete &&
    isDescriptionComplete &&
    isFormatComplete &&
    isAppearanceComplete &&
    isGroupComplete
  ) ? 'completed' : 'draft';
};

// DELETE a course by ID
async function deleteCourseById(req, res) {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err.message); // Log error details
    res.status(500).json({ message: "Error deleting course", error: err.message });
  }
}

const getNoOfSections = async (req, res) => {
  try {
      const course = await Course.findOne({ courseId: req.params.id });
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }

      // Extract noOfSection from the format field
      const noOfSection = course.format.noOfSection;
      res.json({ noOfSection });
  } catch (error) {
      console.error('Error fetching course data:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
  getCourseBySlug,
  getNoOfSections,
  getMyCourses
};
