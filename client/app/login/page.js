"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid email or password");
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
              Welcome to HRM
            </h1>
            <p className="text-sm text-brand-muted">
              Sign in to manage your employee workforce.
            </p>
          </div>
        </div>

        {/* Login Form */}
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
                placeholder="admin@hrm.com"
                className="w-full min-h-[42px] border border-slate-200 rounded-lg pl-10 pr-3.5 bg-white outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 text-sm transition-all"
              />
            </div>
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
            Password
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
            <div className="text-right mt-1.5">
              <Link href="/forgot-password" className="text-xs font-bold text-brand-primary hover:underline transition-all">
                Forgot Password?
              </Link>
            </div>
          </label>

          <button
            disabled={isSubmitting}
            className="mt-2 w-full min-h-[44px] bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-brand-primary/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Seed Credentials Callout */}
        <div className="bg-[#fdf8f6] border border-[#faebec] rounded-xl p-4 text-xs leading-relaxed text-[#7f2d0f]">
          <strong className="block mb-1 text-brand-accent">
            💡 Quick Testing Credentials:
          </strong>
          <div className="grid gap-0.5">
            <div><strong>Email:</strong> <code className="bg-orange-100/50 px-1 rounded">admin@hrm.com</code></div>
            <div><strong>Password:</strong> <code className="bg-orange-100/50 px-1 rounded">admin123</code></div>
            <div className="mt-1 text-brand-muted italic">
              (Runs automatically on first startup via database seeding)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
