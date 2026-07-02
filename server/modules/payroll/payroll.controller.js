const { validationResult } = require("express-validator");

const payrollService = require("./payroll.service");

const {
  PAYROLL_MESSAGES,
} = require("./payroll.constants");

// Generate Payroll

const generatePayroll = async (req, res) => {
  try {
    // Validation Errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const payroll =
      await payrollService.generatePayroll(
        req.user.id,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: PAYROLL_MESSAGES.CREATED,
      data: payroll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



const getAllPayrolls = async (req, res) => {
  try {
    const payrolls =
      await payrollService.getAllPayrolls(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        PAYROLL_MESSAGES.LIST_FETCHED,
      data: payrolls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch payroll list.",
    });
  }
};

// =========================================
// Get Payroll By Id
// =========================================

const getPayrollById = async (req, res) => {
  try {
    const payroll =
      await payrollService.getPayrollById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: PAYROLL_MESSAGES.FETCHED,
      data: payroll,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================================
// Update Payroll
// =========================================

const updatePayroll = async (req, res) => {
  try {
    // Validation Errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const payroll =
      await payrollService.updatePayroll(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: PAYROLL_MESSAGES.UPDATED,
      data: payroll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Mark Payroll As Paid
// =========================================

const markPayrollAsPaid = async (
  req,
  res
) => {
  try {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const payroll =
      await payrollService.markPayrollAsPaid(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: PAYROLL_MESSAGES.PAID,
      data: payroll,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Payroll (Soft Delete)
const deletePayroll = async (req, res) => {
  try {
    const result = await payrollService.deletePayroll(req.params.id);
    return res.status(200).json({
      success: true,
      message: PAYROLL_MESSAGES.DELETED,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Employee Payroll History
const getEmployeePayrollHistory = async (req, res) => {
  try {
    const history = await payrollService.getEmployeePayrollHistory(req.params.employeeId);
    return res.status(200).json({
      success: true,
      message: "Employee payroll history fetched successfully.",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Monthly Payroll Report
const getMonthlyPayrollReport = async (req, res) => {
  try {
    const report = await payrollService.getMonthlyPayrollReport(req.query.month, req.query.year);
    return res.status(200).json({
      success: true,
      message: "Monthly payroll report fetched successfully.",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Auto Generate Payroll for Month/Year
const autoGenerateMonthlyPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required.",
      });
    }

    const result = await payrollService.autoGenerateMonthlyPayroll(req.user.id, month, year);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  markPayrollAsPaid,
  deletePayroll,
  getEmployeePayrollHistory,
  getMonthlyPayrollReport,
  autoGenerateMonthlyPayroll,
};

