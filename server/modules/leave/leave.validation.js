const { body } = require("express-validator");
const { LEAVE_TYPE, LEAVE_STATUS } = require("./leave.constants");

const applyLeaveValidation = [
  body("leaveType")
    .notEmpty()
    .withMessage("Leave type is required.")
    .isIn(Object.values(LEAVE_TYPE))
    .withMessage("Invalid leave type."),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601()
    .withMessage("Invalid start date format."),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required.")
    .isISO8601()
    .withMessage("Invalid end date format.")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be greater than or equal to start date.");
      }
      return true;
    }),

  body("reason")
    .notEmpty()
    .withMessage("Reason is required.")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Reason must be between 5 and 1000 characters."),
];

const updateLeaveStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED])
    .withMessage("Status must be either Approved or Rejected."),
];

module.exports = {
  applyLeaveValidation,
  updateLeaveStatusValidation,
};
