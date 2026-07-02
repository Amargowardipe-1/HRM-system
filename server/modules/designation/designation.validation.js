const { body } = require("express-validator");
const mongoose = require("mongoose");

const {
  DESIGNATION_STATUS,
  DESIGNATION_LEVELS,
} = require("./designation.constants");


// Create Designation Validation


const createDesignationValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Designation title is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Designation title must be between 2 and 100 characters."),

  body("department")
    .notEmpty()
    .withMessage("Department is required.")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Department ID."),

  body("level")
    .optional()
    .isIn(Object.values(DESIGNATION_LEVELS))
    .withMessage("Invalid designation level."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("status")
    .optional()
    .isIn(Object.values(DESIGNATION_STATUS))
    .withMessage("Invalid designation status."),
];


// Update Designation Validation


const updateDesignationValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Designation title must be between 2 and 100 characters."),

  body("department")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Department ID."),

  body("level")
    .optional()
    .isIn(Object.values(DESIGNATION_LEVELS))
    .withMessage("Invalid designation level."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("status")
    .optional()
    .isIn(Object.values(DESIGNATION_STATUS))
    .withMessage("Invalid designation status."),
];

module.exports = {
  createDesignationValidation,
  updateDesignationValidation,
};