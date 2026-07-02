"use client";

export function ProfileCard({ title, icon: Icon, children }) {
  return (
    <section className="border border-slate-200 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-5">
      <h2 className="text-base font-bold text-brand-text border-b border-slate-150 pb-3 flex items-center gap-2">
        <Icon size={18} className="text-brand-primary" />
        {title}
      </h2>
      <div className="grid gap-4.5">{children}</div>
    </section>
  );
}

export function ProfileItem({ label, value, icon: Icon, badgeColor }) {
  return (
    <div className="flex items-center gap-3.5">
      <Icon size={16} className="text-brand-muted shrink-0" />
      <div>
        <small className="block text-brand-muted text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
          {label}
        </small>
        {badgeColor ? (
          <span
            className={`inline-flex min-h-[22px] items-center rounded-full px-2.5 text-[10px] font-bold uppercase tracking-wider mt-1 ${badgeColor}`}
          >
            {value}
          </span>
        ) : (
          <span className="text-sm font-semibold text-brand-text break-all">{value}</span>
        )}
      </div>
    </div>
  );
}
