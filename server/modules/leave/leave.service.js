const Leave = require("./leave.model");
const Employee = require("../employee/employee.model");
const { LEAVE_STATUS, LEAVE_MESSAGES } = require("./leave.constants");
const sendEmail = require("../../utils/sendEmail");
const leaveStatusTemplate = require("../../utils/emailTemplates/leaveStatus.template");

// ---------------------------------------------------
// Apply for Leave
// ---------------------------------------------------
const applyLeave = async (leaveData, userId) => {
  const employee = await Employee.findOne({ userId });
  if (!employee || employee.isDeleted) {
    throw new Error("Employee profile not found for this user.");
  }

  const leave = await Leave.create({
    employeeId: employee._id,
    leaveType: leaveData.leaveType,
    startDate: new Date(leaveData.startDate),
    endDate: new Date(leaveData.endDate),
    reason: leaveData.reason,
    status: LEAVE_STATUS.PENDING,
  });

  const populatedLeave = await Leave.findById(leave._id).populate({
    path: "employeeId",
    populate: [
      { path: "department", select: "name" },
      { path: "designation", select: "title level" },
    ],
  });

  // Trigger Notification
  const notificationService = require("../notification/notification.service");
  const empName = `${populatedLeave.employeeId.firstName} ${populatedLeave.employeeId.lastName}`;
  await notificationService.notifyAdminsAndHRs({
    sender: userId,
    type: "Leave_Applied",
    title: "New Leave Request",
    message: `${empName} has applied for ${populatedLeave.leaveType} leave.`,
    link: "/leaves",
  });

  return populatedLeave;
};

// ---------------------------------------------------
// Get Leaves List (Role-based Access Control)
// ---------------------------------------------------
const getLeaves = async (filters, user) => {
  const { status, employeeId } = filters;
  const query = {};

  if (status) {
    query.status = status;
  }

  const requesterId = user.id || user._id;
  const requesterRole = user.role;

  if (requesterRole === "Admin") {
    // Admin can view all leaves
    if (employeeId) {
      query.employeeId = employeeId;
    }
  } else if (requesterRole === "HR") {
    // HR can view:
    // 1. Their own leaves
    // 2. Leaves of employees they created
    // 3. Leaves of employees they manage
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
        query.employeeId = employeeId;
      } else {
        return []; // Access denied
      }
    } else {
      query.employeeId = { $in: allowedIds };
    }
  } else {
    // Employee can only view their own leaves
    const employee = await Employee.findOne({ userId: requesterId });
    if (!employee) {
      return [];
    }
    query.employeeId = employee._id;
  }

  return await Leave.find(query)
    .populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "name" },
        { path: "designation", select: "title level" },
      ],
    })
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 });
};

// ---------------------------------------------------
// Update Leave Status (Approve / Reject)
// ---------------------------------------------------
const updateLeaveStatus = async (leaveId, status, approver) => {
  const leave = await Leave.findById(leaveId).populate("employeeId");
  if (!leave) {
    throw new Error(LEAVE_MESSAGES.NOT_FOUND);
  }

  const requesterRole = approver.role;
  const requesterId = approver.id || approver._id;

  if (requesterRole !== "Admin" && requesterRole !== "HR") {
    throw new Error(LEAVE_MESSAGES.ACCESS_DENIED);
  }

  if (requesterRole === "HR") {
    const hrEmployee = await Employee.findOne({ userId: requesterId });
    const employee = leave.employeeId;

    const isCreator = employee.createdBy && employee.createdBy.toString() === requesterId.toString();
    const isManager = employee.manager && employee.manager.toString() === hrEmployee?._id?.toString();

    if (!isCreator && !isManager) {
      throw new Error("Access Denied: You are not authorized to approve/reject leave for this employee.");
    }
  }

  leave.status = status;
  leave.approvedBy = requesterId;
  await leave.save();

  const populatedLeave = await Leave.findById(leave._id)
    .populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "name" },
        { path: "designation", select: "title level" },
        { path: "userId", select: "email" },
      ],
    })
    .populate("approvedBy", "name email");

  // Trigger Notification
  const notificationService = require("../notification/notification.service");
  const statusText = populatedLeave.status === "Approved" ? "approved" : "rejected";
  await notificationService.createNotification({
    recipient: populatedLeave.employeeId.userId?._id || populatedLeave.employeeId.userId,
    sender: requesterId,
    type: populatedLeave.status === "Approved" ? "Leave_Approved" : "Leave_Rejected",
    title: `Leave Request ${populatedLeave.status}`,
    message: `Your leave request has been ${statusText} by HR/Admin.`,
    link: "/leaves",
  });

  // Trigger Email Notification (Non-blocking / Handled errors)
  const employeeEmail = populatedLeave.employeeId.userId?.email;
  if (employeeEmail) {
    const employeeName = `${populatedLeave.employeeId.firstName} ${populatedLeave.employeeId.lastName}`.trim();
    const approverName = populatedLeave.approvedBy?.name || "HR/Admin";
    const emailHtml = leaveStatusTemplate(
      employeeName,
      populatedLeave.leaveType,
      populatedLeave.startDate,
      populatedLeave.endDate,
      populatedLeave.status,
      approverName
    );

    sendEmail(
      employeeEmail,
      `Leave Request Status Update: ${populatedLeave.status}`,
      emailHtml
    ).catch((err) => {
      console.error("Failed to send leave status email to:", employeeEmail, err.message);
    });
  }

  return populatedLeave;
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
