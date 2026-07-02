"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHoliday, updateHoliday, deleteHoliday, getHolidays } from "@/lib/api";
import { HolidayTable } from "./HolidayTable";
import { HolidayForm } from "./HolidayForm";
import { DesignationModal as HolidayModal } from "@/components/designation/DesignationModal";
import { Plus, RefreshCw, CalendarDays } from "lucide-react";

export function HolidayDashboard({ initialHolidays = [], currentUser = {}, token = null }) {
  const router = useRouter();
  const isAdmin = currentUser.role === "Admin";
  const isHR = currentUser.role === "HR";
  const isAdminOrHR = isAdmin || isHR;

  const [holidays, setHolidays] = useState(initialHolidays);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadAllHolidays = async () => {
    setError("");
    try {
      const data = await getHolidays(token);
      setHolidays(data);
    } catch (err) {
      setError(err.message || "Failed to refresh holiday list.");
    }
  };

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await createHoliday(formData, token);
      await loadAllHolidays();
      setShowCreateModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to add holiday.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await updateHoliday(selectedHoliday._id, formData, token);
      await loadAllHolidays();
      setShowEditModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to update holiday.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete holiday "${name}"?`)) {
      try {
        await deleteHoliday(id, token);
        await loadAllHolidays();
        router.refresh();
      } catch (err) {
        alert(err.message || "Failed to delete holiday.");
      }
    }
  };

  const handleOpenEdit = (holiday) => {
    setSelectedHoliday(holiday);
    setError("");
    setShowEditModal(true);
  };

  return (
    <main className="grid gap-6 p-8 max-md:p-4 max-sm:p-3 max-w-[1000px] mx-auto w-full">
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

      {/* Page Header */}
      <section className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start animate-fade-in-up" style={{ animationDelay: "0ms" }} aria-label="Page title">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Holiday Calendar</h1>
          <p className="text-sm text-brand-muted mt-1">
            View upcoming public, national, and corporate holidays.
          </p>
        </div>
        <div className="flex gap-3 max-sm:w-full">
          {isAdminOrHR && (
            <button
              onClick={() => {
                setError("");
                setShowCreateModal(true);
              }}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold px-4.5 transition-all shadow-md shadow-brand-primary/10 active:scale-98 cursor-pointer max-sm:flex-1"
            >
              <Plus size={18} />
              Add Holiday
            </button>
          )}
          <button
            onClick={loadAllHolidays}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-slate-200 bg-white text-brand-text rounded-lg font-semibold px-4.5 transition-all hover:bg-slate-50 active:scale-98 cursor-pointer max-sm:w-12 max-sm:px-0"
            title="Refresh list"
          >
            <RefreshCw size={17} />
            <span className="max-sm:hidden">Refresh</span>
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold animate-fade-in-up" style={{ animationDelay: "75ms" }}>
          {error}
        </div>
      )}

      {/* Holiday Table */}
      <div className="animate-fade-in-up" style={{ animationDelay: "75ms" }}>
        <HolidayTable
          records={holidays}
          isAdminOrHR={isAdminOrHR}
          onEditClick={handleOpenEdit}
          onDeleteClick={handleDelete}
        />
      </div>

      {/* ADD HOLIDAY MODAL */}
      <HolidayModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Holiday"
        subtitle="Schedule a new holiday in the company calendar."
      >
        <HolidayForm onSubmit={handleCreateSubmit} isSubmitting={isSubmitting} error={error} />
      </HolidayModal>

      {/* EDIT HOLIDAY MODAL */}
      <HolidayModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Holiday"
        subtitle="Modify holiday details, type, or date."
      >
        <HolidayForm
          initialData={selectedHoliday}
          onSubmit={handleEditSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </HolidayModal>
    </main>
  );
}
