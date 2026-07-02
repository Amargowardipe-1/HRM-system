"use client";

import { useState, useEffect } from "react";

const DESIGNATION_LEVELS = ["Intern", "Junior", "Mid", "Senior", "Lead", "Manager"];
const DESIGNATION_STATUSES = ["Active", "Inactive"];

export function DesignationForm({
  initialData = {},
  departments = [],
  onSubmit,
  isSubmitting = false,
  buttonText = "Save",
  error = "",
}) {
  const [form, setForm] = useState({
    title: "",
    department: "",
    level: "Junior",
    description: "",
    status: "Active",
  });

  const initialDataId = initialData?._id;
  const firstDeptId = departments[0]?._id;

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        title: initialData.title || "",
        department: initialData.department?._id || initialData.department || "",
        level: initialData.level || "Junior",
        description: initialData.description || "",
        status: initialData.status || "Active",
      });
    } else {
      setForm({
        title: "",
        department: firstDeptId || "",
        level: "Junior",
        description: "",
        status: "Active",
      });
    }
  }, [initialDataId, firstDeptId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4.5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Title / Designation Name
        <input
          required
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Senior Software Engineer"
          className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
        />
      </label>

      <div className="grid grid-cols-2 gap-3.5">
        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Department
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Job Level
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer"
          >
            {DESIGNATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Summarize the responsibilities of this role..."
          rows={3}
          className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all resize-none"
        />
      </label>

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Status
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer"
        >
          {DESIGNATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <button
        disabled={isSubmitting}
        className="mt-2.5 w-full min-h-[42px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75"
      >
        {isSubmitting ? "Saving..." : buttonText}
      </button>
    </form>
  );
}
