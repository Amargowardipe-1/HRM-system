const { body } = require("express-validator");
const { HOLIDAY_TYPE } = require("./holiday.constants");

const holidayValidation = [
  body("name")
    .notEmpty()
    .withMessage("Holiday name is required.")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Name must be between 2 and 150 characters."),

  body("date")
    .notEmpty()
    .withMessage("Holiday date is required.")
    .isISO8601()
    .withMessage("Invalid date format."),

  body("type")
    .notEmpty()
    .withMessage("Holiday type is required.")
    .isIn(Object.values(HOLIDAY_TYPE))
    .withMessage("Invalid holiday type."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

module.exports = {
  holidayValidation,
};
