"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard, ProfileItem } from "./ProfileCard";
import {
  User,
  Mail,
  Shield,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  Coins,
  CheckCircle2,
  Layers,
  X,
} from "lucide-react";

function formatOnlyDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileDashboard({ initialUser, departments = [], token = null }) {
  const { logout, refreshUser } = useAuth() || {};
  const [user, setUser] = useState(initialUser);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Keep local user state in sync if initialUser changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleEditSubmit = async (formData) => {
    setIsSaving(true);
    setEditError("");
    try {
      const updatedEmployee = await updateUser(user.employeeId, formData, token);
      
      // Update local state and trigger global auth refresh for navbar
      setUser({
        ...user,
        ...updatedEmployee,
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        name: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`.trim(),
        phone: updatedEmployee.phone,
        gender: updatedEmployee.gender,
        dob: updatedEmployee.dob,
        email: updatedEmployee.userId?.email || user.email,
      });

      if (refreshUser) {
        await refreshUser();
      }
      
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Employee";

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1000px] mx-auto w-full">
      {/* Header component */}
      <ProfileHeader
        fullName={fullName}
        employeeCode={user.employeeCode}
        designationTitle={user.designation?.title}
        onEditClick={() => setShowEditModal(true)}
        onLogoutClick={logout}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
        {/* Personal Details */}
        <ProfileCard title="Personal Information" icon={User}>
          <ProfileItem label="Email Address" value={user.email || "-"} icon={Mail} />
          <ProfileItem label="Phone Number" value={user.phone || "N/A"} icon={Phone} />
          <ProfileItem label="Gender" value={user.gender || "Male"} icon={User} />
          <ProfileItem label="Date of Birth" value={formatOnlyDate(user.dob)} icon={Calendar} />
        </ProfileCard>

        {/* Job Details */}
        <ProfileCard title="Job Profile" icon={Briefcase}>
          <ProfileItem label="Department" value={user.department?.name || "No Department"} icon={Building2} />
          <ProfileItem label="Job Grade / Level" value={user.designation?.level || "N/A"} icon={Layers} />
          <ProfileItem label="Access Level / Role" value={user.role || "Employee"} icon={Shield} />
          <ProfileItem label="Date Joined" value={formatOnlyDate(user.joiningDate)} icon={Calendar} />
        </ProfileCard>

        {/* Compensation Details */}
        <ProfileCard title="Compensation" icon={Coins}>
          <ProfileItem
            label="Annual Base Salary"
            value={user.salary ? `$${user.salary.toLocaleString()}/yr` : "Not Disclosed"}
            icon={Coins}
          />
          <ProfileItem label="Employment Type" value={user.employmentType || "Full-time"} icon={Shield} />
        </ProfileCard>

        {/* Account Status */}
        <ProfileCard title="Account Status" icon={CheckCircle2}>
          <ProfileItem
            label="Employment Status"
            value={user.status || "Active"}
            icon={CheckCircle2}
            badgeColor={
              user.status === "Active"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : user.status === "On Leave"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }
          />
          <ProfileItem
            label="Credentials Active"
            value={user.isActive ? "Yes" : "No"}
            icon={Shield}
            badgeColor={
              user.isActive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-50 text-slate-400 border border-slate-200"
            }
          />
        </ProfileCard>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3"
          role="presentation"
          onMouseDown={() => setShowEditModal(false)}
        >
          <section
            className="w-full max-w-[650px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
              <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
                <User size={19} />
              </div>
              <div>
                <h2 id="edit-profile-title" className="text-lg font-bold text-brand-text">
                  Edit Personal Details
                </h2>
                <p className="text-sm text-brand-muted mt-0.5">
                  Update your name, contact, gender, DOB, or password.
                </p>
              </div>
              <button
                className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <EmployeeForm
                initialData={user}
                onSubmit={handleEditSubmit}
                isSubmitting={isSaving}
                isEdit={true}
                isSelfEdit={true}
                buttonText="Save Changes"
              />
              {editError && (
                <div className="px-6 pb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold">
                    {editError}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
