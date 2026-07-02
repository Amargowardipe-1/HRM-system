"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { Building2, Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || "A password reset link has been sent to your email address.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid place-items-center min-h-screen bg-radial from-[#eefcf8] to-[#f4f7fb] p-5 font-sans">
      <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-md border border-brand-primary/15 rounded-2xl shadow-xl p-8 grid gap-6">
        
        {/* Brand Logo & Header */}
        <div className="grid justify-items-center text-center gap-3">
          <div className="grid w-[52px] h-[52px] place-items-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <Building2 size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-text mb-1.5">
              Reset Password
            </h1>
            <p className="text-sm text-brand-muted px-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        {message ? (
          <div className="grid gap-4.5 text-center justify-items-center py-4">
            <div className="grid w-12 h-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Email Sent!</h3>
              <p className="text-xs text-brand-muted leading-relaxed mt-1.5 px-3">
                {message}
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4.5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Email Address
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-3 text-brand-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full min-h-[42px] border border-slate-200 rounded-lg pl-10 pr-3.5 bg-white outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 text-sm transition-all"
                />
              </div>
            </label>

            <button
              disabled={isSubmitting}
              className="mt-2 w-full min-h-[44px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center mt-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary hover:underline transition-all"
              >
                <ArrowLeft size={13} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
