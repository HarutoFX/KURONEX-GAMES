"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Send,
  Check,
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
import { DeveloperMarquee } from "@/components/developers/DeveloperMarquee";
import { DeveloperPartner } from "@/lib/library-store";

const navItems = [
  { name: "Discover", link: "/discover" },
  { name: "Library", link: "/library" },
  { name: "Developers", link: "/developers", active: true },
  { name: "Download", link: "/download" },
];

const TIERS = ["All", "Premier Partner", "Studio Partner", "Indie Pioneer"] as const;

export default function DevelopersPage() {
  const { user, logout } = useAuth();
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pitchForm, setPitchForm] = useState({ studioName: "", email: "", projectTitle: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadDevs() {
      try {
        const res = await fetch("/api/developers");
        if (res.ok) {
          const data = await res.json();
          setDevelopers(data.developers || []);
        }
      } catch (err) {
        console.error("Failed to load developers:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDevs();
  }, []);

  const filteredDevs = useMemo(() => {
    if (selectedTier === "All") return developers;
    return developers.filter((d) => d.partnerTier === selectedTier);
  }, [developers, selectedTier]);

  const handlePitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pitchForm.studioName && pitchForm.email) {
      setIsSubmitted(true);
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
                    <linearGradient id="navDevKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4054" />
                      <stop offset="100%" stopColor="#FF263D" />
                    </linearGradient>
                    <linearGradient id="navDevKCore" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FF4054" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4H8V20H4V4Z" fill="url(#navDevKGrad)" />
                  <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navDevKGrad)" />
                  <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navDevKCore)" opacity="0.9" />
                  <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navDevKCore)" opacity="0.9" />
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

          <NavItems items={navItems} activeItem="Developers" />

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin?tab=developers"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-3.5 py-1.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Manage Devs</span>
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
                  item.name === "Developers"
                    ? "text-[#FF4054] font-bold"
                    : "text-[#8F9298] hover:text-[#F5F5F5]"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin?tab=developers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-[#FF4054] flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Manager</span>
              </Link>
            )}
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

      {/* ─── 2. DEVELOPERS HERO ───────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 flex-1">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            STUDIO NETWORK & CREATOR ECOSYSTEM
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F5F5] leading-tight">
            <AuroraText>Our Partner Studios.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#8F9298] leading-relaxed max-w-2xl mx-auto">
            Meet the innovative game companies, independent teams, and craft studios shaping
            the future of gaming with Kuronex.
          </p>
        </div>

        {/* ─── 3. CONTINUOUS MOVING SPONSOR/PARTNER STRIP ───────────────────── */}
        <div className="mt-14">
          <div className="text-center mb-3">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#8F9298] uppercase">
              • ACTIVE PARTNER STUDIOS •
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 backdrop-blur-md p-4 shadow-[0_0_40px_rgba(255,38,61,0.06)]">
            <DeveloperMarquee developers={developers} />
          </div>
        </div>

        {/* ─── 4. WHY STUDIOS CHOOSE KURONEX ────────────────────────────────── */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl">
            <span className="font-mono text-3xl font-extrabold text-[#FF4054]">88 / 12</span>
            <h3 className="mt-3 text-lg font-bold text-white">Fair Revenue Distribution</h3>
            <p className="mt-2 text-xs text-[#8F9298] leading-relaxed">
              Studios keep 88% of net proceeds with zero hidden platform access fees, empowering sustainable game development.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl">
            <span className="font-mono text-3xl font-extrabold text-[#00E5FF]">&lt;100ms</span>
            <h3 className="mt-3 text-lg font-bold text-white">Delta Patching Depot</h3>
            <p className="mt-2 text-xs text-[#8F9298] leading-relaxed">
              Push game updates in seconds. Only modified binary blocks are downloaded, preventing massive 20GB re-downloads.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl">
            <span className="font-mono text-3xl font-extrabold text-[#A855F7]">100%</span>
            <h3 className="mt-3 text-lg font-bold text-white">Direct Player Channels</h3>
            <p className="mt-2 text-xs text-[#8F9298] leading-relaxed">
              No predatory store algorithms forcing paid boosts. Organic discoverability and unhindered patch-note broadcasts.
            </p>
          </div>
        </div>

        {/* ─── 5. FULL STUDIOS DIRECTORY ────────────────────────────────────── */}
        <section className="mt-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="font-mono text-xs font-bold text-[#FF4054] tracking-widest uppercase">
                STUDIO DIRECTORY
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                All Collaborating Developers
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    selectedTier === tier
                      ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.35)]"
                      : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-white"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          {isLoading ? (
            <div className="my-16 text-center text-xs font-mono text-[#8F9298]">
              LOADING PARTNER NETWORK...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevs.map((dev) => (
                <div
                  key={dev.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#07080A]/90 p-7 backdrop-blur-2xl transition duration-300 hover:border-[#FF263D]/40 hover:shadow-[0_0_35px_rgba(255,38,61,0.12)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono text-[#FF4054]">
                        {dev.partnerTier}
                      </span>
                      <span className="text-[11px] font-mono text-[#8F9298]">
                        {dev.headquarters}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-white group-hover:text-[#FF4054] transition-colors">
                      {dev.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#8F9298] mt-1">{dev.tagline}</p>

                    <p className="mt-3 text-xs leading-relaxed text-[#8F9298]">
                      {dev.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-4 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8F9298]">
                      Focus: <strong className="text-white">{dev.genre}</strong>
                    </span>
                    <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-2.5 py-0.5 text-xs font-bold text-[#FF4054]">
                      {dev.gamesCount} Titles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── 6. STUDIO PITCH & SDK INQUIRY FORM ───────────────────────────── */}
        <section className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-[#07080A] via-[#090D12] to-[#040608] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              PUBLISH ON KURONEX
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
              Partner Your Studio With Us
            </h2>
            <p className="text-xs sm:text-sm text-[#8F9298] leading-relaxed">
              Are you developing a title? Request access to the Kuronex Game SDK, private developer testing, and store onboarding.
            </p>

            {isSubmitted ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-xs font-bold text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Pitch received! Our developer relations team will reach out.</span>
              </div>
            ) : (
              <form onSubmit={handlePitchSubmit} className="mt-6 space-y-3.5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <input
                    type="text"
                    required
                    value={pitchForm.studioName}
                    onChange={(e) => setPitchForm({ ...pitchForm, studioName: e.target.value })}
                    placeholder="Studio or Company Name"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-3 text-xs text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                  />
                  <input
                    type="email"
                    required
                    value={pitchForm.email}
                    onChange={(e) => setPitchForm({ ...pitchForm, email: e.target.value })}
                    placeholder="Developer Email"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-3 text-xs text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                  />
                </div>
                <input
                  type="text"
                  value={pitchForm.projectTitle}
                  onChange={(e) => setPitchForm({ ...pitchForm, projectTitle: e.target.value })}
                  placeholder="Upcoming Game Title (Optional)"
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-3 text-xs text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                />
                <textarea
                  rows={3}
                  value={pitchForm.message}
                  onChange={(e) => setPitchForm({ ...pitchForm, message: e.target.value })}
                  placeholder="Tell us briefly about your engine, genre, and timeline..."
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-3 text-xs text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60 resize-none"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF4054] to-[#FF263D] py-3.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,38,61,0.35)] hover:shadow-[0_15px_40px_rgba(255,38,61,0.55)] transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Studio Application</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ─── 7. FOOTER ────────────────────────────────────────────────────── */}
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
            <Link href="/download" className="hover:text-[#FF4054] transition">Download Client</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
