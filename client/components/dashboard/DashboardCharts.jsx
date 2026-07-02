"use client";

import { Users, Building2, CalendarDays, CalendarCheck } from "lucide-react";

// =========================================================
// 1. Attendance Doughnut Chart (SVG)
// =========================================================
export function AttendanceDoughnut({ data = {} }) {
  const present = data.Present || 0;
  const late = data.Late || 0;
  const halfDay = data.HalfDay || 0;
  const absent = data.Absent || 0;
  const total = present + late + halfDay + absent;

  const categories = [
    { label: "Present", value: present, color: "#10b981" }, // Emerald-500
    { label: "Late", value: late, color: "#f59e0b" },       // Amber-500
    { label: "Half Day", value: halfDay, color: "#f97316" },   // Orange-500
    { label: "Absent", value: absent, color: "#ef4444" },     // Rose-500
  ];

  // SVG parameters
  const size = 180;
  const radius = 50;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius; // ~314.16

  let accumulatedPercentage = 0;

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
        <CalendarDays size={16} className="text-brand-primary" />
        Today's Attendance Overview
      </h3>

      <div className="flex items-center justify-around gap-6 py-2 max-sm:flex-col">
        {/* Doughnut SVG */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {total > 0 &&
              categories.map((cat, idx) => {
                if (cat.value === 0) return null;
                const percentage = (cat.value / total) * 100;
                const strokeLength = (percentage / 100) * circumference;
                const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
                accumulatedPercentage += percentage;

                return (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:scale-102 origin-center cursor-pointer"
                  />
                );
              })}
          </svg>
          {/* Inner Total text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-brand-text leading-none">{total}</span>
            <small className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mt-1">
              Staff Total
            </small>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 shrink-0">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="font-semibold text-slate-700 w-16">{cat.label}</span>
              <span className="font-bold text-brand-text font-mono bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                {cat.value}
              </span>
              {total > 0 && (
                <span className="text-slate-400 font-medium font-mono text-[10px]">
                  ({((cat.value / total) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 2. Department Employee Bar Chart (SVG)
// =========================================================
export function DepartmentBarChart({ data = [] }) {
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingLeft = 45;
  const paddingBottom = 30;
  const paddingRight = 10;
  const paddingTop = 15;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = data.length ? Math.max(...data.map((d) => d.count), 4) : 4;
  const yTicks = [0, Math.ceil(maxVal / 2), maxVal];

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-4 flex-1">
      <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
        <Building2 size={16} className="text-brand-primary" />
        Department Wise Headcount
      </h3>

      <div className="w-full overflow-hidden">
        {data.length ? (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
            {/* Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, idx) => {
              const y = chartHeight - paddingBottom - (tick / maxVal) * graphHeight;
              return (
                <g key={idx} className="opacity-75">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? "0" : "4"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-bold font-mono fill-slate-400"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Bars & X-Axis Labels */}
            {data.map((d, idx) => {
              const barWidth = Math.min(32, graphWidth / data.length - 16);
              const spacing = graphWidth / data.length;
              const x = paddingLeft + idx * spacing + (spacing - barWidth) / 2;
              const barHeight = (d.count / maxVal) * graphHeight;
              const y = chartHeight - paddingBottom - barHeight;

              return (
                <g key={idx} className="group cursor-pointer">
                  {/* Bar Rect */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 3)}
                    rx={4}
                    fill="url(#barGradient)"
                    className="transition-all duration-300 hover:fill-brand-primary-dark"
                  />
                  {/* Hover Tooltip Value */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold font-mono fill-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {d.count}
                  </text>
                  {/* X-Axis Label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - paddingBottom + 16}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-500"
                  >
                    {d.name.length > 8 ? `${d.name.slice(0, 7)}…` : d.name}
                  </text>
                </g>
              );
            })}

            {/* Gradient definition for bars */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2ec4b6" />
                <stop offset="100%" stopColor="#208b81" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          <div className="h-[150px] flex items-center justify-center text-xs text-brand-muted font-medium">
            No department distribution data.
          </div>
        )}
      </div>
    </div>
  );
}
