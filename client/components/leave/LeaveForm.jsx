"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

export function LeaveForm({ onSubmit, isSubmitting = false, error = "" }) {
  const [form, setForm] = useState({
    leaveType: LEAVE_TYPES[0],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setValidationError("End date must be greater than or equal to start date.");
      return;
    }

    if (form.reason.trim().length < 5) {
      setValidationError("Reason must be at least 5 characters long.");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4.5 p-6 max-w-[500px] w-full">
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error || validationError}
        </div>
      )}

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Leave Type
        <select
          name="leaveType"
          value={form.leaveType}
          onChange={handleChange}
          className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer text-slate-600"
        >
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Start Date
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
          />
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          End Date
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Reason for Leave
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Please explain the reason for your leave request..."
          className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all placeholder:text-slate-400"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
        Submit Leave Application
      </button>
    </form>
  );
}
