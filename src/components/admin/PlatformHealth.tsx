"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Cpu, HardDrive, ShieldCheck, Server, Cloud, RefreshCw } from "lucide-react";

interface HealthService {
  name: string;
  subtext: string;
  status: "ONLINE" | "OPERATIONAL" | "DEGRADED" | "NOT_CONFIGURED";
  latency: string;
  category: "internal" | "external";
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Database Subsystem": HardDrive,
  "Auth Engine": ShieldCheck,
  "API Runtime": Server,
  "Asset Pipeline": Cpu,
  "Cloud Sync Engine": Cloud,
};

export function PlatformHealth() {
  const [services, setServices] = useState<HealthService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Health check fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchHealth();
    });
  }, [fetchHealth]);

  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#35151C]/60">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Platform Infrastructure Health
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
          {lastChecked && <span>Checked: {lastChecked}</span>}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              void fetchHealth();
            }}
            disabled={isLoading}
            className="flex items-center gap-1 text-[#FF263D] hover:underline cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Check</span>
          </button>
        </div>
      </div>

      {services.length === 0 && !isLoading ? (
        <div className="py-6 text-center text-xs font-mono text-[#A1A1AA]">
          Unable to measure service health.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((srv) => {
            const Icon = ICON_MAP[srv.name] || Server;
            const isNotConfigured = srv.status === "NOT_CONFIGURED";
            const isDegraded = srv.status === "DEGRADED";

            return (
              <div
                key={srv.name}
                className="flex items-center justify-between p-3 rounded-xl border border-[#35151C] bg-[#1A0D10] hover:border-[#FF263D]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#35151C] bg-[#130A0C] text-[#FF263D]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {srv.name}
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] truncate max-w-[160px] sm:max-w-[200px]">
                      {srv.subtext}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                      isNotConfigured
                        ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                        : isDegraded
                        ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {srv.status === "NOT_CONFIGURED" ? "NOT CONFIGURED" : srv.status}
                  </span>
                  <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                    {srv.latency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
