const { body } = require("express-validator");
const mongoose = require("mongoose");

const createEmployeeValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .custom(async (value) => {
      const RolePermission = require("../role/rolePermission.model");
      const exists = await RolePermission.findOne({ role: value });
      if (!exists) {
        throw new Error("Invalid role selected");
      }
      return true;
    }),

  body("employeeCode")
    .trim()
    .notEmpty()
    .withMessage("Employee code is required"),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("dob")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid Date of Birth format"),

  body("department")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Department ID format"),

  body("designation")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Designation ID format"),

  body("manager")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Manager ID format"),

  body("joiningDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid Joining Date format"),

  body("employmentType")
    .optional()
    .isIn(["Full-time", "Part-time", "Contract", "Intern"])
    .withMessage("Invalid employment type"),

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .custom((value) => value >= 0)
    .withMessage("Salary cannot be negative"),

  body("status")
    .optional()
    .isIn(["Active", "Terminated", "On Leave"])
    .withMessage("Invalid status"),
];

const updateEmployeeValidation = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .custom(async (value) => {
      const RolePermission = require("../role/rolePermission.model");
      const exists = await RolePermission.findOne({ role: value });
      if (!exists) {
        throw new Error("Invalid role selected");
      }
      return true;
    }),

  body("employeeCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Employee code cannot be empty"),

  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("dob")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid Date of Birth format"),

  body("department")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Department ID format"),

  body("designation")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Designation ID format"),

  body("manager")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Manager ID format"),

  body("joiningDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid Joining Date format"),

  body("employmentType")
    .optional()
    .isIn(["Full-time", "Part-time", "Contract", "Intern"])
    .withMessage("Invalid employment type"),

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .custom((value) => value >= 0)
    .withMessage("Salary cannot be negative"),

  body("status")
    .optional()
    .isIn(["Active", "Terminated", "On Leave"])
    .withMessage("Invalid status"),
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation,
};
