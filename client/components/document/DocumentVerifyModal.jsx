"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function DocumentVerifyModal({
  documentInfo = null,
  onVerify,
  isSubmitting = false,
  error = "",
}) {
  const [remarks, setRemarks] = useState(documentInfo?.remarks || "");

  const handleAction = (status) => {
    onVerify(status, remarks);
  };

  return (
    <div className="p-6 max-w-[450px] w-full flex flex-col gap-4.5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs font-semibold text-slate-700 grid gap-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Employee:</span>
          <span className="text-brand-text">
            {documentInfo?.employee
              ? `${documentInfo.employee.firstName} ${documentInfo.employee.lastName}`
              : "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Document Type:</span>
          <span className="text-brand-text">{documentInfo?.documentType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">File Name:</span>
          <a
            href={documentInfo?.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline max-w-[200px] truncate"
          >
            {documentInfo?.fileName}
          </a>
        </div>
      </div>

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        HR Verification Remarks
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          placeholder="Enter review remarks (e.g., 'Aadhar card verified' or 'PAN card number is blurry')..."
          className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all placeholder:text-slate-400 font-medium"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Reject Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleAction("Rejected")}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-red-200 hover:border-red-300 bg-red-50 text-red-600 rounded-lg font-bold text-sm px-4 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
          Reject
        </button>

        {/* Approve Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleAction("Verified")}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm px-4 transition-all shadow-md shadow-emerald-650/10 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          Approve
        </button>
      </div>
    </div>
  );
}
