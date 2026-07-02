"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export function EmployeeFilters({
  searchTerm,
  roleFilter,
  filteredCount,
  totalCount,
  onSearchChange,
  onRoleChange,
  roles = ["Employee", "HR", "Admin"],
}) {
  return (
    <section className="grid grid-cols-[1fr_190px_auto] max-md:grid-cols-1 gap-3.5 items-center border border-slate-200/80 rounded-xl bg-white shadow-sm p-4.5" aria-label="Employee filters">
      <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
        <Search size={18} />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email"
          className="w-full border-0 outline-none bg-transparent text-brand-text text-sm placeholder:text-slate-400"
        />
      </div>
      
      <label className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all cursor-pointer">
        <SlidersHorizontal size={17} />
        <select
          value={roleFilter}
          onChange={(event) => onRoleChange(event.target.value)}
          className="w-full border-0 outline-none bg-transparent text-brand-text text-sm cursor-pointer"
        >
          <option value="All">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      
      <div className="text-right max-md:text-left text-brand-muted text-sm font-semibold whitespace-nowrap px-1">
        {filteredCount} of {totalCount} users
      </div>
    </section>
  );
}
