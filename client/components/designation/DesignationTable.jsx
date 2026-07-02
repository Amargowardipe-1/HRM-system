"use client";

import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  Trash2,
} from "lucide-react";

export function DesignationTable({
  designations = [],
  isLoading = false,
  isAdmin = false,
  onEditClick,
  onDeleteClick,
  pagination = { total: 0, page: 1, limit: 8, pages: 1 },
  page = 1,
  onPageChange,
}) {
  // Level Badge Colors
  const getLevelBadge = (level) => {
    switch (level) {
      case "Intern":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Junior":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Mid":
        return "bg-teal-50 text-teal-700 border-teal-100";
      case "Senior":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Lead":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Manager":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-150 text-slate-600";
    }
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Designation
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Department
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Level
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Status
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Description
              </th>
              {isAdmin && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[100px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="h-[200px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Loading designations...
                  </div>
                </td>
              </tr>
            ) : designations.length ? (
              designations.map((desig) => (
                <tr
                  key={desig._id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-200"
                >
                  <td className="p-4 text-sm text-slate-700 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="grid w-[36px] h-[36px] place-items-center rounded-xl bg-slate-100 text-brand-primary-dark font-bold text-sm">
                        <Briefcase size={16} />
                      </span>
                      <strong className="text-brand-text font-semibold text-[15px]">
                        {desig.title}
                      </strong>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" />
                      {desig.department?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <span
                      className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold border ${getLevelBadge(
                        desig.level
                      )}`}
                    >
                      {desig.level}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <span
                      className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold border ${
                        desig.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                    >
                      {desig.status}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm text-slate-500 align-middle max-w-[240px] truncate"
                    title={desig.description}
                  >
                    {desig.description || "-"}
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditClick(desig)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                          title="Edit designation"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(desig._id, desig.title)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-red-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 cursor-pointer"
                          title="Delete designation"
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
                  colSpan={isAdmin ? 6 : 5}
                  className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  No designations found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-brand-muted font-semibold">
            Page {pagination.page} of {pagination.pages} ({pagination.total} designations total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-[32px] w-[32px] items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-[32px] w-[32px] items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
