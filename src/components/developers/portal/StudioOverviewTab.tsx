"use client";

import React from "react";
import {
  Gamepad2,
  HardDriveDownload,
  Users,
  ShieldCheck,
  Cpu,
  Plus,
} from "lucide-react";
import { DeveloperSubmissionDto, ClientBuildDto } from "@/services/types";

interface StudioOverviewTabProps {
  submissions: DeveloperSubmissionDto[];
  builds: ClientBuildDto[];
  vaultAdds?: number;
  onNewSubmission: () => void;
  onNewBuild: () => void;
}

export function StudioOverviewTab({
  submissions,
  builds,
  vaultAdds = 0,
  onNewSubmission,
  onNewBuild,
}: StudioOverviewTabProps) {
  const publishedCount = submissions.filter((s) => s.status === "Published" || s.status === "Approved").length;
  const inReviewCount = submissions.filter((s) => s.status === "In Review").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-gradient-to-r from-[#0E0F12] via-[#0A0B0E] to-[#0E0F12] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Studio Partner • Tier 1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Studio Workspace & Client Registry
            </h2>
            <p className="text-sm text-[#929292] max-w-xl">
              Manage your titles destined for the Kuronex Native Desktop Client. Configure release channels, 
              upload binary manifests, and track platform telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewSubmission}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF263D] px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,38,61,0.3)] hover:brightness-110 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Game</span>
            </button>
            <button
              onClick={onNewBuild}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
            >
              <HardDriveDownload className="h-4 w-4" />
              <span>Release Build</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#292929] bg-[#0E0F12] p-5">
          <div className="flex items-center justify-between text-[#929292]">
            <span className="text-xs font-mono uppercase tracking-wider">Registered Games</span>
            <Gamepad2 className="h-4 w-4 text-[#FF4054]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{submissions.length}</span>
            <span className="text-xs text-emerald-400 font-medium">({publishedCount} Active)</span>
          </div>
          <p className="mt-2 text-[11px] text-[#929292]">
            {inReviewCount} pending platform validation
          </p>
        </div>

        <div className="rounded-2xl border border-[#292929] bg-[#0E0F12] p-5">
          <div className="flex items-center justify-between text-[#929292]">
            <span className="text-xs font-mono uppercase tracking-wider">Client Builds</span>
            <Cpu className="h-4 w-4 text-[#00E5FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{builds.length}</span>
            <span className="text-xs text-cyan-400 font-medium">Vulkan / DX12</span>
          </div>
          <p className="mt-2 text-[11px] text-[#929292]">
            Signed desktop client packages
          </p>
        </div>

        <div className="rounded-2xl border border-[#292929] bg-[#0E0F12] p-5">
          <div className="flex items-center justify-between text-[#929292]">
            <span className="text-xs font-mono uppercase tracking-wider">Player Vault Adds</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{vaultAdds.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-medium">Synced with DB</span>
          </div>
          <p className="mt-2 text-[11px] text-[#929292]">
            Vault reservations across catalog titles
          </p>
        </div>

        <div className="rounded-2xl border border-[#292929] bg-[#0E0F12] p-5">
          <div className="flex items-center justify-between text-[#929292]">
            <span className="text-xs font-mono uppercase tracking-wider">Revenue Split</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs text-[#929292]">to Studio</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-400/90 font-medium">
            0% platform cut on first $500k GMV
          </p>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Submissions */}
        <div className="rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Client Storefront Submissions</h3>
            <span className="text-xs font-mono text-[#929292]">{submissions.length} Titles</span>
          </div>

          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sub.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-[#929292]">
                      {sub.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#929292] mt-0.5">{sub.targetEngine} • {sub.targetOs.join(", ")}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      sub.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : sub.status === "Approved"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {sub.status.toUpperCase()}
                  </span>
                  <div className="text-[10px] text-[#929292] mt-1 font-mono">{sub.readinessPercent}% Ready</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Builds */}
        <div className="rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Desktop Binary Releases</h3>
            <span className="text-xs font-mono text-[#929292]">{builds.length} Active Channels</span>
          </div>

          <div className="space-y-3">
            {builds.map((build) => (
              <div
                key={build.id}
                className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{build.gameTitle}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF263D]/10 text-[#FF4054] border border-[#FF263D]/30">
                      {build.versionTag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#929292]">{build.channel}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#929292] font-mono">
                  <span>{build.executableName}</span>
                  <span>{(build.buildSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                </div>
                <p className="text-xs text-[#7A7A7A] italic leading-tight">
                  &ldquo;{build.releaseNotes}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
