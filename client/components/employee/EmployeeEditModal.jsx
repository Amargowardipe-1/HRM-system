"use client";

import { useState } from "react";
import { CheckCircle2, Edit2, X } from "lucide-react";
import { EmployeeForm } from "./EmployeeForm";

export function EmployeeEditModal({ isOpen, onClose, employee, onEdit, departments = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !employee) return null;

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await onEdit(employee._id, formData);
      setMessage("Employee updated successfully.");
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3" role="presentation" onMouseDown={onClose}>
      <section
        className="w-full max-w-[560px] max-h-[calc(100vh-48px)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
          <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
            <Edit2 size={19} />
          </div>
          <div>
            <h2 id="edit-user-title" className="text-lg font-bold text-brand-text">Edit User</h2>
            <p className="text-sm text-brand-muted mt-0.5">Modify employee details.</p>
          </div>
          <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <div className="px-6">
          {error ? <p className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3.5 text-red-600 text-sm font-semibold mt-4.5">{error}</p> : null}
          {message ? (
            <p className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3.5 text-emerald-600 text-sm font-semibold mt-4.5 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {message}
            </p>
          ) : null}
        </div>

        <EmployeeForm
          initialData={employee}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          buttonText={isSubmitting ? "Saving..." : "Save Changes"}
          showIsActive={true}
          isEdit={true}
          departments={departments}
        />
      </section>
    </div>
  );
}
