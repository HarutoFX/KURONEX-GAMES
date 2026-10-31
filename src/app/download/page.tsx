"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Monitor,
  Apple,
  Terminal,
  Shield,
} from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Discover", link: "/discover" },
  { name: "Library", link: "/library" },
  { name: "Developers", link: "/developers" },
  { name: "Download", link: "/download", active: true },
];

export default function DownloadPage() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<"windows" | "macos" | "linux">("windows");
  const [emailInput, setEmailInput] = useState("");
  const [isNotified, setIsNotified] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsNotified(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-[#F5F5F5] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <Navbar>
        <NavBody>
          <NavbarLogo href="/">
            <div className="group flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#07080A] shadow-[0_0_16px_rgba(255,38,61,0.10)] backdrop-blur-md transition-all duration-300 group-hover:border-[rgba(255,38,61,0.4)] group-hover:shadow-[0_0_24px_rgba(255,38,61,0.25)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="navDownKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4054" />
                      <stop offset="100%" stopColor="#FF263D" />
                    </linearGradient>
                    <linearGradient id="navDownKCore" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FF4054" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4H8V20H4V4Z" fill="url(#navDownKGrad)" />
                  <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navDownKGrad)" />
                  <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navDownKCore)" opacity="0.9" />
                  <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navDownKCore)" opacity="0.9" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF263D] shadow-[0_0_6px_#FF263D]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.2em] text-[#F5F5F5] antialiased">
                  KURONEX
                </span>
                <span className="rounded border border-[rgba(255,38,61,0.25)] bg-[rgba(255,38,61,0.10)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#FF263D] shadow-[0_0_12px_rgba(255,38,61,0.10)]">
                  GAMES
                </span>
              </div>
            </div>
          </NavbarLogo>

          <NavItems items={navItems} activeItem="Download" />

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-3.5 py-1.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 px-3 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-semibold text-[#F5F5F5]">{user.username}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8F9298] hover:text-[#FF4054] hover:border-[#FF263D]/30 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavbarButton href="/login" variant="secondary">Login</NavbarButton>
                <NavbarButton href="/register" variant="primary">Register</NavbarButton>
              </div>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo href="/">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#07080A]">
                  <span className="text-xs font-black text-[#FF263D]">K</span>
                </div>
                <span className="text-xs font-bold tracking-[0.18em] text-[#F5F5F5]">
                  KURONEX
                </span>
              </div>
            </NavbarLogo>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-nav-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`relative text-sm font-semibold tracking-wide transition ${
                  item.name === "Download"
                    ? "text-[#FF4054] font-bold"
                    : "text-[#8F9298] hover:text-[#F5F5F5]"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex w-full flex-col gap-2.5 pt-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-semibold text-[#F5F5F5]">Signed in as {user.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border border-[#FF263D]/30 bg-[#FF263D]/10 py-2.5 text-xs font-semibold text-[#FF4054] hover:bg-[#FF263D]/20 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3 pt-2">
                <NavbarButton href="/login" onClick={() => setIsMobileMenuOpen(false)} variant="secondary" className="w-full">
                  Login
                </NavbarButton>
                <NavbarButton href="/register" onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                  Register
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* ─── 2. DOWNLOAD HERO ─────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 flex-1">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            STANDALONE DESKTOP CLIENT // COMING SOON
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F5F5] leading-tight">
            <AuroraText>Download Kuronex App.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#8F9298] leading-relaxed max-w-2xl mx-auto">
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
            className={`cursor-pointer rounded-3xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "windows"
                ? "border-[#FF263D] bg-[#07080A]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-white/10 bg-[#07080A]/70 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#00E5FF]">
                <Monitor className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#8F9298]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">Windows</h3>
            <p className="mt-1 text-xs text-[#8F9298]">Windows 10 / 11 (64-bit & ARM)</p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs font-mono text-[#8F9298] flex items-center justify-between">
              <span>Installer: .exe / .msi</span>
              <span className="text-[#00E5FF]">Native DirectX / Vulkan</span>
            </div>
          </div>

          {/* macOS Card */}
          <div
            onClick={() => setSelectedOS("macos")}
            className={`cursor-pointer rounded-3xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "macos"
                ? "border-[#FF263D] bg-[#07080A]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-white/10 bg-[#07080A]/70 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                <Apple className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#8F9298]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">macOS</h3>
            <p className="mt-1 text-xs text-[#8F9298]">Apple Silicon M-Series & Intel</p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs font-mono text-[#8F9298] flex items-center justify-between">
              <span>Package: Universal .dmg</span>
              <span className="text-white">Metal 3 Accelerated</span>
            </div>
          </div>

          {/* Linux Card */}
          <div
            onClick={() => setSelectedOS("linux")}
            className={`cursor-pointer rounded-3xl border p-8 backdrop-blur-2xl transition duration-300 ${
              selectedOS === "linux"
                ? "border-[#FF263D] bg-[#07080A]/95 shadow-[0_0_40px_rgba(255,38,61,0.2)]"
                : "border-white/10 bg-[#07080A]/70 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#F59E0B]">
                <Terminal className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#8F9298]">
                COMING SOON
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">Linux</h3>
            <p className="mt-1 text-xs text-[#8F9298]">Flatpak / AppImage / .deb / .rpm</p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs font-mono text-[#8F9298] flex items-center justify-between">
              <span>Wayland & X11</span>
              <span className="text-[#F59E0B]">Proton / Wine Ready</span>
            </div>
          </div>
        </div>

        {/* ─── 4. NOTIFY / EARLY ACCESS SIGNUP MODULE ───────────────────────── */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-br from-[#07080A] via-[#090D12] to-[#040608] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              RESERVE YOUR CLIENT BETA KEY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
              Get Direct Download Link When Available
            </h2>
            <p className="text-xs sm:text-sm text-[#8F9298] leading-relaxed">
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
                    className="w-full rounded-full border border-white/10 bg-[rgba(15,20,28,0.7)] px-5 py-3 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,38,61,0.35)] hover:shadow-[0_15px_40px_rgba(255,38,61,0.55)] transition cursor-pointer"
                  >
                    <span>Get Notified</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
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
            <p className="mt-2 text-xs sm:text-sm text-[#8F9298]">
              Comparing the Kuronex Native Architecture against sluggish Legacy Launchers
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#07080A]/85 backdrop-blur-md">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-white/10 font-mono text-[11px] text-[#8F9298] uppercase">
                <tr>
                  <th className="py-4 px-6">Metric / Capability</th>
                  <th className="py-4 px-6 text-[#FF4054] font-bold">Kuronex Client (Upcoming)</th>
                  <th className="py-4 px-6 text-[#8F9298]">Legacy Launchers (Epic / Steam CEF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Idle RAM Consumption</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold font-mono">&lt; 40 MB</td>
                  <td className="py-4 px-6 text-[#8F9298] font-mono">800 MB - 1.5 GB</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Cold Startup Speed</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold font-mono">&lt; 300 ms</td>
                  <td className="py-4 px-6 text-[#8F9298] font-mono">5 - 15 seconds</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Underlying Architecture</td>
                  <td className="py-4 px-6 text-white font-mono">Native Rust + OS WebView</td>
                  <td className="py-4 px-6 text-[#8F9298] font-mono">Heavyweight Chromium / CEF</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Game Update Downloads</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold">Content-Addressable Delta Chunks</td>
                  <td className="py-4 px-6 text-[#8F9298]">Full File Overwrites</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white font-bold">Single-Player Offline Mode</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold">True 100% Offline Always</td>
                  <td className="py-4 px-6 text-[#8F9298]">Forced periodic online token auth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ─── 6. FOOTER ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020508]/80 py-8 text-center text-xs text-[#8F9298] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-[#F5F5F5]">KURONEX GAMES</span>
            <span>•</span>
            <span>© 2026 Kuronex Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/discover" className="hover:text-[#FF4054] transition">About Us</Link>
            <Link href="/library" className="hover:text-[#FF4054] transition">Library</Link>
            <Link href="/developers" className="hover:text-[#FF4054] transition">Developers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
