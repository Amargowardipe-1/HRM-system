"use client";

import { AlertTriangle, X } from "lucide-react";

export function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3" role="presentation" onMouseDown={onClose}>
      <section
        className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-center gap-3.5 border-b border-slate-200/80 p-5 relative">
          <div className={`grid w-[42px] h-[42px] place-items-center rounded-xl shrink-0 ${
            isDangerous ? "bg-amber-50 text-amber-600" : "bg-[#e7f3f1] text-brand-primary"
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 id="confirm-title" className="text-base font-bold text-brand-text">{title}</h2>
          </div>
          <button className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Message body */}
        <div className="p-6">
          <p className="text-brand-muted text-sm leading-relaxed margin-0">
            {message}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50/80">
          <button onClick={onClose} className="inline-flex min-h-[38px] items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 rounded-lg font-semibold px-4 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-98 cursor-pointer text-sm">
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className={`inline-flex min-h-[38px] items-center justify-center gap-2 text-white rounded-lg font-semibold px-4 transition-all active:scale-98 cursor-pointer text-sm ${
              isDangerous
                ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10"
                : "bg-brand-primary hover:bg-brand-primary-dark shadow-md shadow-brand-primary/10"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
