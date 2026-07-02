const { body } = require("express-validator");

const {
  PAYMENT_METHOD,
} = require("./payroll.constants");
const { param } = require("express-validator");

// =========================================
// Generate Payroll Validation
// =========================================

const generatePayrollValidation = [
  body("employee")
    .notEmpty()
    .withMessage("Employee is required.")
    .isMongoId()
    .withMessage("Invalid employee id."),

  body("month")
    .notEmpty()
    .withMessage("Month is required.")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12."),

  body("year")
    .notEmpty()
    .withMessage("Year is required.")
    .isInt({ min: 2025 })
    .withMessage("Invalid payroll year."),

  body("allowance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Allowance cannot be negative."),

  body("bonus")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Bonus cannot be negative."),

  body("deduction")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Deduction cannot be negative."),

  body("tax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax cannot be negative."),

  body("pf")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("PF cannot be negative."),

  body("esic")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("ESIC cannot be negative."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

// =========================================
// Update Payroll Validation
// =========================================

const updatePayrollValidation = [
  body("allowance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Allowance cannot be negative."),

  body("bonus")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Bonus cannot be negative."),

  body("deduction")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Deduction cannot be negative."),

  body("tax")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax cannot be negative."),

  body("pf")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("PF cannot be negative."),

  body("esic")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("ESIC cannot be negative."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

// =========================================
// Mark Payroll As Paid Validation
// =========================================

const markAsPaidValidation = [
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage("Invalid payment method."),
];

const payrollIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid payroll id."),
];

// =========================================

module.exports = {
  generatePayrollValidation,
  updatePayrollValidation,
  markAsPaidValidation,
  payrollIdValidation,

};