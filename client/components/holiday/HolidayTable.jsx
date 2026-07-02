"use client";

import { Calendar, Edit2, Trash2, CalendarDays } from "lucide-react";

export function HolidayTable({
  records = [],
  isAdminOrHR = false,
  onEditClick,
  onDeleteClick,
}) {
  const getBadgeColor = (type) => {
    switch (type) {
      case "National Holiday":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Restricted Holiday":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Company Holiday":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(dateString));
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[240px]">
                Date
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Holiday Name
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[160px]">
                Type
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Description
              </th>
              {isAdminOrHR && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[100px]">
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
                  <td className="p-4 text-sm text-slate-700 align-middle font-semibold">
                    <span className="flex items-center gap-2">
                      <Calendar className="text-slate-400 shrink-0" size={15} />
                      {formatDate(rec.date)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-brand-text align-middle font-bold">
                    {rec.name}
                  </td>
                  <td className="p-4 text-sm text-slate-650 align-middle">
                    <span
                      className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold border ${getBadgeColor(
                        rec.type
                      )}`}
                    >
                      {rec.type}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm text-slate-500 align-middle max-w-[220px] truncate"
                    title={rec.description}
                  >
                    {rec.description || "–"}
                  </td>
                  {isAdminOrHR && (
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditClick(rec)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                          title="Edit holiday"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(rec._id, rec.name)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-red-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 cursor-pointer"
                          title="Delete holiday"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdminOrHR ? 5 : 4}
                  className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  No holidays scheduled in the calendar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
