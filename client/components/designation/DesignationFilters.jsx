"use client";

import { Search } from "lucide-react";

const DESIGNATION_STATUSES = ["Active", "Inactive"];

export function DesignationFilters({
  searchTerm,
  onSearchChange,
  selectedDept,
  onDeptChange,
  selectedStatus,
  onStatusChange,
  departments = [],
}) {
  return (
    <section
      className="grid grid-cols-[1fr_auto_auto] max-md:grid-cols-1 gap-4 items-center border border-slate-200/80 rounded-xl bg-white shadow-sm p-4.5"
      aria-label="Designation filters"
    >
      <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
        <Search size={18} />
        <input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search designations by title..."
          className="w-full border-0 outline-none bg-transparent text-brand-text text-sm placeholder:text-slate-400"
        />
      </div>

      <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
        <select
          value={selectedDept}
          onChange={(e) => onDeptChange(e.target.value)}
          className="min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer text-slate-600"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="min-h-[40px] border border-slate-200 rounded-lg bg-white px-3.5 outline-none focus:border-brand-primary text-sm transition-all cursor-pointer text-slate-600"
        >
          <option value="">All Statuses</option>
          {DESIGNATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
