const { body } = require("express-validator");

const createDepartmentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required"),

  body("description")
    .optional()
    .trim(),

  body("manager")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Manager ID format"),

  body("parentDepartment")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Parent Department ID format"),

  body("costCenterCode")
    .optional()
    .trim(),

  body("allocatedBudget")
    .optional()
    .isNumeric()
    .withMessage("Allocated budget must be a number")
    .custom((val) => val >= 0)
    .withMessage("Allocated budget cannot be negative"),
];

const updateDepartmentValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty"),

  body("description")
    .optional()
    .trim(),

  body("manager")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Manager ID format"),

  body("parentDepartment")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Parent Department ID format"),

  body("costCenterCode")
    .optional()
    .trim(),

  body("allocatedBudget")
    .optional()
    .isNumeric()
    .withMessage("Allocated budget must be a number")
    .custom((val) => val >= 0)
    .withMessage("Allocated budget cannot be negative"),
];

module.exports = {
  createDepartmentValidation,
  updateDepartmentValidation,
};