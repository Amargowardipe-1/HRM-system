"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const HOLIDAY_TYPES = [
  "National Holiday",
  "Restricted Holiday",
  "Company Holiday",
];

export function HolidayForm({ initialData = null, onSubmit, isSubmitting = false, error = "" }) {
  const [form, setForm] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    type: HOLIDAY_TYPES[0],
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : "",
        type: initialData.type || HOLIDAY_TYPES[0],
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4.5 p-6 max-w-[500px] w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}

      <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
        Holiday Name
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="New Year's Day"
          className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer"
          />
        </label>

        <label className="grid gap-1.5 text-slate-700 text-xs font-semibold">
          Holiday Type
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all cursor-pointer text-slate-600"
          >
            {HOLIDAY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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
          rows={3}
          placeholder="Add details or significance of the holiday..."
          className="w-full border border-slate-200 rounded-lg bg-white p-3.5 outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/8 text-sm transition-all placeholder:text-slate-400"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
        {initialData ? "Save Changes" : "Add Holiday"}
      </button>
    </form>
  );
}
