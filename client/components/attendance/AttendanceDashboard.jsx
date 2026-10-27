"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { checkInAttendance, checkOutAttendance, getAttendanceRecords } from "@/lib/api";
import { fetchAttendanceRecords, setAttendanceRecords } from "@/store/slices/attendanceSlice";
import { fetchEmployees } from "@/store/slices/employeeSlice";
import { fetchDepartments } from "@/store/slices/departmentSlice";
import { AttendanceActions } from "./AttendanceActions";
import { AttendanceFilters } from "./AttendanceFilters";
import { AttendanceTable } from "./AttendanceTable";
import { RefreshCw } from "lucide-react";

export function AttendanceDashboard({
  initialRecords = [],
  employees: initialEmployees = [],
  currentUser = {},
  token = null,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxRecords = useSelector((state) => state.attendance.records);
  const attendanceLoaded = useSelector((state) => state.attendance.isLoaded);
  const reduxEmployees = useSelector((state) => state.employees.employees);
  const employeesLoaded = useSelector((state) => state.employees.isLoaded);
  const reduxDepartments = useSelector((state) => state.departments.departments);
  const departmentsLoaded = useSelector((state) => state.departments.isLoaded);

  const isAdmin = currentUser.role === "Admin";
  const hasAttendanceViewAll = currentUser.permissions?.includes("attendance:view_all") || false;
  const showFilters = hasAttendanceViewAll;

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [viewMode, setViewMode] = useState("summary");

  const [filteredRecords, setFilteredRecords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Determine current records and employees
  const records = filteredRecords !== null
    ? filteredRecords
    : (reduxRecords.length > 0 || attendanceLoaded ? reduxRecords : initialRecords);

  const employees = reduxEmployees.length > 0 || employeesLoaded ? reduxEmployees : initialEmployees;
  const departments = reduxDepartments.length > 0 || departmentsLoaded ? reduxDepartments : [];

  // Initial load if not in Redux
  useEffect(() => {
    if (!attendanceLoaded && initialRecords.length === 0) {
      dispatch(fetchAttendanceRecords({ token }));
    } else if (initialRecords.length > 0 && !attendanceLoaded) {
      dispatch(setAttendanceRecords(initialRecords));
    }

    if (!employeesLoaded && initialEmployees.length === 0 && hasAttendanceViewAll) {
      dispatch(fetchEmployees(token));
    }

    if (!departmentsLoaded) {
      dispatch(fetchDepartments(token));
    }
  }, [dispatch, attendanceLoaded, employeesLoaded, departmentsLoaded, initialRecords, initialEmployees, hasAttendanceViewAll, token]);

  // Helper to get local YYYY-MM-DD date string
  const getLocalDateString = (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Derive today's record for the logged-in user using local timezone comparison
  const todayStr = getLocalDateString(new Date());
  const todayRecord = records.find((rec) => {
    if (!rec.date) return false;
    const recDateStr = getLocalDateString(rec.date);
    const recUserId = rec.employee?.userId?._id || rec.employee?.userId;
    const currentUserId = currentUser.id || currentUser._id;
    return recDateStr === todayStr && recUserId?.toString() === currentUserId?.toString();
  });

  // Re-fetch records when date or employee filter changes in daily view
  useEffect(() => {
    const fetchFilteredRecords = async () => {
      setError("");
      try {
        const data = await getAttendanceRecords(
          {
            date: selectedDate,
            employeeId: selectedEmployee,
          },
          token
        );
        setFilteredRecords(data);
      } catch (err) {
        setError(err.message || "Failed to load attendance logs.");
      }
    };

    if (selectedDate !== "" || selectedEmployee !== "") {
      fetchFilteredRecords();
    } else {
      setFilteredRecords(null);
    }
  }, [selectedDate, selectedEmployee, token]);

  const loadAllRecords = async () => {
    setError("");
    try {
      if (selectedDate || selectedEmployee) {
        const data = await getAttendanceRecords(
          {
            date: selectedDate,
            employeeId: selectedEmployee,
          },
          token
        );
        setFilteredRecords(data);
      } else {
        await dispatch(fetchAttendanceRecords({ token })).unwrap();
        setFilteredRecords(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to refresh attendance logs.");
    }
  };

  const handleCheckIn = async (remarks) => {
    setIsSubmitting(true);
    setError("");
    try {
      await checkInAttendance(remarks, token);
      await loadAllRecords();
    } catch (err) {
      setError(err.message || "Failed to check in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (remarks) => {
    setIsSubmitting(true);
    setError("");
    try {
      await checkOutAttendance(remarks, token);
      await loadAllRecords();
    } catch (err) {
      setError(err.message || "Failed to check out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start" aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Attendance</h1>
          <p className="text-sm text-brand-muted mt-1">
            Track daily work hours, monthly check-in/out times, and user attendance status.
          </p>
        </div>
        <button
          onClick={loadAllRecords}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-xl font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-full shadow-xs"
          title="Refresh list"
        >
          <RefreshCw size={17} />
          Refresh Logs
        </button>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Check In / Check Out Cards */}
      {currentUser.permissions?.includes("attendance:check_in") && (
        <AttendanceActions
          todayRecord={todayRecord}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Enhanced Filters (Month, Year, Search, Department, View Mode) */}
      <AttendanceFilters
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={departments}
        employees={employees}
        showEmployeeFilter={showFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* User-Centric Monthly Timesheet & Logs Table */}
      <AttendanceTable
        records={records}
        employees={employees}
        currentUser={currentUser}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        viewMode={viewMode}
        showEmployeeColumn={showFilters}
      />
    </main>
  );
}
