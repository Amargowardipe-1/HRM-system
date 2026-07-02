"use client";

import { User, Building2, Calendar, FileText } from "lucide-react";

export function AttendanceTable({ records = [], showEmployeeColumn = false }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Late":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Half Day":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "Absent":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Leave":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    }).format(new Date(dateString));
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Date
              </th>
              {showEmployeeColumn && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                  Employee
                </th>
              )}
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Check In
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Check Out
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Working Hours
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Status
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((rec) => (
                <tr
                  key={rec._id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-200"
                >
                  <td className="p-4 text-sm text-slate-700 align-middle font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(rec.date)}
                    </span>
                  </td>
                  {showEmployeeColumn && (
                    <td className="p-4 text-sm text-slate-700 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="grid w-[32px] h-[32px] place-items-center rounded-lg bg-slate-100 text-brand-primary-dark font-bold text-xs">
                          <User size={14} />
                        </span>
                        <div>
                          <strong className="block text-[14px] font-semibold text-brand-text">
                            {rec.employee
                              ? `${rec.employee.firstName} ${rec.employee.lastName}`
                              : "Unknown"}
                          </strong>
                          <span className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                            <Building2 size={10} />
                            {rec.employee?.department?.name || "-"} • {rec.employee?.employeeCode || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="p-4 text-sm text-slate-600 align-middle font-mono font-medium text-emerald-600">
                    {formatTime(rec.checkIn)}
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle font-mono font-medium text-rose-500">
                    {formatTime(rec.checkOut)}
                  </td>
                  <td className="p-4 text-sm text-slate-700 align-middle font-semibold">
                    {rec.workingHours ? `${rec.workingHours.toFixed(2)} hrs` : "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <span
                      className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold border ${getStatusBadge(
                        rec.status
                      )}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm text-slate-500 align-middle max-w-[200px] truncate"
                    title={rec.remarks}
                  >
                    {rec.remarks ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <FileText size={12} className="text-slate-400 shrink-0" />
                        {rec.remarks}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? 7 : 6}
                  className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
