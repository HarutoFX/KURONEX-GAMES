"use client";

import React, { useState } from "react";
import { Activity, Shield, Gamepad2, User, Cpu } from "lucide-react";
import { AuditLog } from "@/lib/admin-store";

interface RecentActivityProps {
  logs: AuditLog[];
  onViewAllLogs?: () => void;
}

export function RecentActivity({ logs, onViewAllLogs }: RecentActivityProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.category === filter;
  });

  const getCategoryIcon = (cat: AuditLog["category"]) => {
    switch (cat) {
      case "GAMES":
        return <Gamepad2 className="h-3.5 w-3.5 text-[#FF263D]" />;
      case "USERS":
        return <User className="h-3.5 w-3.5 text-[#00E5FF]" />;
      case "AUTH":
        return <Shield className="h-3.5 w-3.5 text-[#A855F7]" />;
      case "SYSTEM":
      default:
        return <Cpu className="h-3.5 w-3.5 text-emerald-400" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#35151C]/60 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF263D]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Activity Feed
            </h3>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-1">
            {["ALL", "GAMES", "USERS", "SYSTEM"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  filter === c
                    ? "bg-[#FF263D] text-white"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-none pr-1">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#A1A1AA]">
              No logged events recorded in this category.
            </div>
          ) : (
            filteredLogs.slice(0, 7).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-[#35151C]/60 bg-[#1A0D10]/70 hover:border-[#FF263D]/40 transition-all"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#35151C] bg-[#130A0C]">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {item.action}
                    </span>
                    <span className="text-[10px] font-mono text-[#A1A1AA] shrink-0">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">
                    {item.details}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-[#A1A1AA]/70">
                    <span className="text-[#FF263D]">@{item.actor}</span>
                    <span>•</span>
                    <span className="truncate">{item.target}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {onViewAllLogs && (
        <button
          type="button"
          onClick={onViewAllLogs}
          className="w-full mt-4 rounded-xl border border-[#35151C] bg-[#1A0D10] py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white hover:border-[#FF263D]/40 transition-all cursor-pointer"
        >
          View Complete Audit Stream →
        </button>
      )}
    </div>
  );
}
