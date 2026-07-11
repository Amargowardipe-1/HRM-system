const mongoose = require("mongoose");
const {
  JOB_STATUS,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
} = require("./job.constants");

const jobSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },

    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      default: EMPLOYMENT_TYPE.FULL_TIME,
    },

    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVEL),
      default: EXPERIENCE_LEVEL.FRESHER,
    },

    // Description
    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Experience
    minExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxExperience: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Salary
    minSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    // AI Settings
    aiInterviewEnabled: {
      type: Boolean,
      default: true,
    },

    interviewExpiryHours: {
      type: Number,
      default: 12,
    },

    // Workflow
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.DRAFT,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    applicationCount: {
      type: Number,
      default: 0,
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ title: "text", description: "text", requiredSkills: "text" });
jobSchema.index({ department: 1 });
jobSchema.index({ designation: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDeadline: 1 });

module.exports = mongoose.model("Job", jobSchema);