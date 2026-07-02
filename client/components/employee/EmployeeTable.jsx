"use client";

import { Edit, Loader2, Trash2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function EmployeeTable({
  employees,
  isLoading,
  onRowClick,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  currentUser = null,
}) {
  const showActions = canEdit || canDelete;

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-bold text-brand-text mb-0.5">Employee List</h2>
          <p className="text-sm text-brand-muted">{employees.length} users found</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Name</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Code</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Email</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Role</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Department</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Designation</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Status</th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">Joined</th>
              {showActions && <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[100px]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Loading employees
                  </div>
                </td>
              </tr>
            ) : employees.length ? (
              employees.map((employee) => {
                const requesterId = currentUser?._id || currentUser?.id;
                const isCreator = employee.createdBy && (
                  employee.createdBy === requesterId || 
                  employee.createdBy?._id === requesterId || 
                  employee.createdBy?.toString() === requesterId?.toString()
                );

                const hasEditPermission = currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);
                const hasDeletePermission = currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);

                return (
                  <tr
                    key={employee._id}
                    onClick={() => onRowClick(employee)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors border-b border-slate-200"
                  >
                    <td className="p-4 text-sm text-slate-700 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="grid w-[36px] h-[36px] place-items-center rounded-xl bg-slate-100 text-brand-primary-dark font-bold text-sm">
                          {employee.firstName?.slice(0, 1).toUpperCase() || employee.name?.slice(0, 1).toUpperCase()}
                        </span>
                        <strong className="text-brand-text font-semibold text-[15px]">
                          {employee.firstName} {employee.lastName}
                        </strong>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 align-middle font-mono font-bold text-xs">{employee.employeeCode || "N/A"}</td>
                    <td className="p-4 text-sm text-slate-600 align-middle">{employee.userId?.email || "-"}</td>
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      <span className={`inline-flex min-h-[24px] items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wider ${
                        employee.userId?.role === "Admin"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : employee.userId?.role === "HR"
                          ? "bg-sky-50 text-sky-600 border border-sky-100"
                          : "bg-orange-50 text-orange-600 border border-orange-100"
                      }`}>
                        {employee.userId?.role || "Employee"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      {employee.department ? (
                        <span className="font-semibold text-slate-700">
                          {employee.department.name || employee.department}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      {employee.designation ? (
                        <span className="font-semibold text-slate-700 flex flex-col leading-tight">
                          <span>{employee.designation.title}</span>
                          <span className="text-[10px] text-brand-muted mt-0.5 uppercase tracking-wider font-bold">{employee.designation.level}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600 align-middle">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex min-h-[24px] items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wider ${
                          employee.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : employee.status === "On Leave"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {employee.status || "Active"}
                        </span>
                        {employee.userId?.isActive === false && (
                          <span className="inline-flex min-h-[16px] items-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-1.5 text-[8px] font-bold uppercase tracking-wide">
                            Deactivated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 align-middle">{formatDate(employee.joiningDate || employee.createdAt)}</td>
                    
                    {showActions && (
                      <td className="p-4 text-sm text-slate-600 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {hasEditPermission && (
                            <button
                              className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 hover:text-brand-primary transition-all active:scale-98 cursor-pointer"
                              onClick={() => onEditClick(employee)}
                              title="Edit employee"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-98 cursor-pointer"
                              onClick={() => onDeleteClick(employee)}
                              title="Delete employee"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200">
                  No matching employees
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
