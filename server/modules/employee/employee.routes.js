const express = require("express");
const router = express.Router();

const employeeController = require("./employee.controller");
const {
  createEmployeeValidation,
  updateEmployeeValidation,
} = require("./employee.validation");

const validate = require("../../middleware/validate.middleware");
const {
  verifyToken,
  checkPermission,
} = require("../../middleware/auth.middleware");

// Create Employee (Admin/HR)
router.post(
  "/",
  verifyToken,
  checkPermission("employees:create"),
  createEmployeeValidation,
  validate,
  employeeController.createEmployee
);

// Get All Employees (Admin, HR)
router.get(
  "/",
  verifyToken,
  checkPermission("employees:view_all"),
  employeeController.getEmployees
);

// Get Employee By ID (Admin, HR, Employee)
router.get(
  "/:id",
  verifyToken,
  checkPermission("employees:view_own"),
  employeeController.getEmployeeById
);

// Update Employee (Admin, HR, Employee)
router.put(
  "/:id",
  verifyToken,
  checkPermission("employees:update", "bank_details:update_own"),
  updateEmployeeValidation,
  validate,
  employeeController.updateEmployee
);

// Delete Employee (Admin Only)
router.delete(
  "/:id",
  verifyToken,
  checkPermission("employees:delete"),
  employeeController.deleteEmployee
);

module.exports = router;
