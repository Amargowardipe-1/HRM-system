"use client";

import { X, Briefcase } from "lucide-react";

export function DesignationModal({ isOpen, onClose, title, subtitle, children, maxWidthClass = "max-w-[500px]" }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/40 p-6 backdrop-blur-xs max-sm:items-end max-sm:p-3"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`w-full ${maxWidthClass} bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 border-b border-slate-200 p-5 relative">
          <div className="grid w-[42px] h-[42px] place-items-center rounded-xl bg-[#e7f3f1] text-brand-primary">
            <Briefcase size={19} />
          </div>
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-brand-text">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-brand-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            className="absolute top-4.5 right-4.5 grid w-[34px] h-[34px] place-items-center border border-slate-200 rounded-lg bg-white text-brand-text hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-98 cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
