"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  HeartHandshake,
  ArrowRight,
  Check,
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
import { DeveloperMarquee } from "@/components/developers/DeveloperMarquee";
import { DeveloperPartner } from "@/lib/library-store";

const navItems = [
  { name: "Discover", link: "/discover", active: true },
  { name: "Library", link: "/library" },
  { name: "Developers", link: "/developers" },
  { name: "Download", link: "/download" },
];

export function DiscoverPage({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, logout } = useAuth();

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
      }
    }
    loadDevs();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-[#F5F5F5] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      {!hideNavbar && (
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
                      <linearGradient id="navDiscKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4054" />
                        <stop offset="100%" stopColor="#FF263D" />
                      </linearGradient>
                      <linearGradient id="navDiscKCore" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#FF4054" />
                      </linearGradient>
                    </defs>
                    <path d="M4 4H8V20H4V4Z" fill="url(#navDiscKGrad)" />
                    <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navDiscKGrad)" />
                    <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navDiscKCore)" opacity="0.9" />
                    <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navDiscKCore)" opacity="0.9" />
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

            <NavItems items={navItems} activeItem="Discover" />

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
                    item.name === "Discover"
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
      )}

      {/* ─── 2. ABOUT US & MISSION HERO ─────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 flex-1">
        {/* Mission Eyebrow & Headline */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            INTRO & VISION // KURONEX GAMES
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F5F5] leading-tight">
            <AuroraText>Our Mission & Goal.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#8F9298] leading-relaxed max-w-2xl mx-auto">
            We are building Kuronex to free players and game creators from bloated, memory-hogging launchers.
            A sleek, high-performance ecosystem designed around genuine digital ownership.
          </p>
        </div>

        {/* ─── 3. CORE PILLARS GRID ─────────────────────────────────────────── */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#FF263D]/40 hover:shadow-[0_0_35px_rgba(255,38,61,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054]">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Ultra-Light Client</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8F9298] leading-relaxed">
              Engineered with native compiled performance. Idles at under 40MB RAM and launches in under 300ms, unlike sluggish Chromium-wrapped competitors.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#00E5FF]/40 hover:shadow-[0_0_35px_rgba(0,229,255,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Pro-Developer 88/12</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8F9298] leading-relaxed">
              We partner directly with visionary indie and AA game studios with industry-leading revenue splits, instant micro-patching, and zero algorithmic paywalls.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07080A]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#A855F7]/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Player-First Library</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#8F9298] leading-relaxed">
              Build your own collection. DRM-free freedom, timestamped cloud saves with rollback safeguards, and smooth cross-platform library management.
            </p>
          </div>
        </div>

        {/* ─── 4. PARTNER STUDIOS SECTION ───────────────────────────────────── */}
        <section className="mt-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="font-mono text-xs font-bold text-[#FF4054] tracking-widest uppercase">
                COLLABORATING STUDIOS
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                The Studios We Work With
              </h2>
            </div>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4054] hover:underline"
            >
              <span>Explore All Developer Studios</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Infinite Marquee Ticker */}
          <div className="rounded-3xl border border-white/10 bg-[#07080A]/80 backdrop-blur-md p-4">
            <DeveloperMarquee developers={developers} />
          </div>

          {/* Studios Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {developers.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#07080A]/85 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#FF263D]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#FF4054]">
                      {dev.partnerTier}
                    </span>
                    <span className="text-[10px] font-mono text-[#8F9298]">
                      {dev.headquarters}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-[#FF4054] transition-colors">
                    {dev.name}
                  </h3>
                  <p className="text-xs text-[#8F9298] mt-0.5">{dev.tagline}</p>

                  <p className="mt-3 text-xs leading-relaxed text-[#8F9298] line-clamp-3">
                    {dev.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono text-[#8F9298]">
                  <span>{dev.genre}</span>
                  <span className="text-[#FF263D]">{dev.gamesCount} Titles</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. WAITLIST / EARLY ACCESS ───────────────────────────────────── */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-[#07080A] via-[#090D12] to-[#040608] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              UPCOMING CLIENT ACCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
              Be Among The First In The Kuronex Client
            </h2>
            <p className="text-xs sm:text-sm text-[#8F9298] leading-relaxed">
              We are currently in private developer testing. Sign up to get notified the second the desktop client download is available.
            </p>

            <div className="pt-4 flex justify-center">
              {isSubscribed ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-xs font-bold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>You&apos;re queued! We will email you upon client launch.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email for launch notification..."
                    className="w-full rounded-full border border-white/10 bg-[rgba(15,20,28,0.7)] px-5 py-3 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,38,61,0.35)] hover:shadow-[0_15px_40px_rgba(255,38,61,0.55)] transition cursor-pointer"
                  >
                    <span>Notify Me</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
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
            <Link href="/library" className="hover:text-[#FF4054] transition">Library</Link>
            <Link href="/developers" className="hover:text-[#FF4054] transition">Developers</Link>
            <Link href="/download" className="hover:text-[#FF4054] transition">Download Client</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
