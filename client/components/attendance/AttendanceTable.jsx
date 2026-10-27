"use client";

import { useState, useMemo } from "react";
import {
  User,
  Building2,
  Calendar,
  Clock,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

function formatTime(timeString) {
  if (!timeString) return "-";
  return new Date(timeString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  }).format(new Date(dateString));
}

function getLocalDateString(dateObj) {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AttendanceTable({
  records = [],
  employees = [],
  currentUser = {},
  selectedMonth = new Date().getMonth() + 1,
  selectedYear = new Date().getFullYear(),
  searchQuery = "",
  selectedDepartment = "",
  viewMode = "summary",
  showEmployeeColumn = true,
}) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const todayStr = getLocalDateString(new Date());

  // Calculate working days in the selected month (excluding Sundays)
  const totalWorkingDaysInMonth = useMemo(() => {
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === selectedYear &&
      today.getMonth() + 1 === selectedMonth;

    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const evaluatedDays = isCurrentMonth ? today.getDate() : lastDayOfMonth;

    let workDays = 0;
    for (let day = 1; day <= evaluatedDays; day++) {
      const d = new Date(selectedYear, selectedMonth - 1, day);
      if (d.getDay() !== 0) {
        // Exclude Sundays
        workDays++;
      }
    }
    return Math.max(1, workDays);
  }, [selectedMonth, selectedYear]);

  // Filter records for the selected month and year
  const monthlyRecords = useMemo(() => {
    return records.filter((rec) => {
      if (!rec.date) return false;
      const recDate = new Date(rec.date);
      return (
        recDate.getMonth() + 1 === Number(selectedMonth) &&
        recDate.getFullYear() === Number(selectedYear)
      );
    });
  }, [records, selectedMonth, selectedYear]);

  // Aggregate user-wise monthly attendance summaries
  const userMonthlySummaries = useMemo(() => {
    // Determine the list of employees to display
    let employeeList = [];

    if (showEmployeeColumn && employees.length > 0) {
      employeeList = employees;
    } else if (currentUser && (currentUser._id || currentUser.id)) {
      // Regular employee viewing own data
      const currentUserId = currentUser._id || currentUser.id;
      const matched = employees.find(
        (e) =>
          e.userId?._id === currentUserId ||
          e.userId === currentUserId ||
          e._id === currentUser.employeeId
      );
      if (matched) {
        employeeList = [matched];
      } else {
        employeeList = [
          {
            _id: currentUser.employeeId || currentUserId,
            firstName: currentUser.firstName || currentUser.name || "My",
            lastName: currentUser.lastName || "Attendance",
            employeeCode: currentUser.employeeCode || "EMP-ME",
            department: { name: currentUser.department || "General" },
            userId: { email: currentUser.email, role: currentUser.role },
          },
        ];
      }
    }

    // Apply Search and Department Filters
    const filteredEmployees = employeeList.filter((emp) => {
      const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim().toLowerCase();
      const code = (emp.employeeCode || "").toLowerCase();
      const search = searchQuery.trim().toLowerCase();

      const matchesSearch = !search || fullName.includes(search) || code.includes(search);
      const empDeptId = emp.department?._id || emp.department;
      const matchesDept = !selectedDepartment || empDeptId === selectedDepartment;

      return matchesSearch && matchesDept;
    });

    // Build summaries for each employee
    return filteredEmployees.map((emp) => {
      const empId = emp._id?.toString() || emp.id?.toString();
      const empUserId = emp.userId?._id?.toString() || emp.userId?.toString();

      // Find all records belonging to this employee in this month
      const empRecords = monthlyRecords.filter((rec) => {
        const recEmpId = rec.employee?._id?.toString() || rec.employee?.toString();
        const recUserId = rec.employee?.userId?._id?.toString() || rec.employee?.userId?.toString();
        return (
          (empId && recEmpId === empId) ||
          (empUserId && (recEmpId === empUserId || recUserId === empUserId))
        );
      });

      // Calculate attendance statistics
      let presentCount = 0;
      let halfDayCount = 0;
      let lateCount = 0;
      let totalHours = 0;
      let todayRecord = null;

      empRecords.forEach((rec) => {
        const status = rec.status;
        if (status === "Present" || status === "Late") {
          presentCount++;
          if (status === "Late") lateCount++;
        } else if (status === "Half Day") {
          halfDayCount++;
        }

        if (rec.workingHours) {
          totalHours += Number(rec.workingHours);
        }

        // Check if this record is today
        const recDateStr = getLocalDateString(rec.date);
        if (recDateStr === todayStr) {
          todayRecord = rec;
        }
      });

      // Calculate not present / absent days
      const totalAttended = presentCount + halfDayCount;
      const notPresentDays = Math.max(0, totalWorkingDaysInMonth - totalAttended);

      // Attendance percentage
      const attendancePercentage = totalWorkingDaysInMonth > 0
        ? Math.min(100, Math.round(((presentCount + halfDayCount * 0.5) / totalWorkingDaysInMonth) * 100))
        : 0;

      return {
        employee: emp,
        presentCount,
        notPresentDays,
        halfDayCount,
        lateCount,
        totalHours: totalHours.toFixed(1),
        attendancePercentage,
        todayRecord,
        monthlyRecords: empRecords.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
      };
    });
  }, [
    employees,
    currentUser,
    showEmployeeColumn,
    searchQuery,
    selectedDepartment,
    monthlyRecords,
    todayStr,
    totalWorkingDaysInMonth,
  ]);

  // Overall statistics for top metric cards
  const metrics = useMemo(() => {
    let totalPresentDays = 0;
    let totalHoursLogged = 0;
    let totalEmployeesTracked = userMonthlySummaries.length;

    userMonthlySummaries.forEach((userSummary) => {
      totalPresentDays += userSummary.presentCount;
      totalHoursLogged += parseFloat(userSummary.totalHours || 0);
    });

    const avgAttendance =
      totalEmployeesTracked > 0
        ? Math.round(
            userMonthlySummaries.reduce(
              (acc, u) => acc + u.attendancePercentage,
              0
            ) / totalEmployeesTracked
          )
        : 0;

    return {
      totalEmployeesTracked,
      totalPresentDays,
      totalHoursLogged: totalHoursLogged.toFixed(1),
      avgAttendance,
    };
  }, [userMonthlySummaries]);

  const toggleExpand = (empId) => {
    setExpandedEmployeeId(expandedEmployeeId === empId ? null : empId);
  };

  // ==========================================
  // VIEW MODE: DAILY RAW LOGS VIEW
  // ==========================================
  if (viewMode === "daily") {
    return (
      <section className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Date
                </th>
                {showEmployeeColumn && (
                  <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                    Employee
                  </th>
                )}
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Check In
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Check Out
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Working Hours
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Status
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length ? (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 text-sm text-slate-700 align-middle font-medium">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(rec.date)}
                      </span>
                    </td>
                    {showEmployeeColumn && (
                      <td className="p-4 text-sm text-slate-700 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-100">
                            {rec.employee?.firstName?.charAt(0) || "U"}
                          </span>
                          <div>
                            <strong className="block text-sm font-bold text-slate-900">
                              {rec.employee
                                ? `${rec.employee.firstName} ${rec.employee.lastName}`
                                : "Unknown"}
                            </strong>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Building2 size={11} />
                              {rec.employee?.department?.name || "-"} • {rec.employee?.employeeCode || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-sm font-mono font-bold text-emerald-600 align-middle">
                      {formatTime(rec.checkIn)}
                    </td>
                    <td className="p-4 text-sm font-mono font-bold text-rose-500 align-middle">
                      {formatTime(rec.checkOut)}
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700 align-middle">
                      {rec.workingHours ? `${rec.workingHours.toFixed(2)} hrs` : "-"}
                    </td>
                    <td className="p-4 text-sm align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          rec.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : rec.status === "Half Day"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 align-middle max-w-[200px] truncate">
                      {rec.remarks || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showEmployeeColumn ? 7 : 6}
                    className="h-32 text-center text-slate-400 font-medium p-4"
                  >
                    No daily logs found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  // ==========================================
  // VIEW MODE: USER-WISE MONTHLY SUMMARY VIEW
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Top Monthly Metrics Strip */}
      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <User size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tracked Staff
            </small>
            <span className="text-xl font-extrabold text-slate-900">
              {metrics.totalEmployeesTracked} Members
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Present Days
            </small>
            <span className="text-xl font-extrabold text-emerald-600">
              {metrics.totalPresentDays} Days
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Clock size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Working Hours
            </small>
            <span className="text-xl font-extrabold text-slate-900">
              {metrics.totalHoursLogged} hrs
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp size={20} />
          </div>
          <div>
            <small className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Avg Attendance Rate
            </small>
            <span className="text-xl font-extrabold text-purple-700">
              {metrics.avgAttendance}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Employee-wise Monthly Timesheet Table */}
      <section className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80">
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Employee
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Today's Check In
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Today's Check Out
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                  Present
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                  Not Present
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-center">
                  Half Day
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-left">
                  Monthly Hours
                </th>
                <th className="text-slate-500 text-[11px] font-bold uppercase tracking-wider p-4 text-right">
                  Detailed Logs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userMonthlySummaries.length ? (
                userMonthlySummaries.map((summary) => {
                  const emp = summary.employee;
                  const empId = emp._id || emp.id;
                  const isExpanded = expandedEmployeeId === empId;
                  const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";

                  return (
                    <div key={empId} className="contents">
                      {/* Primary Employee Summary Row */}
                      <tr
                        onClick={() => toggleExpand(empId)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          isExpanded ? "bg-slate-50/90" : ""
                        }`}
                      >
                        {/* Employee Identity */}
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="block text-sm font-bold text-slate-900">
                                {fullName}
                              </strong>
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                                  {emp.employeeCode || "EMP"}
                                </span>
                                <span>•</span>
                                <span>{emp.department?.name || "General"}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Today's Check In */}
                        <td className="p-4 align-middle">
                          {summary.todayRecord?.checkIn ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                              <LogIn size={13} className="text-emerald-600" />
                              {formatTime(summary.todayRecord.checkIn)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">
                              Not Checked In
                            </span>
                          )}
                        </td>

                        {/* Today's Check Out */}
                        <td className="p-4 align-middle">
                          {summary.todayRecord?.checkOut ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                              <LogOut size={13} className="text-blue-600" />
                              {formatTime(summary.todayRecord.checkOut)}
                            </span>
                          ) : summary.todayRecord?.checkIn ? (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Working (In Progress)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>

                        {/* Present Count */}
                        <td className="p-4 text-center align-middle">
                          <span className="inline-flex items-center justify-center min-w-[70px] px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            {summary.presentCount} Days
                          </span>
                        </td>

                        {/* Not Present / Absent Count */}
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center min-w-[70px] px-2.5 py-1 rounded-full text-xs font-black border shadow-2xs ${
                              summary.notPresentDays > 0
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {summary.notPresentDays} Days
                          </span>
                        </td>

                        {/* Half Day Count */}
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center min-w-[65px] px-2 py-1 rounded-full text-xs font-black border shadow-2xs ${
                              summary.halfDayCount > 0
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {summary.halfDayCount}
                          </span>
                        </td>

                        {/* Total Hours */}
                        <td className="p-4 align-middle">
                          <span className="text-sm font-bold text-slate-800">
                            {summary.totalHours} hrs
                          </span>
                          <span className="block text-[10px] font-semibold text-slate-400">
                            Score: {summary.attendancePercentage}%
                          </span>
                        </td>

                        {/* Expand Button */}
                        <td className="p-4 text-right align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(empId);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <span>Logs</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Daily Logs Panel for this Employee */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="p-4 pl-12 pr-6 border-y border-slate-200/80">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  {fullName}'s Daily Records for Selected Month
                                </h4>
                                <span className="text-xs font-semibold text-slate-500">
                                  {summary.monthlyRecords.length} Day(s) Logged
                                </span>
                              </div>

                              {summary.monthlyRecords.length > 0 ? (
                                <div className="overflow-x-auto max-h-[300px]">
                                  <table className="w-full text-xs border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                                        <th className="py-2 text-left">Date</th>
                                        <th className="py-2 text-left">Check In</th>
                                        <th className="py-2 text-left">Check Out</th>
                                        <th className="py-2 text-left">Working Hours</th>
                                        <th className="py-2 text-left">Status</th>
                                        <th className="py-2 text-left">Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                      {summary.monthlyRecords.map((r) => (
                                        <tr key={r._id} className="hover:bg-slate-50">
                                          <td className="py-2.5 text-slate-700 font-semibold">
                                            {formatDate(r.date)}
                                          </td>
                                          <td className="py-2.5 font-mono text-emerald-700 font-bold">
                                            {formatTime(r.checkIn)}
                                          </td>
                                          <td className="py-2.5 font-mono text-rose-600 font-bold">
                                            {formatTime(r.checkOut)}
                                          </td>
                                          <td className="py-2.5 text-slate-800 font-bold">
                                            {r.workingHours ? `${r.workingHours.toFixed(2)} hrs` : "-"}
                                          </td>
                                          <td className="py-2.5">
                                            <span
                                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                                r.status === "Present"
                                                  ? "bg-emerald-50 text-emerald-700"
                                                  : r.status === "Half Day"
                                                  ? "bg-amber-50 text-amber-700"
                                                  : "bg-rose-50 text-rose-700"
                                              }`}
                                            >
                                              {r.status}
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-slate-500">
                                            {r.remarks || "-"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 py-3 text-center">
                                  No check-in activity recorded for this employee in the selected month.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="h-40 text-center text-slate-400 font-medium p-6">
                    No employees or attendance records matched the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
