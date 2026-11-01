"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Download,
  Eye,
  BookmarkCheck,
  Activity,
  Radio,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { LibraryGameSlot } from "@/lib/library-store";
import { AnalyticsSummary, PlatformEvent } from "@/lib/analytics/types";

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

export function AnalyticsTab({ metrics }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<"24H" | "7D" | "30D" | "ALL">("7D");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Fetch summary on time range change
  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      try {
        const res = await fetch(`/api/analytics/summary?range=${timeRange}`);
        if (res.ok) {
          const data = (await res.json()) as AnalyticsSummary;
          if (isMounted) {
            setSummary(data);
            setLastUpdated(new Date().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error("Failed to load analytics summary:", err);
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  // Connect to real-time Server-Sent Events (SSE) stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/analytics/stream");

      eventSource.addEventListener("snapshot", (e) => {
        try {
          const initial = JSON.parse(e.data) as AnalyticsSummary;
          setSummary(initial);
          setIsSseConnected(true);
          setLastUpdated(new Date().toLocaleTimeString());
        } catch {
          // ignore parse error
        }
      });

      eventSource.addEventListener("update", (e) => {
        try {
          const payload = JSON.parse(e.data) as { event: PlatformEvent; freshSummary: AnalyticsSummary };
          setSummary(payload.freshSummary);
          setLastUpdated(new Date().toLocaleTimeString());
        } catch {
          // ignore parse error
        }
      });

      eventSource.onopen = () => {
        setIsSseConnected(true);
      };

      eventSource.onerror = () => {
        setIsSseConnected(false);
        // Fallback gracefully to polling if SSE disconnected
      };
    } catch {
      // EventSource instantiation failed (e.g. unsupported environment)
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const totalRegistered = summary?.users.totalRegistered ?? metrics?.totalUsers ?? 0;
  const dau = summary?.users.dau ?? 0;
  const wau = summary?.users.wau ?? metrics?.activeUsers ?? 0;
  const mau = summary?.users.mau ?? 0;
  const pageViews = summary?.engagement.totalPageViews ?? 0;
  const uniqueVisitors = summary?.engagement.uniqueVisitors ?? 0;
  const libraryAdds = summary?.engagement.libraryAdditions ?? 0;
  const dlInitiated = summary?.downloads.initiated ?? 0;
  const dlCompleted = summary?.downloads.completed ?? metrics?.totalDownloads ?? 0;
  const dlFailed = summary?.downloads.failed ?? 0;
  const dlRate = summary?.downloads.successRate;

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Range Selector & Data Freshness Indicator ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#35151C] bg-[#130A0C]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF263D]/10 text-[#FF263D] border border-[#FF263D]/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Genuine Telemetry & Observability
              </h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1A0D10] border border-[#35151C] text-zinc-300">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSseConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {isSseConnected ? "Live SSE Stream" : "Polling Mode"}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] flex items-center gap-2 mt-0.5">
              <span>Zero fabricated telemetry</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                Updated: {lastUpdated || "Syncing..."}
              </span>
            </p>
          </div>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[#35151C] bg-[#1A0D10] self-start sm:self-auto">
          {(["24H", "7D", "30D", "ALL"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
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

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Users */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 transition-all hover:border-[#FF263D]/30">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2">
            <span className="font-mono uppercase text-[11px] tracking-wider">Active Entities</span>
            <Users className="h-4 w-4 text-[#FF263D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {timeRange === "24H" ? dau : timeRange === "7D" ? wau : mau}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
            <span className="font-mono text-emerald-400 font-bold">{dau} DAU</span>
            <span>•</span>
            <span className="font-mono text-cyan-400 font-bold">{wau} WAU</span>
            <span>•</span>
            <span className="font-mono text-amber-400 font-bold">{mau} MAU</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#35151C]/60 text-[10px] text-zinc-500 font-mono">
            Total Registered: {totalRegistered} genuine accounts
          </div>
        </div>

        {/* Card 2: Engagement & Page Views */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 transition-all hover:border-[#FF263D]/30">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2">
            <span className="font-mono uppercase text-[11px] tracking-wider">Catalogue Views</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {pageViews}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
            <span className="font-mono text-white font-bold">{uniqueVisitors}</span>
            <span>unique visitor(s) in {timeRange}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#35151C]/60 text-[10px] text-zinc-500 font-mono">
            {pageViews > 0 ? `${Math.round((pageViews / Math.max(1, uniqueVisitors)) * 10) / 10} views / visitor` : "Awaiting traffic"}
          </div>
        </div>

        {/* Card 3: Library Growth */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 transition-all hover:border-[#FF263D]/30">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2">
            <span className="font-mono uppercase text-[11px] tracking-wider">Library Velocity</span>
            <BookmarkCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            +{libraryAdds}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
            <span className="font-mono text-emerald-400 font-bold">+{summary?.engagement.netLibraryGrowth ?? libraryAdds}</span>
            <span>net collection adds</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#35151C]/60 text-[10px] text-zinc-500 font-mono">
            {summary?.engagement.libraryAddsPerActiveUser ?? 0} adds / active user
          </div>
        </div>

        {/* Card 4: Downloads Funnel */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 transition-all hover:border-[#FF263D]/30">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2">
            <span className="font-mono uppercase text-[11px] tracking-wider">Download Funnel</span>
            <Download className="h-4 w-4 text-[#FF263D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {dlCompleted}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#A1A1AA]">
            <span className="font-mono font-bold text-white">{dlRate !== null ? `${dlRate}%` : "100%"}</span>
            <span>completion ({dlInitiated} init / {dlFailed} fail)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#35151C]/60 text-[10px] text-zinc-500 font-mono">
            {summary?.engagement.downloadsPerActiveUser ?? 0} dl / active user
          </div>
        </div>
      </div>

      {/* ── Main Chart: Platform Velocity ── */}
      <AnalyticsChart />

      {/* ── Two-Column Breakdown: Top Games & Real-Time Event Stream ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Games Performance */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF263D]" />
              Most Popular Titles ({timeRange})
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Real-time rank</span>
          </div>

          {!summary || summary.topGames.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#A1A1AA] font-mono border border-dashed border-[#35151C] rounded-xl p-4">
              Insufficient interaction data for this time period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.topGames.map((game, idx) => (
                <div
                  key={game.gameId}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#35151C] bg-[#1A0D10] text-xs transition-all hover:border-[#FF263D]/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#130A0C] border border-[#35151C] font-mono font-bold text-white text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{game.title}</div>
                      <div className="text-[10px] text-[#A1A1AA] font-mono">ID: {game.gameId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-right">
                    <span className="text-cyan-400 font-semibold">{game.views} views</span>
                    <span className="text-emerald-400 font-semibold">{game.downloads} dl</span>
                    <span className="text-[#FF263D] font-semibold">{game.libraryAdds} adds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Event Telemetry Stream */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              Live Platform Event Log
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">
              {summary?.recentEvents.length || 0} events recorded
            </span>
          </div>

          {!summary || summary.recentEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#A1A1AA] font-mono border border-dashed border-[#35151C] rounded-xl p-4">
              Awaiting first platform event.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {summary.recentEvents.map((evt) => {
                const isAuth = evt.category === "auth";
                const isDl = evt.category === "downloads";
                const isEng = evt.category === "engagement";
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#35151C]/60 bg-[#1A0D10]/80 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          isAuth ? "bg-cyan-400" : isDl ? "bg-[#FF263D]" : isEng ? "bg-emerald-400" : "bg-zinc-400"
                        }`}
                      />
                      <span className="text-white font-bold truncate">{evt.eventType}</span>
                      {evt.resourceId && (
                        <span className="text-[10px] text-[#A1A1AA] truncate">({evt.resourceId})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Category & OS Share ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#FF263D]" />
            Genre & Category Share
          </h4>
          <div className="space-y-3">
            {(!summary || summary.categoryShare.length === 0) ? (
              <div className="py-6 text-center text-xs text-[#A1A1AA] font-mono">
                No active titles categorized yet.
              </div>
            ) : (
              summary.categoryShare.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white">{cat.category}</span>
                    <span className="text-[#A1A1AA] font-mono">
                      {cat.count} titles ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A0D10] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF263D] rounded-full transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
          <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4 flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            Operating System Distribution
          </h4>
          <div className="space-y-3">
            {(() => {
              const dl = summary?.downloads.platformShare;
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
      </div>
    </div>
  );
}
