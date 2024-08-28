const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

const courseSchema = mongoose.Schema(
  {
    courseId: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },

    general: {
      courseInformation: {
        courseFullName: { type: String },
        courseShortName: { type: String },
        courseIdNumber: { type: String },
      },
      advanceSettings: {
        downloadCourse: { type: String, default: "no" },
        courseVisibility: { type: String, default: "yes" },
        selectCourse: { type: String },
      },
    },
    description: {
      courseDescription: { type: String },
      thumbnail: {
        courseThumbnail: { type: String },
        courseVideo: { type: String },
      },
    },
    format: {
      hiddenSection: {
        type: String,
      },
      courseLayout: {
        type: String,
      },
      courseSection: {
        type: String,
      },
      typeOfActivity:{
        type:String
      },
      noOfSection: { type: Number, default: 0 },
    },
    courseSections:{
      sectionTitle: {type: String},
      contentType:{type: String},
      blogUrl:{type: String},
    },
    appearance: {
      theme: {
        type: String,
      },
      showReportActivity: {
        type: String,
      },
      showGradeBook: { type: String },
      language: { type: String },
      showActivityDates: { type: String },
      noOfAnnouncement: { type: Number, default: 0 },
    },
    completion: {
      enableCompletionTracking: { type: String },
      showActivityCompletionConditions: { type: String },
    },
    group: {
      groupMode: {
        type: String,
      },
      forcedGroupMode: { type: String },
      tags: { type: String }, // Corrected enum value
      numberOfAnnouncement: { type: Number },
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft", // Default to draft if not specified
    },
  },
  {
    timestamps: true, // Add timestamp fields automatically
  }
);

// Pre-save hook to generate slug
courseSchema.pre("save", async function (next) {
  if (
    this.isModified("general.courseInformation.courseFullName") ||
    this.isNew
  ) {
    // Generate slug
    let slug = slugify(this.general.courseInformation.courseFullName, {
      lower: true,
      strict: true,
    });

    // Check for uniqueness
    const existingCourse = await mongoose.models.Course.findOne({ slug });
    if (existingCourse) {
      slug = `${slug}-${Date.now()}`; // Append a timestamp to make it unique
    }

    this.slug = slug;
  }
  // Set status to 'completed' if all required fields are present
  const allRequiredFieldsPresent =
    this.general.courseInformation.courseFullName &&
    this.general.courseInformation.courseShortName &&
    this.general.courseInformation.courseIdNumber &&
    this.description.courseDescription &&
    this.format.courseLayout &&
    this.appearance.theme;

  if (allRequiredFieldsPresent) {
    this.status = "completed";
  }else {
    console.log('Status is draft. Missing required fields.');
  }

  next();
});

module.exports = mongoose.model("Course", courseSchema);
