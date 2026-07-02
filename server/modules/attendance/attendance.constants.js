// Attendance Status

const ATTENDANCE_STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  HALF_DAY: "Half Day",
  LEAVE: "Leave",
  HOLIDAY: "Holiday",
  WEEK_OFF: "Week Off",
};

// Office Timings

const OFFICE_TIMING = {

  START_TIME: "09:00",

  END_TIME: "18:00",

  OFFICE_HOURS: 9,

  LATE_AFTER_MINUTES: 15,

  HALF_DAY_AFTER_HOURS: 4,
};

// Attendance Messages

const ATTENDANCE_MESSAGES = {
  CREATED: "Attendance marked successfully.",

  UPDATED: "Attendance updated successfully.",

  DELETED: "Attendance deleted successfully.",

  FETCH_ALL: "Attendance fetched successfully.",

  FETCH_ONE: "Attendance fetched successfully.",

  ALREADY_MARKED: "Attendance already marked for today.",

  NOT_FOUND: "Attendance not found.",

  CHECKOUT_REQUIRED: "Please check out first.",

  ALREADY_CHECKED_OUT: "Already checked out.",

  INVALID_CHECKIN: "Invalid check-in time.",

  INVALID_CHECKOUT: "Invalid check-out time.",
};

module.exports = {
  ATTENDANCE_STATUS,
  OFFICE_TIMING,
  ATTENDANCE_MESSAGES,
};