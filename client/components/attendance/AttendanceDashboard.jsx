"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkInAttendance, checkOutAttendance, getAttendanceRecords } from "@/lib/api";
import { AttendanceActions } from "./AttendanceActions";
import { AttendanceFilters } from "./AttendanceFilters";
import { AttendanceTable } from "./AttendanceTable";
import { RefreshCw } from "lucide-react";

export function AttendanceDashboard({
  initialRecords = [],
  employees = [],
  currentUser = {},
  token = null,
}) {
  const router = useRouter();
  const isAdmin = currentUser.role === "Admin";
  const hasAttendanceViewAll = currentUser.permissions?.includes("attendance:view_all") || false;
  const showFilters = hasAttendanceViewAll;

  const [records, setRecords] = useState(initialRecords);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  // Re-fetch records when filters change
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
        setRecords(data);
      } catch (err) {
        setError(err.message || "Failed to load attendance logs.");
      }
    };

    // Skip initial fetch on mount since we already have initialRecords
    if (selectedDate !== "" || selectedEmployee !== "") {
      fetchFilteredRecords();
    }
  }, [selectedDate, selectedEmployee]);

  const loadAllRecords = async () => {
    setError("");
    try {
      const data = await getAttendanceRecords(
        {
          date: selectedDate,
          employeeId: selectedEmployee,
        },
        token
      );
      setRecords(data);
    } catch (err) {
      setError(err.message || "Failed to refresh attendance logs.");
    }
  };

  const handleCheckIn = async (remarks) => {
    setIsSubmitting(true);
    setError("");
    try {
      await checkInAttendance(remarks, token);
      await loadAllRecords();
      router.refresh();
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
      router.refresh();
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
            Track daily work hours, log check-in/out times, and view history.
          </p>
        </div>
        <button
          onClick={loadAllRecords}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-full"
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

      {/* Filters (Date and Employee Select for Admin/HR) */}
      <AttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        employees={employees}
        showEmployeeFilter={showFilters}
      />

      {/* Attendance Log Table */}
      <AttendanceTable records={records} showEmployeeColumn={showFilters} />
    </main>
  );
}
