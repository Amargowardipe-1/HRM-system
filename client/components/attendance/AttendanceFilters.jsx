"use client";

import { Calendar, User, Search, Filter, Layers, List } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AttendanceFilters({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  selectedDate,
  onDateChange,
  selectedEmployee,
  onEmployeeChange,
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments = [],
  employees = [],
  showEmployeeFilter = false,
  viewMode = "summary",
  onViewModeChange,
}) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4.5 space-y-3.5">
      {/* Top Bar: View Mode Switcher & Month/Year Selectors */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* View Mode Toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("summary")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "summary"
                ? "bg-white text-brand-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={14} />
            Employee Monthly Summary
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("daily")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "daily"
                ? "bg-white text-brand-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List size={14} />
            Daily Date-wise Logs
          </button>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-slate-50 px-3 py-1.5 focus-within:bg-white focus-within:border-brand-primary transition-all">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange && onMonthChange(Number(e.target.value))}
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-800 cursor-pointer"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="border border-slate-200 rounded-xl bg-slate-50 px-3 py-1.5 focus-within:bg-white focus-within:border-brand-primary transition-all">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange && onYearChange(Number(e.target.value))}
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-800 cursor-pointer"
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Search, Department, Specific Date) */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-3 pt-1 border-t border-slate-100">
        {/* Search Employee */}
        <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl bg-slate-50/50 px-3 py-2 focus-within:bg-white focus-within:border-brand-primary transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchQuery || ""}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full border-0 outline-none bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Department Filter */}
        {showEmployeeFilter && departments.length > 0 && (
          <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl bg-slate-50/50 px-3 py-2 focus-within:bg-white focus-within:border-brand-primary transition-all">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={selectedDepartment || ""}
              onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
              className="w-full border-0 outline-none bg-transparent text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Specific Date Filter (Useful for Daily Logs) */}
        {viewMode === "daily" && (
          <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl bg-slate-50/50 px-3 py-2 focus-within:bg-white focus-within:border-brand-primary transition-all">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="w-full border-0 outline-none bg-transparent text-xs font-medium text-slate-800 cursor-pointer"
              title="Filter by specific day"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => onDateChange && onDateChange("")}
                className="text-xs text-slate-400 hover:text-slate-600 shrink-0 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
