const express = require("express");

const router = express.Router();

const payrollController = require("./payroll.controller");


const {
  generatePayrollValidation,
    payrollIdValidation,
     updatePayrollValidation,
  markAsPaidValidation,
} = require("./payroll.validation");

const {
  verifyToken,
  checkPermission,
} = require("../../middleware/auth.middleware");

// Payroll Routes


// Generate Payroll
router.post(
  "/generate",
  verifyToken,
  checkPermission("payroll:generate"),
  generatePayrollValidation,
  payrollController.generatePayroll
);

// Get All Payrolls
router.get(
  "/",
  verifyToken,
  checkPermission("payroll:view_all"),
  payrollController.getAllPayrolls
);

// Auto Generate Payroll
router.post(
  "/auto-generate",
  verifyToken,
  checkPermission("payroll:generate"),
  payrollController.autoGenerateMonthlyPayroll
);

// Get Monthly Payroll Report
router.get(
  "/report",
  verifyToken,
  checkPermission("payroll:view_all"),
  payrollController.getMonthlyPayrollReport
);

// Get Employee Payroll History (Available to Admin, HR, and the Employee themselves)
router.get(
  "/employee/:employeeId",
  verifyToken,
  checkPermission("payroll:view_own", "payroll:view_all"),
  payrollController.getEmployeePayrollHistory
);

// Get Payroll By Id
router.get(
  "/:id",
  verifyToken,
  checkPermission("payroll:view_all"),
  payrollIdValidation,
  payrollController.getPayrollById
);

router.put(
  "/:id",
  verifyToken,
  checkPermission("payroll:update"),
  payrollIdValidation,
  updatePayrollValidation,
  payrollController.updatePayroll
);

// Mark Payroll As Paid
router.patch(
  "/:id/pay",
  verifyToken,
  checkPermission("payroll:mark_paid"),
  payrollIdValidation,
  markAsPaidValidation,
  payrollController.markPayrollAsPaid
);

// Delete Payroll (Soft Delete)
router.delete(
  "/:id",
  verifyToken,
  checkPermission("payroll:delete"),
  payrollIdValidation,
  payrollController.deletePayroll
);

module.exports = router;

