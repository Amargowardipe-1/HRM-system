"use client";

import { FileText, Eye, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";

export function DocumentTable({
  records = [],
  isAdminOrHR = false,
  onEditClick,
  onDeleteClick,
  onVerifyClick,
  onPreviewClick,
  onDownloadClick,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Verified":
        return <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />;
      case "Rejected":
        return <XCircle className="text-rose-500 shrink-0" size={14} />;
      default:
        return <AlertCircle className="text-amber-500 shrink-0" size={14} />;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse">
          <thead>
            <tr>
              {isAdminOrHR && (
                <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[180px]">
                  Employee
                </th>
              )}
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[180px]">
                Document Type
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                File Name
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[100px]">
                Size
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[120px]">
                Status
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200">
                Remarks
              </th>
              <th className="bg-slate-50 text-brand-muted text-[11px] font-bold uppercase tracking-wider p-4 text-left border-b border-slate-200 w-[150px]">
                Actions
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
                  {isAdminOrHR && (
                    <td className="p-4 text-sm text-brand-text align-middle font-bold">
                      {rec.employee
                        ? `${rec.employee.firstName} ${rec.employee.lastName}`
                        : "Unknown"}
                      <span className="block text-[10px] text-brand-muted font-mono font-medium mt-0.5">
                        {rec.employee?.employeeCode}
                      </span>
                    </td>
                  )}
                  <td className="p-4 text-sm text-slate-800 align-middle font-semibold">
                    {rec.documentType}
                  </td>
                  <td className="p-4 text-sm text-slate-700 align-middle">
                    <div className="flex items-center gap-2 max-w-[200px] truncate" title={rec.fileName}>
                      <FileText className="text-slate-400 shrink-0" size={15} />
                      <button
                        type="button"
                        onClick={() => onPreviewClick(rec)}
                        className="font-semibold text-brand-primary hover:underline bg-transparent border-0 p-0 cursor-pointer text-left"
                      >
                        {rec.fileName}
                      </button>
                    </div>
                    <small className="text-[10px] text-slate-400 block mt-0.5">
                      Uploaded: {formatDate(rec.createdAt)}
                    </small>
                  </td>
                  <td className="p-4 text-sm text-slate-500 align-middle font-mono font-medium">
                    {formatSize(rec.fileSize)}
                  </td>
                  <td className="p-4 text-sm text-slate-650 align-middle">
                    <span
                      className={`inline-flex min-h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold border ${getStatusBadge(
                        rec.status
                      )}`}
                    >
                      {getStatusIcon(rec.status)}
                      {rec.status}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm text-slate-500 align-middle max-w-[180px] truncate"
                    title={rec.remarks}
                  >
                    {rec.remarks || "–"}
                  </td>
                  <td className="p-4 text-sm text-slate-600 align-middle">
                    <div className="flex gap-2">
                      {/* Preview Button */}
                      <button
                        onClick={() => onPreviewClick(rec)}
                        className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                        title="Preview document"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Download Button (Only visible to Admin or HR) */}
                      {isAdminOrHR && (
                        <button
                          type="button"
                          onClick={() => onDownloadClick(rec.fileUrl, rec.fileName)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                          title="Download document"
                        >
                          <Download size={14} />
                        </button>
                      )}

                      {/* Admin/HR verification button */}
                      {isAdminOrHR ? (
                        <button
                          onClick={() => onVerifyClick(rec)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                          title="Verify document"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      ) : (
                        /* Employee Edit button */
                        <button
                          onClick={() => onEditClick(rec)}
                          className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-brand-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                          title="Re-upload document"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteClick(rec._id, rec.documentType)}
                        className="grid w-[32px] h-[32px] place-items-center border border-slate-200 rounded-lg bg-white text-red-400 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isAdminOrHR ? 7 : 6}
                  className="h-[140px] text-center text-brand-muted font-medium p-4 border-b border-slate-200"
                >
                  No documents uploaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
