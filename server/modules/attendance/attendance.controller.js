const { validationResult } = require("express-validator");
const attendanceService = require("./attendance.service");
const Employee = require("../employee/employee.model");
const { ATTENDANCE_MESSAGES } = require("./attendance.constants");

// Helper to resolve employee ID based on user and request body
const resolveEmployeeId = async (req) => {
  const requesterId = req.user.id || req.user._id;
  const requesterRole = req.user.role;

  // If regular Employee, always enforce their own profile
  if (requesterRole === "Employee") {
    const employee = await Employee.findOne({ userId: requesterId });
    if (!employee) {
      throw new Error("Employee profile not found for this user.");
    }
    return employee._id;
  }

  // If Admin or HR, they can specify an employee, or default to themselves
  if (req.body.employee) {
    return req.body.employee;
  }

  const employee = await Employee.findOne({ userId: requesterId });
  if (!employee) {
    throw new Error("Employee profile not found for the logged-in user.");
  }
  return employee._id;
};

// Check In
const checkIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const employeeId = await resolveEmployeeId(req);
    const attendance = await attendanceService.checkIn(employeeId, req.user.id || req.user._id);

    return res.status(201).json({
      success: true,
      message: ATTENDANCE_MESSAGES.CREATED,
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Check Out
const checkOut = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const employeeId = await resolveEmployeeId(req);
    const attendance = await attendanceService.checkOut(employeeId, req.user.id || req.user._id);

    return res.status(200).json({
      success: true,
      message: ATTENDANCE_MESSAGES.UPDATED,
      data: attendance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Get Attendance List
const getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate, employeeId } = req.query;
    const attendance = await attendanceService.getAttendance(
      { date, startDate, endDate, employeeId },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: ATTENDANCE_MESSAGES.FETCH_ALL,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
};