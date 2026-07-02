"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  CalendarCheck,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Settings,
  UsersRound,
  Coins,
  Landmark,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permissions: ["dashboard:view"] },
  { href: "/employees", label: "Employees", icon: UsersRound, permissions: ["employees:view_all"] },
  { href: "/departments", label: "Departments", icon: FolderTree, permissions: ["departments:view"] },
  { href: "/designations", label: "Designations", icon: Briefcase, permissions: ["designations:view"] },
  { href: "/attendance", label: "Attendance", icon: CalendarDays, permissions: ["attendance:view_all", "attendance:view_own"] },
  { href: "/leaves", label: "Leaves", icon: CalendarCheck, permissions: ["leave:view_all", "leave:view_own"] },
  { href: "/holidays", label: "Holidays", icon: Calendar, permissions: ["holidays:view"] },
  { href: "/documents", label: "Documents", icon: FileText, permissions: ["documents:view_all", "documents:view_own"] },
  { href: "/payroll", label: "Payroll", icon: Coins, permissions: ["payroll:view_all", "payroll:view_own"] },
  { href: "/bank-details", label: "Bank Details", icon: Landmark, permissions: ["bank_details:view_all", "bank_details:view_own"] },
  { href: "/settings", label: "Settings", icon: Settings, permissions: ["settings:view"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth() || {};

  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between p-6 max-md:p-4 bg-white text-slate-600 border-r border-slate-200/80 shadow-sm max-sm:hidden shrink-0">
      <div>
        {/* Logo Section */}
        <Link
          className="flex items-center gap-3.5 mb-8 max-md:mb-6 max-md:justify-center px-1"
          href="/dashboard"
          aria-label="HRM Home"
        >
          <span className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-md shrink-0">
            <Building2 size={22} />
          </span>
          <span className="max-md:hidden">
            <strong className="block text-base font-extrabold tracking-wide leading-none text-brand-text">
              HRM
            </strong>
            <small className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mt-1 block">
              People Ops
            </small>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="grid gap-2" aria-label="Main navigation">
          {navItems.map((item) => {
            // Check dynamic permissions
            if (item.permissions && item.permissions.length > 0) {
              const hasPermission = item.permissions.some(perm => user?.permissions?.includes(perm));
              if (!hasPermission) return null;
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={`flex min-h-[44px] items-center gap-3.5 rounded-lg px-3.5 font-semibold text-sm transition-all hover:bg-slate-50 hover:text-brand-primary hover:translate-x-1 max-md:justify-center border-l-3 ${
                  isActive
                    ? "bg-brand-primary/8 text-brand-primary border-l-brand-primary"
                    : "text-slate-500 border-l-transparent"
                }`}
                href={item.href}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-brand-primary" : "text-slate-400"}
                />
                <span className="max-md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button at the bottom of the sidebar */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        <button
          onClick={logout}
          className="w-full bg-transparent border-0 text-left cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50/50 flex items-center gap-3.5 rounded-lg px-3.5 min-h-[44px] transition-all hover:translate-x-1 max-md:justify-center font-semibold text-sm"
        >
          <LogOut size={18} />
          <span className="max-md:hidden">Logout</span>
        </button>
      </div>
    </aside>
  );
}
