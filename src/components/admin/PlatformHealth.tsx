"use client";

import React from "react";
import { Cpu, HardDrive, ShieldCheck, Server, RefreshCw } from "lucide-react";

interface HealthItem {
  name: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "HEALTHY" | "OPTIMAL" | "NOMINAL";
  latency: string;
}

const HEALTH_SERVICES: HealthItem[] = [
  {
    name: "Database Subsystem",
    subtext: "Encrypted User & Session Store",
    icon: HardDrive,
    status: "HEALTHY",
    latency: "12 ms",
  },
  {
    name: "Auth Engine",
    subtext: "Scrypt Cryptography & Cookies",
    icon: ShieldCheck,
    status: "OPTIMAL",
    latency: "18 ms",
  },
  {
    name: "API Gateway",
    subtext: "Next.js App Router Microservices",
    icon: Server,
    status: "HEALTHY",
    latency: "24 ms",
  },
  {
    name: "Asset Pipeline",
    subtext: "Cartridge & Studio CDN Clusters",
    icon: Cpu,
    status: "NOMINAL",
    latency: "35 ms",
  },
];

export function PlatformHealth() {
  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#35151C]/60">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Platform Infrastructure Health
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin text-[#FF263D]" />
          Realtime
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HEALTH_SERVICES.map((srv) => {
          const Icon = srv.icon;
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
                  <div className="text-[10px] text-[#A1A1AA] truncate">
                    {srv.subtext}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                  {srv.status}
                </span>
                <div className="text-[10px] font-mono text-[#A1A1AA] mt-0.5">
                  {srv.latency}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
