"use client";

import { Edit2, LogOut } from "lucide-react";

export function ProfileHeader({ fullName, employeeCode, designationTitle, onEditClick, onLogoutClick }) {
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="relative overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col">
      {/* Decorative Top Gradient Banner */}
      <div className="h-[120px] bg-gradient-to-r from-[#1b4332] via-brand-primary to-[#40916c]" />

      <div className="px-8 pb-8 pt-0 flex flex-row max-sm:flex-col items-end max-sm:items-center gap-6 -mt-10 max-sm:-mt-12 relative z-10">
        {/* Avatar */}
        <span className="grid w-[100px] h-[100px] place-items-center rounded-2xl bg-[#e7f3f1] text-brand-primary-dark font-extrabold text-4xl border-4 border-white shadow-md shrink-0">
          {initials}
        </span>

        {/* User Meta */}
        <div className="flex-1 max-sm:text-center">
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">{fullName}</h1>
          <p className="text-sm text-brand-muted mt-1 flex items-center max-sm:justify-center gap-2">
            <span className="font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {employeeCode || "EMP000"}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-600">{designationTitle || "Staff Member"}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 max-sm:w-full max-sm:flex-col max-sm:mt-4">
          <button
            onClick={onEditClick}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text hover:bg-slate-50 rounded-lg font-semibold px-4.5 transition-all active:scale-98 cursor-pointer max-sm:w-full"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
          <button
            onClick={onLogoutClick}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold px-4.5 transition-all active:scale-98 cursor-pointer max-sm:w-full"
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
}
