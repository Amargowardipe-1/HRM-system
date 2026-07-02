"use client";

import { Cake, Gift, Calendar, User, Briefcase, Heart, CalendarCheck } from "lucide-react";

// =========================================================
// 1. HR Analytics Widget (Gender & Employment Type)
// =========================================================
export function HrAnalyticsWidget({ genderData = [], employmentTypeData = [] }) {
  // Process Gender Data
  const totalGender = genderData.reduce((sum, d) => sum + d.count, 0) || 1;
  const maleCount = genderData.find((d) => d._id === "Male")?.count || 0;
  const femaleCount = genderData.find((d) => d._id === "Female")?.count || 0;
  const otherCount = genderData.find((d) => d._id === "Other")?.count || 0;

  const malePercent = Math.round((maleCount / totalGender) * 100);
  const femalePercent = Math.round((femaleCount / totalGender) * 100);
  const otherPercent = Math.round((otherCount / totalGender) * 100);

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-5 flex-1">
      <div>
        <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
          <Heart size={16} className="text-rose-500" />
          Workforce Analytics
        </h3>
        <p className="text-xs text-brand-muted mt-0.5">Gender diversity & contract types.</p>
      </div>

      {/* Gender Diversity Ratio */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-700">Gender Diversity Ratio</span>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
          {maleCount > 0 && (
            <div
              style={{ width: `${malePercent}%` }}
              className="bg-blue-500 transition-all"
              title={`Male: ${malePercent}%`}
            />
          )}
          {femaleCount > 0 && (
            <div
              style={{ width: `${femalePercent}%` }}
              className="bg-rose-400 transition-all"
              title={`Female: ${femalePercent}%`}
            />
          )}
          {otherCount > 0 && (
            <div
              style={{ width: `${otherPercent}%` }}
              className="bg-teal-400 transition-all"
              title={`Other: ${otherPercent}%`}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Male ({malePercent}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-400" /> Female ({femalePercent}%)
          </span>
          {otherCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-teal-400" /> Other ({otherPercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Employment Types */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-700">Employment Types</span>
        <div className="grid gap-2.5">
          {employmentTypeData.map((item, idx) => {
            const total = employmentTypeData.reduce((sum, d) => sum + d.count, 0) || 1;
            const percent = Math.round((item.count / total) * 100);

            return (
              <div key={idx} className="grid gap-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{item._id || "Unassigned"}</span>
                  <span className="font-bold text-brand-text">{item.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full bg-brand-primary rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HolidaysCelebrationsWidget({ birthdays = [], holidays = [] }) {
  const currentMonthName = new Date().toLocaleString("en-IN", { month: "long" });

  const formatHolidayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-5 flex-1">
      <div>
        <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
          <Gift size={16} className="text-brand-primary" />
          Holidays & Celebrations
        </h3>
        <p className="text-xs text-brand-muted mt-0.5">Events and birthdays for this month.</p>
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
        {/* Birthdays */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Cake size={13} className="text-pink-500" />
            Birthdays in {currentMonthName}
          </span>
          <div className="flex flex-col gap-2.5">
            {birthdays.length ? (
              birthdays.map((b) => (
                <div key={b._id} className="flex items-center gap-2 text-xs">
                  <span className="grid w-[26px] h-[26px] place-items-center rounded-lg bg-pink-50 text-pink-600 font-bold shrink-0">
                    {b.name.slice(0, 1)}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-700 block">{b.name}</span>
                    <small className="text-slate-400 font-medium">
                      {new Date(b.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No birthdays this month.</span>
            )}
          </div>
        </div>

        {/* Holidays */}
        <div className="flex flex-col gap-3 border-l border-slate-100 pl-4 max-sm:border-l-0 max-sm:pl-0">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Calendar size={13} className="text-brand-primary" />
            Upcoming Holidays
          </span>
          <div className="flex flex-col gap-2.5">
            {holidays.length ? (
              holidays.map((h) => (
                <div key={h._id} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-650 truncate max-w-[120px]" title={h.name}>
                    {h.name}
                  </span>
                  <span className="font-bold text-brand-primary font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    {formatHolidayDate(h.date)}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No upcoming holidays.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 3. Leave Balance / Utilization Widget (Employee Only)
// =========================================================
export function LeaveBalanceWidget({ approvedCount = 0, pendingCount = 0, totalAllowance = 15 }) {
  const remaining = Math.max(0, totalAllowance - approvedCount);
  const usedPercent = Math.min(100, Math.round((approvedCount / totalAllowance) * 100));

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
        <CalendarCheck size={16} className="text-brand-primary" />
        Leave Balance Utilization
      </h3>

      <div className="flex items-center justify-around gap-6 py-2 max-sm:flex-col">
        {/* Circular Progress Bar */}
        <div className="relative w-[110px] h-[110px]">
          <svg width="110" height="110" className="-rotate-90">
            <circle cx="55" cy="55" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
            <circle
              cx="55"
              cy="55"
              r="45"
              fill="transparent"
              stroke="#2ec4b6"
              strokeWidth="8"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - (282.7 * usedPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-brand-text leading-none">{remaining}</span>
            <small className="text-[9px] text-brand-muted font-bold uppercase tracking-wider mt-1">
              Days Left
            </small>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between gap-6 font-medium text-slate-600">
            <span>Total Allowance:</span>
            <strong className="text-brand-text">{totalAllowance} days</strong>
          </div>
          <div className="flex justify-between gap-6 font-medium text-slate-600">
            <span>Approved Leaves:</span>
            <strong className="text-emerald-600">{approvedCount} days</strong>
          </div>
          <div className="flex justify-between gap-6 font-medium text-slate-600">
            <span>Pending Approvals:</span>
            <strong className="text-amber-500">{pendingCount} days</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
