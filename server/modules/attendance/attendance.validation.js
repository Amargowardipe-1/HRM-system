const { body } = require("express-validator");
const mongoose = require("mongoose");

const {
  ATTENDANCE_STATUS,
} = require("./attendance.constants");

// ---------------------------
// Check In Validation
// ---------------------------
const checkInValidation = [
  body("employee")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Employee ID."),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

// ---------------------------
// Check Out Validation
// ---------------------------
const checkOutValidation = [
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

// ---------------------------
// Update Attendance Validation
// ---------------------------
const updateAttendanceValidation = [
  body("status")
    .optional()
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage("Invalid attendance status."),

  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("Invalid check-in date/time."),

  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("Invalid check-out date/time."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

module.exports = {
  checkInValidation,
  checkOutValidation,
  updateAttendanceValidation,
};