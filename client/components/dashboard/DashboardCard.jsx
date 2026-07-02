"use client";

export function DashboardCard({ title, value, icon: Icon, description, gradientClass }) {
  return (
    <div className="relative overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Background Decorative Accent */}
      <div className={`absolute top-0 right-0 w-[90px] h-[90px] rounded-full blur-2xl opacity-10 ${gradientClass}`} />

      <div className="flex justify-between items-start">
        <div>
          <small className="text-brand-muted text-[11px] font-bold uppercase tracking-wider block">
            {title}
          </small>
          <strong className="text-3xl font-extrabold text-brand-text tracking-tight mt-1.5 block">
            {value}
          </strong>
        </div>
        <span className={`grid w-[42px] h-[42px] place-items-center rounded-xl text-white shadow-md ${gradientClass}`}>
          <Icon size={19} />
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium">{description}</p>
    </div>
  );
}
