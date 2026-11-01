"use client";

import React, { useState } from "react";
import { BarChart3, Info } from "lucide-react";

export interface DataPoint {
  label: string;
  value: number;
  secondary?: number;
}

interface AnalyticsChartProps {
  dataPoints?: DataPoint[];
  title?: string;
  subtitle?: string;
}

export function AnalyticsChart({
  dataPoints,
  title = "Platform Traffic & Session Velocity",
  subtitle = "Player telemetry, active connections, and authenticated launches",
}: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasAuthenticData =
    Array.isArray(dataPoints) &&
    dataPoints.length >= 2 &&
    dataPoints.some((d) => d.value > 0);

  const data = hasAuthenticData ? dataPoints : [];
  const maxValue = hasAuthenticData ? Math.max(...data.map((d) => d.value), 10) : 10;

  // SVG Area path calculation
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const points = hasAuthenticData
    ? data.map((d, i) => {
        const x = paddingX + (i / (data.length - 1)) * plotWidth;
        const y = paddingY + plotHeight - (d.value / maxValue) * plotHeight;
        return { x, y, ...d };
      })
    : [];

  const lineString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaString = hasAuthenticData
    ? `${paddingX},${paddingY + plotHeight} ${lineString} ${paddingX + plotWidth},${paddingY + plotHeight}`
    : "";

  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6 transition-all duration-200">
      {/* Header with Title and Range Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#35151C]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#FF263D]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {subtitle}
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

      {!hasAuthenticData ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-[#35151C] bg-[#1A0D10]/50 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#35151C] bg-[#130A0C] text-[#A1A1AA] mb-3">
            <BarChart3 className="h-6 w-6 text-[#FF263D]" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">
            Not enough data to generate analytics
          </h4>
          <p className="text-xs text-[#A1A1AA] max-w-md leading-relaxed mb-4">
            Continuous telemetry and historical trends require multi-day production traffic. No simulated or mock data points are generated.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#35151C] bg-[#130A0C] px-3 py-1 text-[10px] font-mono text-[#A1A1AA]">
            <Info className="h-3 w-3 text-[#FF263D]" />
            <span>Telemetry logging: Active</span>
          </div>
        </div>
      ) : (
        /* Interactive SVG Chart */
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
                {points[hoveredIdx].value.toLocaleString()} <span className="text-[10px] text-[#FF263D]">events</span>
              </div>
            </div>
          )}

          {/* Bottom X-Axis Labels */}
          <div className="flex justify-between items-center px-4 pt-2 text-[11px] font-mono text-[#A1A1AA]">
            {data.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
