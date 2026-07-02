const { validationResult } = require("express-validator");
const leaveService = require("./leave.service");
const { LEAVE_MESSAGES } = require("./leave.constants");

// Apply for Leave
const applyLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const leave = await leaveService.applyLeave(req.body, req.user.id || req.user._id);

    return res.status(201).json({
      success: true,
      message: LEAVE_MESSAGES.CREATED,
      data: leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Get Leaves List
const getLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getLeaves(req.query, req.user);

    return res.status(200).json({
      success: true,
      message: LEAVE_MESSAGES.FETCHED_ALL,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Update Leave Status (Approve / Reject)
const updateLeaveStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const leave = await leaveService.updateLeaveStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: LEAVE_MESSAGES.STATUS_UPDATED,
      data: leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
