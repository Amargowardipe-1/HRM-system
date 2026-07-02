"use client";

import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  Edit2,
  Mail,
  Phone,
  Shield,
  Trash2,
  User,
  UserCheck,
  X,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatOnlyDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEditClick,
  onDeleteClick,
  canEdit = false,
  canDelete = false,
  currentUser = null,
}) {
  if (!isOpen || !employee) return null;

  const requesterId = currentUser?._id || currentUser?.id;
  const isCreator = employee?.createdBy && (
    employee.createdBy === requesterId || 
    employee.createdBy?._id === requesterId || 
    employee.createdBy?.toString() === requesterId?.toString()
  );

  const hasEditPermission = currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);
  const hasDeletePermission = currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);

  const showActions = hasEditPermission || hasDeletePermission;

  const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || "Employee";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3" role="presentation" onMouseDown={onClose}>
      <section
        className="w-full max-w-[550px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-user-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
          <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
            <User size={19} />
          </div>
          <div>
            <h2 id="detail-user-title" className="text-lg font-bold text-brand-text">Employee Profile</h2>
            <p className="text-sm text-brand-muted mt-0.5">Comprehensive HR and account credentials.</p>
          </div>
          <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid gap-5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Avatar and Main Header */}
          <div className="flex items-center gap-4 border-b border-slate-200/80 pb-4.5">
            <div className="grid w-[60px] h-[60px] place-items-center rounded-2xl bg-[#e7f3f1] text-brand-primary-dark font-extrabold text-2xl border border-slate-100 shadow-sm shrink-0">
              {fullName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-text mb-1">{fullName}</h3>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{employee.employeeCode || "N/A"}</span>
                <span className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-wider ${
                  employee.userId?.role === "Admin"
                    ? "bg-purple-50 text-purple-600 border border-purple-100"
                    : employee.userId?.role === "HR"
                    ? "bg-sky-50 text-sky-600 border border-sky-100"
                    : "bg-orange-50 text-orange-600 border border-orange-100"
                }`}>
                  {employee.userId?.role || "Employee"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-sm:grid-cols-1">
            <div className="flex items-center gap-3.5">
              <Mail size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Email Address</small>
                <span className="text-sm font-semibold text-brand-text break-all">{employee.userId?.email || "-"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Phone size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Phone Number</small>
                <span className="text-sm font-semibold text-brand-text">{employee.phone || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <UserCheck size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Gender</small>
                <span className="text-sm font-semibold text-brand-text">{employee.gender || "Male"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Calendar size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Date of Birth</small>
                <span className="text-sm font-semibold text-brand-text">{formatOnlyDate(employee.dob)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Building2 size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Department</small>
                <span className="text-sm font-semibold text-brand-text">
                  {employee.department?.name || "No Department"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Briefcase size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Designation</small>
                <span className="text-sm font-semibold text-brand-text">
                  {employee.designation ? `${employee.designation.title} (${employee.designation.level})` : "No Designation"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Shield size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Employment Type</small>
                <span className="text-sm font-semibold text-brand-text">{employee.employmentType || "Full-time"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Coins size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Annual Salary</small>
                <span className="text-sm font-semibold text-brand-text">
                  {employee.salary ? `$${employee.salary.toLocaleString()}/yr` : "Not Disclosed"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <CheckCircle2 size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Status</small>
                <div className="flex gap-1.5 items-center mt-1">
                  <span className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-wider ${
                    employee.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : employee.status === "On Leave"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                    {employee.status || "Active"}
                  </span>
                  {employee.userId?.isActive === false && (
                    <span className="inline-flex min-h-[22px] items-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 text-[10px] font-bold uppercase tracking-wide">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Calendar size={16} className="text-brand-muted shrink-0" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Date Joined</small>
                <span className="text-sm font-semibold text-brand-text">{formatOnlyDate(employee.joiningDate || employee.createdAt)}</span>
              </div>
            </div>
          </div>

          {employee.updatedAt && (
            <div className="flex items-center gap-3.5 border-t border-slate-100 pt-3">
              <Calendar size={16} className="text-brand-muted" />
              <div>
                <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Profile Last Updated</small>
                <span className="text-sm font-medium text-slate-700">{formatDate(employee.updatedAt)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 border-t border-slate-200/80 pt-4.5 mt-2">
              {hasEditPermission && (
                <button
                  onClick={() => onEditClick(employee)}
                  className="flex-1 min-h-[42px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
                >
                  <Edit2 size={16} />
                  Edit Details
                </button>
              )}
              
              {hasDeletePermission && (
                <button
                  onClick={() => onDeleteClick(employee)}
                  className="flex-1 min-h-[42px] bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete Profile
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
