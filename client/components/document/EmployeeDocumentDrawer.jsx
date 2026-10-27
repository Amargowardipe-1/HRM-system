"use client";

import { useEffect } from "react";
import {
  FileText,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Plus,
  Shield,
  Building2,
  Calendar,
  HardDrive,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDepartmentName(dept) {
  if (!dept) return "General";
  if (typeof dept === "string") return dept;
  if (typeof dept === "object") {
    if (typeof dept.name === "string") return dept.name;
    if (dept.name && typeof dept.name === "object") return getDepartmentName(dept.name);
    return dept.title || "General";
  }
  return "General";
}

export function EmployeeDocumentDrawer({
  isOpen,
  onClose,
  employee,
  documents = [],
  isAdminOrHR = false,
  onPreviewClick,
  onDownloadClick,
  onVerifyClick,
  onEditClick,
  onDeleteClick,
  onUploadClick,
}) {
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

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    employee.name ||
    "Employee";

  const verifiedCount = documents.filter((d) => d.status === "Verified").length;
  const pendingCount = documents.filter((d) => d.status === "Pending" || !d.status).length;
  const rejectedCount = documents.filter((d) => d.status === "Rejected").length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 max-sm:pl-0">
        <div className="w-screen max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-out animate-in slide-in-from-right">
          
          {/* Header Banner */}
          <div className="relative h-28 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-600 shrink-0 p-6 flex items-start justify-between">
            <div className="relative z-10">
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                Document Vault
              </span>
              <p className="text-white/90 text-sm font-medium mt-0.5">
                Verification & Compliance Dossier
              </p>
            </div>

            <button
              onClick={onClose}
              className="relative z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md active:scale-95"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Identity Section */}
          <div className="px-6 pb-4 pt-0 border-b border-slate-100 relative bg-white shrink-0">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-2xl font-black flex items-center justify-center shadow-lg border-4 border-white">
                {fullName.charAt(0).toUpperCase()}
              </div>

              {onUploadClick && (
                <button
                  onClick={() => onUploadClick(employee)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Plus size={14} />
                  Upload Document
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {fullName}
                </h2>
                <span className="inline-flex items-center font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.employeeCode || "N/A"}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Building2 size={12} />
                  {getDepartmentName(employee.department)}
                </span>
              </div>
            </div>

            {/* Quick Stat Pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <FileText size={12} className="text-slate-500" />
                {documents.length} Total
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {verifiedCount} Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle size={12} className="text-amber-600" />
                {pendingCount} Pending
              </span>
              {rejectedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle size={12} className="text-rose-600" />
                  {rejectedCount} Rejected
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body: Uploaded Documents List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {documents.length > 0 ? (
              documents.map((doc) => {
                const isVerified = doc.status === "Verified";
                const isRejected = doc.status === "Rejected";

                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all hover:shadow-sm"
                  >
                    {/* Top Row: Type & Status */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                          <FileText size={17} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {doc.documentType}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                            Uploaded on {formatDate(doc.createdAt)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isVerified && <CheckCircle2 size={12} />}
                        {isRejected && <XCircle size={12} />}
                        {!isVerified && !isRejected && <AlertCircle size={12} />}
                        {doc.status || "Pending"}
                      </span>
                    </div>

                    {/* File Meta */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600 mb-3">
                      <span className="truncate font-medium text-slate-700" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                      <span className="shrink-0 font-mono text-slate-400 font-semibold text-[11px]">
                        {formatSize(doc.fileSize)}
                      </span>
                    </div>

                    {/* Remarks if any */}
                    {doc.remarks && (
                      <p className="text-xs text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 mb-3 italic">
                        "{doc.remarks}"
                      </p>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPreviewClick(doc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Eye size={13} />
                          Preview
                        </button>

                        <button
                          onClick={() => onDownloadClick(doc.fileUrl, doc.fileName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdminOrHR && (
                          <button
                            onClick={() => onVerifyClick(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Shield size={13} />
                            Verify
                          </button>
                        )}

                        {onEditClick && (
                          <button
                            onClick={() => onEditClick(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {onDeleteClick && (
                          <button
                            onClick={() => onDeleteClick(doc._id, doc.documentType)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <FileText size={26} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Documents Uploaded</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                  {fullName} has not uploaded any verification or compliance documents yet.
                </p>
                {onUploadClick && (
                  <button
                    onClick={() => onUploadClick(employee)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus size={14} />
                    Upload Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              Showing {documents.length} document(s)
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-98"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
