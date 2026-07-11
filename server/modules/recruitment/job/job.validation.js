const { body, param, query } = require("express-validator");
const {
  JOB_STATUS,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
} = require("./job.constants");

// Create Job
const createJobValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Job title must be between 3 and 100 characters."),

  body("department")
    .notEmpty()
    .withMessage("Department is required.")
    .isMongoId()
    .withMessage("Invalid department id."),

  body("designation")
    .notEmpty()
    .withMessage("Designation is required.")
    .isMongoId()
    .withMessage("Invalid designation id."),

  body("employmentType")
    .isIn(Object.values(EMPLOYMENT_TYPE))
    .withMessage("Invalid employment type."),

  body("experienceLevel")
    .isIn(Object.values(EXPERIENCE_LEVEL))
    .withMessage("Invalid experience level."),

  body("summary").optional().trim(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),

  body("responsibilities")
    .optional()
    .isArray()
    .withMessage("Responsibilities must be an array."),

  body("requirements")
    .optional()
    .isArray()
    .withMessage("Requirements must be an array."),

  body("qualifications")
    .optional()
    .isArray()
    .withMessage("Qualifications must be an array."),

  body("requiredSkills")
    .optional()
    .isArray()
    .withMessage("Required skills must be an array."),

  body("preferredSkills")
    .optional()
    .isArray()
    .withMessage("Preferred skills must be an array."),

  body("minExperience")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum experience must be 0 or greater."),

  body("maxExperience")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum experience must be 0 or greater."),

  body("minSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive."),

  body("maxSalary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive."),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required."),

  body("openings")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Openings must be at least 1."),

  body("applicationDeadline")
    .notEmpty()
    .withMessage("Application deadline is required.")
    .isISO8601()
    .withMessage("Invalid application deadline."),

  body("aiInterviewEnabled")
    .optional()
    .isBoolean()
    .withMessage("AI interview enabled must be true or false."),

  body("interviewExpiryHours")
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage("Interview expiry hours must be between 1 and 168."),

  body("status")
    .optional()
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Invalid job status."),
];

// Update Job
const updateJobValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid job id."),
];

// Get Job By Id
const jobIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid job id."),
];

// Get Jobs
const getJobsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than 0."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),

  query("status")
    .optional()
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Invalid status."),

  query("employmentType")
    .optional()
    .isIn(Object.values(EMPLOYMENT_TYPE))
    .withMessage("Invalid employment type."),

  query("experienceLevel")
    .optional()
    .isIn(Object.values(EXPERIENCE_LEVEL))
    .withMessage("Invalid experience level."),
];

module.exports = {
  createJobValidation,
  updateJobValidation,
  jobIdValidation,
  getJobsValidation,
};