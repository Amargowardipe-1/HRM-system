"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { Building2, Loader2, KeyRound, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await resetPassword(token, password, confirmPassword);
      setMessage(res.message || "Your password has been successfully reset.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
          <p className="text-sm text-brand-muted">
            Enter your new secure password below.
          </p>
        </div>
      </div>

      {!token && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong>Missing Token:</strong>
            <p className="mt-1">
              No reset token found in the URL. Please make sure to click the link sent to your email.
            </p>
            <Link href="/forgot-password" className="mt-2 block font-bold hover:underline">
              Request new link &rarr;
            </Link>
          </div>
        </div>
      )}

      {message ? (
        <div className="grid gap-4.5 text-center justify-items-center py-4 animate-fade-in">
          <div className="grid w-12 h-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Password Reset!</h3>
            <p className="text-xs text-brand-muted leading-relaxed mt-1.5">
              {message}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-2.5">
              Redirecting you to login page...
            </p>
          </div>
        </div>
      ) : (
        token && (
          <form onSubmit={handleSubmit} className="grid gap-4.5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              New Password
              <div className="relative">
                <KeyRound size={17} className="absolute left-3 top-3 text-brand-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[42px] border border-slate-200 rounded-lg pl-10 pr-3.5 bg-white outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 text-sm transition-all"
                />
              </div>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Confirm New Password
              <div className="relative">
                <KeyRound size={17} className="absolute left-3 top-3 text-brand-muted" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary hover:underline transition-all"
              >
                <ArrowLeft size={13} /> Cancel & return to Login
              </Link>
            </div>
          </form>
        )
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="grid place-items-center min-h-screen bg-radial from-[#eefcf8] to-[#f4f7fb] p-5 font-sans">
      <Suspense fallback={
        <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-md border border-brand-primary/15 rounded-2xl shadow-xl p-8 grid place-items-center min-h-[250px]">
          <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="animate-spin text-brand-primary" size={24} />
            Initializing reset portal...
          </div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
