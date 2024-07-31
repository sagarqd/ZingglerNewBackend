const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const courseSchema = mongoose.Schema({
  courses_id: {
    type: String,
    unique: true,
    default: uuidv4 // Generates a unique ID for each new document
  },
  general: {
    courseInformation: {
      courseFullName: { type: String },
      courseShortName: { type: String },
      courseIdNumber: { type: String , unique: true },
      teacherName: { type: String},
      avatar: { type: String}
    },
    advanceSettings: {
      downloadCourse: { type: String, enum: ["yes", "no"], default: "no" },
      courseVisibility: { type: String, enum: ["yes", "no"], default: "yes" },
      selectCourse: { type: String, enum: ['web development', 'digital marketing', 'application development', 'graphic designing'] }
    },
  },
  description: {
    courseDescription: { type: String },
    thumbnail: { 
      courseThumbnail: { type: String }, // Changed this to a string
      courseVideo: { type: String }
    }
  },
  format: {
    courseFormat: {
      type: String,
      enum: ["Custom Section", "Weekly Section", "Single Activity", "Social"],
    },
    courseLayout: {
      type: String,
      enum: ["Show all sections on one page", "show one section per page"],
    },
    hiddenSection: {
      type: String,
      enum: [
        "Hidden sections are not shown as not available",
        "Hidden sections are completely invisible",
      ],
    },
    numberOfSections: { type: Number, default: 0 },
  },
  appearance: {
    courseAppearance: {
      type: String, // Adjusted to String type
      enum: ["none", "classic", "boost"], // Enum values for valid strings
    },
    language: {
      type: String,
      enum: ["english", "english(UK)", "german", "french"],
    },
    showActivityDates: { type: String, enum: ["yes", "no"] },
    showGradeBook: { type: String, enum: ["yes", "no"] },
    numberOfAnnouncements: { type: Number, default: 0 },
  },
  completion: {
    courseCompletion: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    enableCompletionTracking: { type: String, enum: ["yes", "no"] },
    showActivityCompletionConditions: { type: String, enum: ["yes", "no"] },
  },
  group: {
    courseGroup: {
      type: String,
      enum: ["no group", "separate group", "visible group"],
    },
    forcedGroupMode: { type: String, enum: ["yes", "no"] },
    tags: { type: String, enum: ["basic", "intermediate", "advance"] },
  },
}, {
  timestamps: true, // Add timestamp fields automatically
});

module.exports = mongoose.model("Course", courseSchema);
