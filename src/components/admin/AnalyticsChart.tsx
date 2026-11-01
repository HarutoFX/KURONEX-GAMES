"use client";

import React, { useState } from "react";

interface DataPoint {
  label: string;
  value: number;
  secondary: number;
}

const DATA_SETS: Record<string, DataPoint[]> = {
  "7D": [
    { label: "Mon", value: 420, secondary: 310 },
    { label: "Tue", value: 580, secondary: 390 },
    { label: "Wed", value: 510, secondary: 440 },
    { label: "Thu", value: 680, secondary: 520 },
    { label: "Fri", value: 890, secondary: 610 },
    { label: "Sat", value: 1140, secondary: 780 },
    { label: "Sun", value: 1280, secondary: 850 },
  ],
  "30D": [
    { label: "W1", value: 2400, secondary: 1800 },
    { label: "W2", value: 3100, secondary: 2200 },
    { label: "W3", value: 3600, secondary: 2700 },
    { label: "W4", value: 4280, secondary: 3150 },
  ],
  "90D": [
    { label: "Aug", value: 8200, secondary: 6400 },
    { label: "Sep", value: 11400, secondary: 8900 },
    { label: "Oct", value: 14900, secondary: 11200 },
  ],
};

export function AnalyticsChart() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = DATA_SETS[timeRange];
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  // SVG Area path calculation
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * plotWidth;
    const y = paddingY + plotHeight - (d.value / maxValue) * plotHeight;
    return { x, y, ...d };
  });

  const lineString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaString = `${paddingX},${paddingY + plotHeight} ${lineString} ${
    paddingX + plotWidth
  },${paddingY + plotHeight}`;

  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6 transition-all duration-200">
      {/* Header with Title and Range Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#35151C]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#FF263D]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Platform Traffic & Session Velocity
            </h3>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Real-time player telemetry, active connections, and cloud-sync instances
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 rounded-xl border border-[#35151C] bg-[#1A0D10] p-1">
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setTimeRange(r);
                setHoveredIdx(null);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-[#FF263D] text-white shadow-[0_0_12px_rgba(255,38,61,0.35)]"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full h-[220px]">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF263D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF263D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + plotHeight * pct;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={paddingX + plotWidth}
                y2={y}
                stroke="#35151C"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <polygon fill="url(#crimsonGradient)" points={areaString} />

          {/* Line stroke */}
          <polyline
            fill="none"
            stroke="#FF263D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lineString}
          />

          {/* Data Points & Interaction Hover Targets */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                className="transition-all duration-150"
                fill="#FF263D"
                stroke="#100607"
                strokeWidth="2"
              />
              <rect
                x={p.x - 20}
                y={0}
                width={40}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[#35151C] bg-[#100607]/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 10}%`,
            }}
          >
            <div className="font-mono text-[10px] text-[#A1A1AA] uppercase">
              {points[hoveredIdx].label}
            </div>
            <div className="font-bold text-[#FFFFFF] mt-0.5">
              {points[hoveredIdx].value.toLocaleString()} <span className="text-[10px] text-[#FF263D]">sessions</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom X-Axis Labels */}
      <div className="flex justify-between items-center px-4 pt-2 text-[11px] font-mono text-[#A1A1AA]">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
