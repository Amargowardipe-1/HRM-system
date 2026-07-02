const {
  ATTENDANCE_STATUS,
  OFFICE_TIMING,
} = require("./attendance.constants");

// -------------------------------------
// Convert HH:MM to Total Minutes
// -------------------------------------

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// -------------------------------------
// Calculate Working Hours
// -------------------------------------

const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const diff = checkOut.getTime() - checkIn.getTime();

  const hours = diff / (1000 * 60 * 60);

  return Number(hours.toFixed(2));
};

// -------------------------------------
// Check Late Entry
// -------------------------------------

const isLateEntry = (checkIn, settings) => {
  if (!checkIn) return false;

  const startTime = settings?.officeStartTime || OFFICE_TIMING.START_TIME;
  const graceMinutes = settings?.graceTime !== undefined ? settings.graceTime : OFFICE_TIMING.LATE_AFTER_MINUTES;

  const officeStart = timeToMinutes(startTime) + graceMinutes;

  const employeeTime =
    checkIn.getHours() * 60 +
    checkIn.getMinutes();

  return employeeTime > officeStart;
};

// -------------------------------------
// Decide Attendance Status
// -------------------------------------

const calculateAttendanceStatus = (
  checkIn,
  workingHours,
  settings
) => {
  if (!checkIn) {
    return ATTENDANCE_STATUS.ABSENT;
  }

  const halfDayHours = settings?.halfDayHours !== undefined ? settings.halfDayHours : OFFICE_TIMING.HALF_DAY_AFTER_HOURS;

  if (workingHours < halfDayHours) {
    return ATTENDANCE_STATUS.HALF_DAY;
  }

  if (isLateEntry(checkIn, settings)) {
    return ATTENDANCE_STATUS.LATE;
  }

  return ATTENDANCE_STATUS.PRESENT;
};

// -------------------------------------
// Calculate Overtime
// -------------------------------------

const calculateOvertime = (workingHours) => {
  const officeHours = OFFICE_TIMING.OFFICE_HOURS;

  if (workingHours <= officeHours) {
    return 0;
  }

  return Number((workingHours - officeHours).toFixed(2));
};


// -------------------------------------
// Check Early Checkout
// -------------------------------------

const isEarlyCheckout = (checkOut) => {
  if (!checkOut) return false;

  const officeEnd = timeToMinutes(OFFICE_TIMING.END_TIME);

  const employeeCheckout =
    checkOut.getHours() * 60 +
    checkOut.getMinutes();

  return employeeCheckout < officeEnd;
};

module.exports = {
  calculateWorkingHours,
  calculateAttendanceStatus,
  isLateEntry,
  calculateOvertime,
  isEarlyCheckout,
};