"use client";

import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  Monitor,
  Apple,
  Terminal,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";

export default function DownloadPage() {
  const [selectedOS, setSelectedOS] = useState<"windows" | "macos" | "linux">("windows");
  const [emailInput, setEmailInput] = useState("");
  const [isNotified, setIsNotified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "client",
          itemId: "kuronex-launcher-preview",
          platform: selectedOS,
        }),
      });
      setIsNotified(true);
    } catch {
      setIsNotified(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-[#FFFFFF] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <SiteNavbar activeItem="Download" />

      {/* ─── 2. DOWNLOAD HERO ─────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex-1">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            STANDALONE DESKTOP CLIENT // COMING SOON
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFFFF] leading-tight">
            <AuroraText>Download Kuronex App.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#929292] leading-relaxed max-w-2xl mx-auto">
            The ultra-fast, zero-bloat client application built to launch and manage your game collection
            with lightning responsiveness and near-zero system overhead.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-1.5 text-xs font-bold text-[#FF4054] shadow-[0_0_20px_rgba(255,38,61,0.25)]">
              <span className="h-2 w-2 rounded-full bg-[#FF263D] animate-ping" />
              STATUS: PRIVATE DEVELOPER PREVIEW
            </span>
          </div>
        </div>

        {/* ─── 3. OPERATING SYSTEM CARDS ────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Windows Card */}
          <div
            onClick={() => setSelectedOS("windows")}
            className={`cursor-pointer rounded-2xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "windows"
                ? "border-[#FF263D] bg-[#111111]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-[#292929] bg-[#111111]/70 hover:border-[#383838]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#00E5FF]">
                <Monitor className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#929292]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">Windows</h3>
            <p className="mt-1 text-xs text-[#929292]">Windows 10 / 11 (64-bit & ARM)</p>
            <div className="mt-6 border-t border-[#292929] pt-4 text-xs font-mono text-[#929292] flex items-center justify-between">
              <span>Installer: .exe / .msi</span>
              <span className="text-[#00E5FF]">Native DirectX / Vulkan</span>
            </div>
          </div>

          {/* macOS Card */}
          <div
            onClick={() => setSelectedOS("macos")}
            className={`cursor-pointer rounded-2xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "macos"
                ? "border-[#FF263D] bg-[#111111]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-[#292929] bg-[#111111]/70 hover:border-[#383838]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                <Apple className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#929292]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">macOS</h3>
            <p className="mt-1 text-xs text-[#929292]">Apple Silicon M-Series & Intel</p>
            <div className="mt-6 border-t border-[#292929] pt-4 text-xs font-mono text-[#929292] flex items-center justify-between">
              <span>Package: Universal .dmg</span>
              <span className="text-white">Metal 3 Accelerated</span>
            </div>
          </div>

          {/* Linux Card */}
          <div
            onClick={() => setSelectedOS("linux")}
            className={`cursor-pointer rounded-2xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "linux"
                ? "border-[#FF263D] bg-[#111111]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-[#292929] bg-[#111111]/70 hover:border-[#383838]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#F59E0B]">
                <Terminal className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#929292]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">Linux</h3>
            <p className="mt-1 text-xs text-[#929292]">Flatpak / AppImage / .deb / .rpm</p>
            <div className="mt-6 border-t border-[#292929] pt-4 text-xs font-mono text-[#929292] flex items-center justify-between">
              <span>Wayland & X11</span>
              <span className="text-[#F59E0B]">Proton / Wine Ready</span>
            </div>
          </div>
        </div>

        {/* ─── 4. NOTIFY / EARLY ACCESS SIGNUP MODULE ───────────────────────── */}
        <div className="mt-14 rounded-2xl border border-[#292929] bg-gradient-to-br from-[#111111] via-[#141414] to-[#080808] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              RESERVE YOUR CLIENT BETA KEY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
              Get Direct Download Link When Available
            </h2>
            <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
              Selected platform: <strong className="text-white capitalize">{selectedOS}</strong>.
              Enter your email to receive early access alpha binaries and release notifications.
            </p>

            <div className="pt-4 flex justify-center">
              {isNotified ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 text-xs font-bold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>You are on the VIP client launch list for {selectedOS}!</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email to get notified..."
                    className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto shrink-0"
                  >
                    <span>Get Notified</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ─── 5. ARCHITECTURAL COMPARISON ──────────────────────────────────── */}
        <section className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why We Are Building The Kuronex Client
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#929292]">
              Comparing the Kuronex Native Architecture against sluggish Legacy Launchers
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#292929] bg-[#111111]/85 backdrop-blur-md">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[#292929] font-mono text-[11px] text-[#929292] uppercase">
                <tr>
                  <th className="py-4 px-6">Metric / Capability</th>
                  <th className="py-4 px-6 text-[#FF4054] font-bold">Kuronex Client (Upcoming)</th>
                  <th className="py-4 px-6 text-[#929292]">Legacy Launchers (Epic / Steam CEF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929] font-medium">
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Idle RAM Consumption</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold font-mono">&lt; 40 MB</td>
                  <td className="py-4 px-6 text-[#929292] font-mono">800 MB - 1.5 GB</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Cold Startup Speed</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold font-mono">&lt; 300 ms</td>
                  <td className="py-4 px-6 text-[#929292] font-mono">5 - 15 seconds</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Underlying Architecture</td>
                  <td className="py-4 px-6 text-white font-mono">Native Rust + OS WebView</td>
                  <td className="py-4 px-6 text-[#929292] font-mono">Heavyweight Chromium / CEF</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Game Update Downloads</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold">Content-Addressable Delta Chunks</td>
                  <td className="py-4 px-6 text-[#929292]">Full File Overwrites</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Single-Player Offline Mode</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold">True 100% Offline Always</td>
                  <td className="py-4 px-6 text-[#929292]">Forced periodic online token auth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ─── 6. FOOTER ────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
