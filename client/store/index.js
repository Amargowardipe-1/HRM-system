import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer, { fetchDashboardStats } from "./slices/dashboardSlice";
import employeeReducer, { fetchEmployees } from "./slices/employeeSlice";
import departmentReducer, { fetchDepartments } from "./slices/departmentSlice";
import designationReducer, { fetchDesignations } from "./slices/designationSlice";
import attendanceReducer, { fetchAttendanceRecords } from "./slices/attendanceSlice";
import leaveReducer, { fetchLeaves } from "./slices/leaveSlice";
import holidayReducer, { fetchHolidays } from "./slices/holidaySlice";
import payrollReducer, { fetchPayrolls } from "./slices/payrollSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    designations: designationReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    holidays: holidayReducer,
    payroll: payrollReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/**
 * Prefetches all application data in the background (non-blocking).
 * Only fetches data if it is not already loaded.
 */
export const prefetchAllAppData = (token = null) => async (dispatch, getState) => {
  const state = getState();

  const promises = [];

  if (!state.dashboard.isLoaded) {
    promises.push(dispatch(fetchDashboardStats(token)));
  }
  if (!state.employees.isLoaded) {
    promises.push(dispatch(fetchEmployees(token)));
  }
  if (!state.departments.isLoaded) {
    promises.push(dispatch(fetchDepartments(token)));
  }
  if (!state.designations.isLoaded) {
    promises.push(dispatch(fetchDesignations(token)));
  }
  if (!state.holidays.isLoaded) {
    promises.push(dispatch(fetchHolidays(token)));
  }
  if (!state.attendance.isLoaded) {
    promises.push(dispatch(fetchAttendanceRecords({ token })));
  }
  if (!state.leaves.isLoaded) {
    promises.push(dispatch(fetchLeaves({ token })));
  }
  if (!state.payroll.isLoaded) {
    promises.push(dispatch(fetchPayrolls(token)));
  }

  try {
    await Promise.allSettled(promises);
  } catch (err) {
    console.error("Background prefetch error:", err);
  }
};
