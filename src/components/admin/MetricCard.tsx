"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  caption?: string;
  sparklineData?: number[];
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "positive",
  caption,
  sparklineData,
}: MetricCardProps) {
  // SVG Sparkline calculation (only when authentic time-series points exist)
  const hasSparkline = Array.isArray(sparklineData) && sparklineData.length >= 2;
  const max = hasSparkline ? Math.max(...sparklineData, 1) : 1;
  const min = hasSparkline ? Math.min(...sparklineData, 0) : 0;
  const points = hasSparkline
    ? sparklineData
        .map((val, idx) => {
          const x = (idx / (sparklineData.length - 1)) * 100;
          const y = 30 - ((val - min) / (max - min || 1)) * 24;
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 sm:p-5 transition-all duration-200 hover:border-[#FF263D]/40 hover:shadow-[0_4px_24px_rgba(255,38,61,0.08)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#35151C] bg-[#1A0D10] text-[#FF263D]">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Main Metric Value & Trend Sparkline */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FFFFFF]">
            {value}
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  changeType === "positive"
                    ? "text-emerald-400"
                    : changeType === "negative"
                    ? "text-[#FF263D]"
                    : "text-[#A1A1AA]"
                }`}
              >
                {changeType === "positive" && <ArrowUpRight className="h-3.5 w-3.5" />}
                {changeType === "negative" && <ArrowDownRight className="h-3.5 w-3.5" />}
                {changeType === "neutral" && <Minus className="h-3.5 w-3.5" />}
                {change}
              </span>
              <span className="text-[11px] text-[#A1A1AA]/80 truncate">
                {caption}
              </span>
            </div>
          )}
        </div>

        {/* Micro Sparkline (only if authentic data exists) */}
        {hasSparkline && (
          <div className="w-20 sm:w-24 h-8 shrink-0">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32">
              <polyline
                fill="none"
                stroke="#FF263D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
