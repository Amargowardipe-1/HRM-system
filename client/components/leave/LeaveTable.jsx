"use client";

import { Check, X, Calendar, User, Building2, FileText } from "lucide-react";

export function LeaveTable({
  records = [],
  showEmployeeColumn = false,
  isAdminOrHR = false,
  onApprove,
  onReject,
  isActioning = false,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
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
    }).format(new Date(dateString));
  };

  const calculateDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              {showEmployeeColumn && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                  Employee
                </th>
              )}
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Leave Type
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Duration
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Days
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Reason
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Status
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Reviewed By
              </th>
              {isAdminOrHR && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[110px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((rec) => (
                <tr
                  key={rec._id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-200"
                >
                  {showEmployeeColumn && (
                    <td className="p-4 text-sm text-slate-700 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="grid w-[32px] h-[32px] place-items-center rounded-lg bg-slate-100 text-brand-primary-dark font-bold text-xs">
                          <User size={14} />
                        </span>
                        <div>
                          <strong className="block text-[14px] font-semibold text-brand-text">
                            {rec.employeeId
                              ? `${rec.employeeId.firstName} ${rec.employeeId.lastName}`
                              : "Unknown"}
                          </strong>
                          <span className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                            <Building2 size={10} />
                            {rec.employeeId?.department?.name || "-"} • {rec.employeeId?.employeeCode || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="p-4 text-sm text-brand-text align-middle font-bold">
                    {rec.leaveType}
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(rec.startDate)} – {formatDate(rec.endDate)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 align-middle font-bold">
                    {calculateDays(rec.startDate, rec.endDate)}
                  </td>
                  <td
                    className="p-4 text-sm text-slate-500 align-middle max-w-[200px] truncate"
                    title={rec.reason}
                  >
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-slate-400 shrink-0" />
                      {rec.reason}
                    </span>
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
                  <td className="p-4 text-sm text-slate-500 align-middle">
                    {rec.approvedBy ? (
                      <div>
                        <span className="font-semibold text-slate-700">
                          {rec.approvedBy.name || "Manager"}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {rec.approvedBy.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unreviewed</span>
                    )}
                  </td>
                  {isAdminOrHR && (
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      {rec.status === "Pending" ? (
                        <div className="flex gap-2">
                          <button
                            disabled={isActioning}
                            onClick={() => onApprove(rec._id)}
                            className="grid w-[32px] h-[32px] place-items-center border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Approve leave"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            disabled={isActioning}
                            onClick={() => onReject(rec._id)}
                            className="grid w-[32px] h-[32px] place-items-center border border-rose-200 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Reject leave"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted font-medium">No action needed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? 8 : 7}
                  className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
