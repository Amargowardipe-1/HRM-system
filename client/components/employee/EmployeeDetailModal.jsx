"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Edit2,
  Landmark,
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
    month: "short",
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
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedField, setCopiedField] = useState(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const requesterId = currentUser?._id || currentUser?.id;
  const isCreator =
    employee?.createdBy &&
    (employee.createdBy === requesterId ||
      employee.createdBy?._id === requesterId ||
      employee.createdBy?.toString() === requesterId?.toString());

  const hasEditPermission =
    currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);
  const hasDeletePermission =
    currentUser?.role === "Admin" || (currentUser?.role === "HR" && isCreator);

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    employee.name ||
    "Employee";

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300 ease-out animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel (Right Half-Screen) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 max-sm:pl-0">
        <div className="w-screen max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-out animate-in slide-in-from-right">
          
          {/* Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-teal-700 via-emerald-600 to-emerald-500 shrink-0 p-6 flex items-start justify-between">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10">
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                Employee Profile
              </span>
              <p className="text-white/90 text-sm font-medium mt-0.5">
                Staff Directory & Account Dossier
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="relative z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md active:scale-95"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Identity Section (Overlapping Avatar) */}
          <div className="px-6 pb-4 pt-0 border-b border-slate-100 relative bg-white shrink-0">
            <div className="flex items-end justify-between -mt-12 mb-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white text-3xl font-black flex items-center justify-center shadow-lg border-4 border-white">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    employee.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  title={employee.status || "Active"}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasEditPermission && (
                  <button
                    onClick={() => onEditClick(employee)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                )}
                {hasDeletePermission && (
                  <button
                    onClick={() => onDeleteClick(employee)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.employeeCode || "N/A"}
                  <button
                    onClick={() => handleCopy(employee.employeeCode, "code")}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy code"
                  >
                    {copiedField === "code" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    employee.userId?.role === "Admin"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : employee.userId?.role === "HR"
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {employee.userId?.role || "Employee"}
                </span>
              </div>

              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
                <span>{employee.designation?.title || "No Designation"}</span>
                <span>•</span>
                <span>{employee.department?.name || "General"}</span>
              </p>
            </div>

            {/* Segmented Tab Navigation */}
            <div className="flex gap-1 mt-4 border-b border-slate-100">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview & Contact
              </button>
              <button
                onClick={() => setActiveTab("compensation")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "compensation"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Salary & Bank
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "account"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Account & Audit
              </button>
            </div>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {activeTab === "overview" && (
              <>
                {/* Contact Information Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Mail size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Email Address
                        </small>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {employee.userId?.email || "-"}
                          </span>
                          <button
                            onClick={() => handleCopy(employee.userId?.email, "email")}
                            className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedField === "email" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Phone size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Phone Number
                        </small>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-semibold text-slate-800">
                            {employee.phone || "Not Provided"}
                          </span>
                          {employee.phone && (
                            <button
                              onClick={() => handleCopy(employee.phone, "phone")}
                              className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                              title="Copy phone"
                            >
                              {copiedField === "phone" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job & Work Details Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Employment & Role
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Department
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.department?.name || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Briefcase size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Designation
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.designation?.title || "No Designation"}
                          {employee.designation?.level && ` (${employee.designation.level})`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Shield size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Employment Type
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.employmentType || "Full-time"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Calendar size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Joining Date
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {formatOnlyDate(employee.joiningDate || employee.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <UserCheck size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Reporting Manager
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.manager
                            ? `${employee.manager.firstName || ""} ${employee.manager.lastName || ""}`.trim()
                            : "Direct to CEO / None"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Employment Status
                        </small>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              employee.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : employee.status === "On Leave"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {employee.status || "Active"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <User size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Gender
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.gender || "Not Specified"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Calendar size={15} />
                      </div>
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Date of Birth
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {formatOnlyDate(employee.dob)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "compensation" && (
              <>
                {/* Compensation Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Compensation Details
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/80 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Coins size={22} />
                    </div>
                    <div>
                      <small className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                        Annual Fixed CTC / Salary
                      </small>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {employee.salary ? `₹${Number(employee.salary).toLocaleString("en-IN")}` : "Not Configured"}
                      </span>
                      <span className="text-xs text-slate-500 font-medium ml-1">/ year</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 pt-2">
                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Pay Frequency
                      </small>
                      <span className="text-sm font-semibold text-slate-800">
                        Monthly
                      </span>
                    </div>
                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Estimated Monthly Gross
                      </small>
                      <span className="text-sm font-semibold text-slate-800">
                        {employee.salary ? `₹${Math.round(Number(employee.salary) / 12).toLocaleString("en-IN")}` : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Bank Account Information
                    </h3>
                    <Landmark size={16} className="text-slate-400" />
                  </div>

                  {employee.bankDetails?.accountNumber ? (
                    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Bank Name
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.bankDetails.bankName || "N/A"}
                        </span>
                      </div>

                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Account Number
                        </small>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-mono font-bold text-slate-800">
                            {employee.bankDetails.accountNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(employee.bankDetails.accountNumber, "acc")}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedField === "acc" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          IFSC / Routing Code
                        </small>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {employee.bankDetails.ifsc || "N/A"}
                        </span>
                      </div>

                      <div>
                        <small className="block text-slate-400 text-[10px] font-bold uppercase">
                          Branch Name
                        </small>
                        <span className="text-sm font-semibold text-slate-800">
                          {employee.bankDetails.branch || "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No banking details recorded for this employee profile.
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "account" && (
              <>
                {/* System & Audit Card */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Security & Account Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Portal Login Access
                      </small>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold mt-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        Active & Enabled
                      </span>
                    </div>

                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Assigned Role
                      </small>
                      <span className="text-sm font-semibold text-slate-800">
                        {employee.userId?.role || "Employee"}
                      </span>
                    </div>

                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Profile Created On
                      </small>
                      <span className="text-sm font-medium text-slate-700">
                        {formatDate(employee.createdAt)}
                      </span>
                    </div>

                    <div>
                      <small className="block text-slate-400 text-[10px] font-bold uppercase">
                        Last Profile Update
                      </small>
                      <span className="text-sm font-medium text-slate-700">
                        {formatDate(employee.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator Metadata */}
                {employee.createdBy && (
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Record Owner
                    </h3>
                    <p className="text-xs text-slate-600">
                      This profile was created by admin/HR ID:{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {employee.createdBy?._id || employee.createdBy?.toString()}
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer active:scale-98"
            >
              Close Panel
            </button>

            <div className="flex items-center gap-2">
              {hasDeletePermission && (
                <button
                  onClick={() => onDeleteClick(employee)}
                  className="px-4 py-2.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}

              {hasEditPermission && (
                <button
                  onClick={() => onEditClick(employee)}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Edit2 size={13} />
                  Edit Employee
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
