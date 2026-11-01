"use client";

import React from "react";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { LibraryGameSlot } from "@/lib/library-store";

const CATEGORIES = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

interface AnalyticsTabProps {
  games: LibraryGameSlot[];
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    totalDownloads: number;
    platformDownloads?: { windows: number; macos: number; linux: number; other: number; total: number };
    gameLibraryStats?: Record<string, number>;
  } | null;
}

export function AnalyticsTab({ games, metrics }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <AnalyticsChart />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
            Category Distribution
          </h4>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const count = games.filter((g) => g.category === cat && !g.isEmpty).length;
              const total = games.filter((g) => !g.isEmpty).length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">{cat}</span>
                    <span className="text-[#A1A1AA] font-mono">
                      {count} titles ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A0D10] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF263D] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
            Operating System Share
          </h4>
          <div className="space-y-3">
            {(() => {
              const dl = metrics?.platformDownloads;
              const totalDl = dl?.total || 0;
              if (!dl || totalDl === 0) {
                return (
                  <div className="py-6 text-center text-xs text-[#A1A1AA] font-mono">
                    No download activity recorded yet.
                  </div>
                );
              }
              const osList = [
                { os: "Windows (x64 / ARM64)", count: dl.windows, pct: Math.round((dl.windows / totalDl) * 100) },
                { os: "Linux (Proton / Native)", count: dl.linux, pct: Math.round((dl.linux / totalDl) * 100) },
                { os: "macOS (Apple Silicon)", count: dl.macos, pct: Math.round((dl.macos / totalDl) * 100) },
              ];
              return osList.map((item) => (
                <div key={item.os} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">{item.os}</span>
                    <span className="text-[#A1A1AA] font-mono">
                      {item.count} downloads ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A0D10] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
            Cloud Sync Health
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
              <span className="text-[#A1A1AA]">Sync Engine</span>
              <span className="font-mono font-bold text-zinc-400">Not Configured</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
              <span className="text-[#A1A1AA]">Cloud Replication</span>
              <span className="font-mono font-bold text-[#A1A1AA]">Local saves only</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
              <span className="text-[#A1A1AA]">Remote Storage Provider</span>
              <span className="font-mono font-bold text-zinc-500">Unbound</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

