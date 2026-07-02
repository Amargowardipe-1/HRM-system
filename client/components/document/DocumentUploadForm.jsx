"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload } from "lucide-react";

const DOCUMENT_TYPES = [
  "Aadhar Card",
  "PAN Card",
  "Resume",
  "Offer Letter",
  "Education Certificate",
  "Other",
];

export function DocumentUploadForm({ initialData = null, onSubmit, isSubmitting = false, error = "" }) {
  const [form, setForm] = useState({
    documentType: DOCUMENT_TYPES[0],
    remarks: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        documentType: initialData.documentType || DOCUMENT_TYPES[0],
        remarks: initialData.remarks || "",
      });
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("documentType", form.documentType);
    formData.append("remarks", form.remarks);
    if (file) {
      formData.append("document", file);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4.5 p-6 max-w-[500px] w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Document Type (hidden or disabled if editing, since type usually shouldn't change, but let's allow selection if new) */}
      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Document Type
        <select
          name="documentType"
          value={form.documentType}
          disabled={!!initialData}
          onChange={(e) => setForm((prev) => ({ ...prev, documentType: e.target.value }))}
          className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {/* File Input */}
      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Upload Document (PDF, PNG, JPG - Max 5MB)
        <div className="relative border-2 border-dashed border-slate-200 hover:border-brand-primary/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/50 cursor-pointer">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            required={!initialData}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="text-slate-400" size={24} />
          <span className="text-xs text-slate-600 font-semibold text-center">
            {file ? file.name : initialData ? "Choose a new file to replace existing" : "Drag and drop or click to upload"}
          </span>
          {file && (
            <span className="text-[10px] text-brand-muted font-mono">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          )}
        </div>
      </label>

      {/* Remarks */}
      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Remarks / Notes
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
          rows={3}
          placeholder="Add any notes about this document..."
          className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all placeholder:text-slate-400"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
        {initialData ? "Update Document" : "Upload Document"}
      </button>
    </form>
  );
}
