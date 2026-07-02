const Attendance = require("./attendance.model");
const Employee = require("../employee/employee.model");
const {
  calculateWorkingHours,
  calculateAttendanceStatus,
} = require("./attendance.helper");

const {
  ATTENDANCE_MESSAGES,
} = require("./attendance.constants");

// ---------------------------------------------------
// Check In
// ---------------------------------------------------
const checkIn = async (employeeId, userId) => {
  // Check Employee Exists
  const employee = await Employee.findById(employeeId);

  if (!employee || employee.isDeleted) {
    throw new Error(
      ATTENDANCE_MESSAGES.EMPLOYEE_NOT_FOUND
    );
  }

  // Today's Date (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check Duplicate Attendance
  const existingAttendance = await Attendance.findOne({
    employee: employeeId,
    date: today,
    isDeleted: false,
  });

  if (existingAttendance) {
    throw new Error(
      ATTENDANCE_MESSAGES.ALREADY_MARKED
    );
  }

  // Create Attendance
  const attendance = await Attendance.create({
    employee: employeeId,
    date: today,
    checkIn: new Date(),
    createdBy: userId,
  });

  // Return Created Attendance
  return await Attendance.findById(attendance._id)
    .populate({
      path: "employee",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "designation",
          select: "title level",
        },
      ],
    })
    .populate("createdBy", "email");
};

// ---------------------------------------------------
// Check Out
// ---------------------------------------------------
const checkOut = async (employeeId, userId) => {
  const employee = await Employee.findById(employeeId);

  if (!employee || employee.isDeleted) {
    throw new Error(
      ATTENDANCE_MESSAGES.EMPLOYEE_NOT_FOUND
    );
  }

  // Today's Date (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find Today's Attendance Record
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: today,
    isDeleted: false,
  });

  if (!attendance) {
    throw new Error("No check-in record found for today. Please check in first.");
  }

  if (attendance.checkOut) {
    throw new Error(
      ATTENDANCE_MESSAGES.ALREADY_CHECKED_OUT
    );
  }

  const checkOutTime = new Date();
  
  const AttendanceSetting = require("../settings/attendanceSetting.model");
  let settings = await AttendanceSetting.findOne();
  if (!settings) {
    settings = {
      officeStartTime: "09:00",
      officeEndTime: "18:00",
      graceTime: 15,
      halfDayHours: 4,
      fullDayHours: 8,
      weekend: ["Saturday", "Sunday"],
      overtimeEnabled: true,
    };
  }

  const workingHours = calculateWorkingHours(attendance.checkIn, checkOutTime);
  const status = calculateAttendanceStatus(attendance.checkIn, workingHours, settings);

  attendance.checkOut = checkOutTime;
  attendance.workingHours = workingHours;
  attendance.status = status;
  attendance.updatedBy = userId;

  await attendance.save();

  return await Attendance.findById(attendance._id)
    .populate({
      path: "employee",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "designation",
          select: "title level",
        },
      ],
    })
    .populate("createdBy", "email");
};

// ---------------------------------------------------
// Get Attendance (Role-based Access Control)
// ---------------------------------------------------
const getAttendance = async (filters, user) => {
  const { date, startDate, endDate, employeeId } = filters;
  const query = { isDeleted: false };

  // Date Filtering
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: targetDate, $lt: nextDay };
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  const requesterId = user.id || user._id;
  const requesterRole = user.role;

  if (requesterRole === "Admin") {
    // Admin can view everyone's attendance
    if (employeeId) {
      query.employee = employeeId;
    }
  } else if (requesterRole === "HR") {
    // HR can view:
    // 1. Their own attendance
    // 2. Attendance of employees they created
    // 3. Attendance of employees they manage
    const hrEmployee = await Employee.findOne({ userId: requesterId });

    const allowedEmployees = await Employee.find({
      $or: [
        { userId: requesterId },
        { createdBy: requesterId },
        { manager: hrEmployee?._id },
      ],
    }).select("_id");

    const allowedIds = allowedEmployees.map((emp) => emp._id);

    if (employeeId) {
      if (allowedIds.some((id) => id.toString() === employeeId.toString())) {
        query.employee = employeeId;
      } else {
        return []; // Access denied to other profiles
      }
    } else {
      query.employee = { $in: allowedIds };
    }
  } else {
    // Employee can only view their own attendance
    const employee = await Employee.findOne({ userId: requesterId });
    if (!employee) {
      return [];
    }
    query.employee = employee._id;
  }

  return await Attendance.find(query)
    .populate({
      path: "employee",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "designation",
          select: "title level",
        },
      ],
    })
    .populate("createdBy", "email")
    .sort({ date: -1 });
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
};