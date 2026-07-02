const LEAVE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const LEAVE_TYPE = {
  CASUAL: "Casual Leave",
  SICK: "Sick Leave",
  EARNED: "Earned Leave",
  MATERNITY: "Maternity Leave",
  PATERNITY: "Paternity Leave",
  UNPAID: "Unpaid Leave",
};

const LEAVE_MESSAGES = {
  CREATED: "Leave application submitted successfully.",
  STATUS_UPDATED: "Leave status updated successfully.",
  FETCHED_ALL: "Leave records fetched successfully.",
  NOT_FOUND: "Leave record not found.",
  ACCESS_DENIED: "Access Denied: You are not authorized.",
  INVALID_DATES: "End date must be greater than or equal to start date.",
};

module.exports = {
  LEAVE_STATUS,
  LEAVE_TYPE,
  LEAVE_MESSAGES,
};
