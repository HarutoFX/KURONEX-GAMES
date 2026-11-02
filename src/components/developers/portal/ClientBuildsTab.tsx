"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { ClientBuildDto } from "@/services/types";

interface ClientBuildsTabProps {
  builds: ClientBuildDto[];
  onNewBuild: (build: Partial<ClientBuildDto>) => Promise<void>;
}

export function ClientBuildsTab({ builds, onNewBuild }: ClientBuildsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<{
    gameTitle: string;
    versionTag: string;
    channel: "Alpha" | "Beta" | "Release";
    targetOs: "Windows (DirectX 12)" | "Linux (Vulkan)" | "macOS (Metal)";
    executableName: string;
    buildSizeBytes: number;
    sha256Hash: string;
    releaseNotes: string;
  }>({
    gameTitle: "Frostbound: Omega",
    versionTag: "v1.1.0-beta",
    channel: "Beta",
    targetOs: "Windows (DirectX 12)",
    executableName: "frostbound_client_dx12.exe",
    buildSizeBytes: 32212254720, // 30 GB
    sha256Hash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    releaseNotes: "Optimized streaming distance and fixed frame hitching on Vulkan fallback pipeline.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onNewBuild(form);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Desktop Binary Manifests & Release Channels</h2>
          <p className="text-xs text-[#929292] mt-0.5">
            Configure executable packages deployed through the Kuronex Native Desktop Client updater.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00E5FF] px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Client Build</span>
        </button>
      </div>

      {/* Builds Table / Cards */}
      <div className="space-y-4">
        {builds.map((build) => (
          <div
            key={build.id}
            className="rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 hover:border-white/20 transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                <h3 className="font-bold text-white text-base">{build.gameTitle}</h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FF263D]/10 text-[#FF4054] border border-[#FF263D]/30">
                  {build.versionTag}
                </span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  {build.channel}
                </span>
              </div>
              <span className="text-xs text-[#929292] font-mono">
                Released {new Date(build.releasedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="rounded-xl border border-white/5 bg-[#07080A] p-3">
                <span className="text-[#929292] block text-[10px] uppercase">Target Environment</span>
                <span className="text-white font-bold mt-0.5 block">{build.targetOs}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#07080A] p-3">
                <span className="text-[#929292] block text-[10px] uppercase">Client Executable</span>
                <span className="text-[#00E5FF] font-bold mt-0.5 block truncate">{build.executableName}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#07080A] p-3">
                <span className="text-[#929292] block text-[10px] uppercase">Package Payload Size</span>
                <span className="text-white font-bold mt-0.5 block">
                  {(build.buildSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#07080A] p-3 text-xs">
              <span className="font-mono text-[10px] uppercase text-[#929292] block mb-1">
                Release Notes & Delta Changelog
              </span>
              <p className="text-[#D1D5DB] leading-relaxed italic">
                &ldquo;{build.releaseNotes}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#7A7A7A]">
              <span className="truncate max-w-md">SHA-256: {build.sha256Hash}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Client Verified
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Build Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-3xl border border-[#00E5FF]/40 bg-[#0E0F12] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,229,255,0.2)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold text-[#00E5FF]">
                  DESKTOP CLIENT MANIFEST
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">Register Desktop Build</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#929292] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Game Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.gameTitle}
                    onChange={(e) => setForm({ ...form, gameTitle: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Version Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={form.versionTag}
                    onChange={(e) => setForm({ ...form, versionTag: e.target.value })}
                    placeholder="v1.0.0"
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Release Channel
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value as "Alpha" | "Beta" | "Release" })}
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  >
                    <option value="Alpha">Alpha</option>
                    <option value="Beta">Beta</option>
                    <option value="Release">Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Target Environment
                  </label>
                  <select
                    value={form.targetOs}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        targetOs: e.target.value as
                          | "Windows (DirectX 12)"
                          | "Linux (Vulkan)"
                          | "macOS (Metal)",
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none"
                  >
                    <option value="Windows (DirectX 12)">Windows (DirectX 12)</option>
                    <option value="Linux (Vulkan)">Linux (Vulkan)</option>
                    <option value="macOS (Metal)">macOS (Metal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Client Executable Binary Name
                </label>
                <input
                  type="text"
                  required
                  value={form.executableName}
                  onChange={(e) => setForm({ ...form, executableName: e.target.value })}
                  placeholder="game_client_x64.exe"
                  className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2 text-xs text-white focus:border-[#00E5FF] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Changelog & Release Notes
                </label>
                <textarea
                  rows={3}
                  value={form.releaseNotes}
                  onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#07080A] p-3 text-xs text-white focus:border-[#00E5FF] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-[#929292] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#00E5FF] px-5 py-2 text-xs font-bold text-black shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Deploying..." : "Publish Client Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
