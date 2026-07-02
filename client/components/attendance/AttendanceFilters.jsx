"use client";

import { Calendar, User } from "lucide-react";

export function AttendanceFilters({
  selectedDate,
  onDateChange,
  selectedEmployee,
  onEmployeeChange,
  employees = [],
  showEmployeeFilter = false,
}) {
  return (
    <section
      className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 items-center border border-slate-200/80 rounded-xl bg-white shadow-sm p-4.5"
      aria-label="Attendance filters"
    >
      {/* Date Filter */}
      <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-white px-3 text-slate-600 focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
        <Calendar size={16} className="text-slate-400 shrink-0" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full border-0 outline-none bg-transparent text-brand-text text-sm cursor-pointer"
        />
      </div>

      {/* Employee Filter (Only for Admin/HR) */}
      {showEmployeeFilter ? (
        <div className="flex min-h-[40px] items-center gap-2.5 border border-slate-200 rounded-lg bg-white px-3 text-slate-600 focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
          <User size={16} className="text-slate-400 shrink-0" />
          <select
            value={selectedEmployee}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full border-0 outline-none bg-transparent text-brand-text text-sm cursor-pointer text-slate-600"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="text-xs text-brand-muted font-bold tracking-wide px-2 max-sm:hidden">
          Showing your personal attendance logs.
        </div>
      )}
    </section>
  );
}
