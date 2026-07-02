"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardCard } from "./DashboardCard";
import { AttendanceDoughnut, DepartmentBarChart } from "./DashboardCharts";
import { HrAnalyticsWidget, HolidaysCelebrationsWidget, LeaveBalanceWidget } from "./DashboardWidgets";
import { DashboardActivities } from "./DashboardActivities";
import { Users, Building2, CalendarDays, CalendarCheck, Clock } from "lucide-react";

export function DashboardClient({ stats = {} }) {
  const { user } = useAuth() || {};
  const isAdminOrHR = stats.role === "Admin" || stats.role === "HR";

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "User";

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1280px] mx-auto w-full">
      {/* CSS Keyframe Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Welcome Banner */}
      <section
        className="relative overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-1.5 animate-fade-in-up"
        style={{ animationDelay: "0ms" }}
        aria-label="Welcome"
      >
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-brand-primary to-brand-primary-dark opacity-5 blur-xl rounded-full" />
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-sm text-brand-muted">
          Welcome back to the People Ops Dashboard. Here is what's happening today.
        </p>
      </section>

      {/* Metrics Cards */}
      <section className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
        {isAdminOrHR ? (
          <>
            <div className="animate-fade-in-up" style={{ animationDelay: "75ms" }}>
              <DashboardCard
                title="Total Employees"
                value={stats.summary?.totalEmployees || 0}
                icon={Users}
                description="Active staff members in the directory"
                gradientClass="bg-gradient-to-br from-[#1b4332] to-brand-primary"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <DashboardCard
                title="Total Departments"
                value={stats.summary?.totalDepartments || 0}
                icon={Building2}
                description="Functional business units configured"
                gradientClass="bg-gradient-to-br from-blue-600 to-indigo-700"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "225ms" }}>
              <DashboardCard
                title="Present Today"
                value={stats.summary?.presentToday || 0}
                icon={CalendarDays}
                description="Active check-ins logged for today"
                gradientClass="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <DashboardCard
                title="Pending Leaves"
                value={stats.summary?.pendingLeaves || 0}
                icon={CalendarCheck}
                description="Leave applications awaiting approval"
                gradientClass="bg-gradient-to-br from-amber-500 to-orange-600"
              />
            </div>
          </>
        ) : (
          <>
            <div className="animate-fade-in-up" style={{ animationDelay: "75ms" }}>
              <DashboardCard
                title="Days Present"
                value={stats.summary?.presentDays || 0}
                icon={CalendarDays}
                description="Days present or late this month"
                gradientClass="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <DashboardCard
                title="Pending Leaves"
                value={stats.summary?.pendingLeaves || 0}
                icon={CalendarCheck}
                description="Your pending leave requests"
                gradientClass="bg-gradient-to-br from-amber-500 to-orange-600"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "225ms" }}>
              <DashboardCard
                title="Approved Leaves"
                value={stats.summary?.approvedLeaves || 0}
                icon={CalendarCheck}
                description="Leaves approved in the calendar"
                gradientClass="bg-gradient-to-br from-[#1b4332] to-brand-primary"
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <DashboardCard
                title="Avg. Hours / Day"
                value={stats.summary?.avgWorkingHours ? `${stats.summary.avgWorkingHours}h` : "0h"}
                icon={Clock}
                description="Average daily work hours logged"
                gradientClass="bg-gradient-to-br from-blue-600 to-indigo-700"
              />
            </div>
          </>
        )}
      </section>

      {/* Charts Section */}
      <section className="flex gap-6 max-lg:flex-col items-stretch">
        <div className="flex-1 animate-fade-in-up" style={{ animationDelay: "375ms" }}>
          <AttendanceDoughnut data={stats.attendanceBreakdown || {}} />
        </div>
        <div className="flex-1 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          {isAdminOrHR ? (
            <DepartmentBarChart data={stats.departmentDistribution || []} />
          ) : (
            <LeaveBalanceWidget
              approvedCount={stats.summary?.approvedLeaves || 0}
              pendingCount={stats.summary?.pendingLeaves || 0}
              totalAllowance={stats.summary?.totalAllowedLeaves || 15}
            />
          )}
        </div>
      </section>

      {/* HR Analytics / Celebrations Widgets (Admin/HR Only) */}
      {isAdminOrHR && (
        <section className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">
          <div className="animate-fade-in-up" style={{ animationDelay: "525ms" }}>
            <HrAnalyticsWidget
              genderData={stats.genderDistribution || []}
              employmentTypeData={stats.employmentTypeDistribution || []}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <HolidaysCelebrationsWidget
              birthdays={stats.upcomingBirthdays || []}
              holidays={stats.upcomingHolidays || []}
            />
          </div>
        </section>
      )}

      {/* Employee Celebrations Widget (Employee Only) */}
      {!isAdminOrHR && (
        <section className="grid grid-cols-1 gap-6">
          <div className="animate-fade-in-up" style={{ animationDelay: "525ms" }}>
            <HolidaysCelebrationsWidget
              birthdays={stats.upcomingBirthdays || []}
              holidays={stats.upcomingHolidays || []}
            />
          </div>
        </section>
      )}

      {/* Activities Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: "675ms" }}>
        <DashboardActivities
          attendance={stats.recentActivities?.attendance || []}
          leaves={stats.recentActivities?.leaves || []}
          isAdminOrHR={isAdminOrHR}
        />
      </div>
    </main>
  );
}
