const express = require("express");
const router = express.Router();

const leaveController = require("./leave.controller");
const {
  applyLeaveValidation,
  updateLeaveStatusValidation,
} = require("./leave.validation");

const {
  verifyToken,
  checkPermission,
} = require("../../middleware/auth.middleware");

// =========================================
// Leave Routes
// =========================================

// Apply for Leave / Get Leaves List
router
  .route("/")
  .post(
    verifyToken,
    checkPermission("leave:apply"),
    applyLeaveValidation,
    leaveController.applyLeave
  )
  .get(
    verifyToken,
    checkPermission("leave:view_all", "leave:view_own"),
    leaveController.getLeaves
  );

// Approve / Reject Leave Request
router.patch(
  "/:id/status",
  verifyToken,
  checkPermission("leave:approve", "leave:reject"),
  updateLeaveStatusValidation,
  leaveController.updateLeaveStatus
);

module.exports = router;
