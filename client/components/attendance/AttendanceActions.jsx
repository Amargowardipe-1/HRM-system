"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Clock, MessageSquare, Loader2 } from "lucide-react";

export function AttendanceActions({ todayRecord, onCheckIn, onCheckOut, isSubmitting }) {
  const [time, setTime] = useState(new Date());
  const [remarks, setRemarks] = useState("");

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRecordTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    return new Date(dateTimeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    onCheckIn(remarks);
    setRemarks("");
  };

  const handleCheckOutSubmit = (e) => {
    e.preventDefault();
    onCheckOut(remarks);
    setRemarks("");
  };

  return (
    <section className="grid grid-cols-3 max-lg:grid-cols-1 gap-6">
      {/* Time Display Card */}
      <div className="col-span-1 border border-slate-200 rounded-2xl bg-white shadow-sm p-6 flex flex-col items-center justify-center text-center">
        <span className="grid w-[48px] h-[48px] place-items-center rounded-2xl bg-[#e7f3f1] text-brand-primary mb-3">
          <Clock size={22} />
        </span>
        <h2 className="text-3xl font-extrabold text-brand-text tracking-tight font-mono">
          {formatTime(time)}
        </h2>
        <p className="text-xs text-brand-muted font-bold uppercase tracking-wider mt-1.5">
          {formatDate(time)}
        </p>
      </div>

      {/* Action Controller Card */}
      <div className="col-span-2 border border-slate-200 rounded-2xl bg-white shadow-sm p-6 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-brand-text">Daily Attendance Logger</h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Log your daily check-in and check-out times. Please write remarks if late or early.
          </p>
        </div>

        {/* Remarks Input */}
        <div className="flex gap-2.5 items-center border border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 focus-within:border-brand-primary focus-within:bg-white focus-within:ring-3 focus-within:ring-brand-primary/8 transition-all">
          <MessageSquare size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={hasCheckedOut}
            placeholder={
              hasCheckedOut
                ? "Attendance complete for today."
                : hasCheckedIn
                ? "Add remarks for checkout (optional)..."
                : "Add remarks for check-in (optional)..."
            }
            className="w-full border-0 outline-none bg-transparent text-brand-text text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCheckInSubmit}
            disabled={hasCheckedIn || isSubmitting}
            className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-xl font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer disabled:cursor-not-allowed border border-transparent"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <LogIn size={16} />
            )}
            {hasCheckedIn
              ? `Checked In (${formatRecordTime(todayRecord.checkIn)})`
              : "Check In"}
          </button>

          <button
            onClick={handleCheckOutSubmit}
            disabled={!hasCheckedIn || hasCheckedOut || isSubmitting}
            className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 rounded-xl font-semibold px-4.5 transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <LogOut size={16} />
            )}
            {hasCheckedOut
              ? `Checked Out (${formatRecordTime(todayRecord.checkOut)})`
              : "Check Out"}
          </button>
        </div>
      </div>
    </section>
  );
}
