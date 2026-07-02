const express = require("express");
const router = express.Router();

const attendanceController = require("./attendance.controller");

const {
  checkInValidation,
  checkOutValidation,
} = require("./attendance.validation");

const {
  verifyToken,
  checkPermission,
} = require("../../middleware/auth.middleware");

// =========================================
// Attendance Routes
// =========================================

// Check In
router.post(
  "/check-in",
  verifyToken,
  checkPermission("attendance:check_in"),
  checkInValidation,
  attendanceController.checkIn
);

// Check Out
router.post(
  "/check-out",
  verifyToken,
  checkPermission("attendance:check_out"),
  checkOutValidation,
  attendanceController.checkOut
);

// Get Attendance List
router.get(
  "/",
  verifyToken,
  checkPermission("attendance:view_all", "attendance:view_own"),
  attendanceController.getAttendance
);

module.exports = router;