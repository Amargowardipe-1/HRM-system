"use client";

import { CalendarDays, CalendarCheck, Clock, User } from "lucide-react";

export function DashboardActivities({ attendance = [], leaves = [], isAdminOrHR = false }) {
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    return new Date(dateTimeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Rejected":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <section className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
      {/* Recent Attendance */}
      <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-brand-text flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock size={16} className="text-brand-primary" />
          Recent Attendance Logs
        </h3>

        <div className="flex flex-col gap-3.5">
          {attendance.length ? (
            attendance.map((rec) => (
              <div key={rec._id} className="flex justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid w-[28px] h-[28px] place-items-center rounded-lg bg-slate-50 text-slate-500 font-bold">
                    <User size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {isAdminOrHR && rec.employee
                        ? `${rec.employee.firstName} ${rec.employee.lastName}`
                        : "Checked In"}
                    </span>
                    <small className="text-slate-400 font-medium">
                      {formatDate(rec.date)}
                    </small>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-text font-mono">
                    {formatTime(rec.checkIn)}
                  </span>
                  {rec.checkOut && (
                    <span className="text-slate-400 font-medium font-mono block text-[10px]">
                      Out: {formatTime(rec.checkOut)}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-[100px] flex items-center justify-center text-xs text-brand-muted font-medium">
              No recent attendance logs.
            </div>
          )}
        </div>
      </div>

      {/* Recent Leaves */}
      <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-brand-text flex items-center gap-2 border-b border-slate-100 pb-3">
          <CalendarCheck size={16} className="text-brand-primary" />
          Recent Leave Applications
        </h3>

        <div className="flex flex-col gap-3.5">
          {leaves.length ? (
            leaves.map((rec) => (
              <div key={rec._id} className="flex justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid w-[28px] h-[28px] place-items-center rounded-lg bg-slate-50 text-slate-500 font-bold">
                    <CalendarDays size={12} />
                  </span>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {isAdminOrHR && rec.employeeId
                        ? `${rec.employeeId.firstName} ${rec.employeeId.lastName}`
                        : rec.leaveType}
                    </span>
                    <small className="text-slate-400 font-medium">
                      {formatDate(rec.startDate)} – {formatDate(rec.endDate)}
                    </small>
                  </div>
                </div>
                <span
                  className={`inline-flex min-h-[20px] items-center rounded-full px-2 text-[9px] font-bold border ${getStatusBadge(
                    rec.status
                  )}`}
                >
                  {rec.status}
                </span>
              </div>
            ))
          ) : (
            <div className="h-[100px] flex items-center justify-center text-xs text-brand-muted font-medium">
              No recent leave applications.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
