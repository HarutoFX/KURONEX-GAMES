"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
  { name: "Discover", link: "/discover", active: true },
  { name: "Library", link: "#library" },
  { name: "Developers", link: "#developers" },
];

export function DiscoverPage({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-[#F5F5F5] antialiased selection:bg-[#00E5FF]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      {!hideNavbar && (
        <Navbar>
          <NavBody>
            <NavbarLogo href="/">
              <div className="group flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#00E5FF]/30 bg-[#07080A] shadow-[0_0_16px_rgba(0,229,255,0.18)] backdrop-blur-md transition-all duration-300 group-hover:border-[#00E5FF]/60 group-hover:shadow-[0_0_24px_rgba(0,229,255,0.35)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="navDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#00B4D8" />
                      </linearGradient>
                      <linearGradient id="navDiscCore" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#00E5FF" />
                      </linearGradient>
                    </defs>
                    <path d="M4 4H8V20H4V4Z" fill="url(#navDiscGrad)" />
                    <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navDiscGrad)" />
                    <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navDiscCore)" opacity="0.9" />
                    <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navDiscCore)" opacity="0.9" />
                  </svg>
                  <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-[0.2em] text-[#F5F5F5] antialiased">
                    KURONEX
                  </span>
                  <span className="rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                    GAMES
                  </span>
                </div>
              </div>
            </NavbarLogo>

            <NavItems items={navItems} activeItem="Discover" />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 px-3 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-semibold text-[#F5F5F5]">{user.username}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8F9298] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NavbarButton href="/login" variant="secondary">Login</NavbarButton>
                <NavbarButton href="/register" variant="primary">Register</NavbarButton>
              </div>
            )}
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo href="/">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[#00E5FF]/30 bg-[#07080A]">
                    <span className="text-xs font-black text-[#00E5FF]">K</span>
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
                      ? "text-[#00E5FF] font-bold"
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
                    className="w-full rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 py-2.5 text-xs font-semibold text-[#00E5FF] hover:bg-[#00E5FF]/20 transition cursor-pointer"
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

      {/* ─── 2. COMING SOON HERO ─────────────────────────────────────────── */}
      <section className="relative z-10 w-full mx-auto flex min-h-[calc(100svh-120px)] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          {/* Status Eyebrow */}
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            DISCOVER PORTAL
          </div>

          {/* Title with Aurora Gradient */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-[-0.055em] text-[#F5F5F5] leading-tight text-center">
            <AuroraText>Coming Soon</AuroraText>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base md:text-lg font-medium text-[#8F9298] leading-relaxed text-center">
            We are currently preparing an exclusive roster of upcoming titles and next-gen gaming experiences. The games library will be revealed here soon.
          </p>

          {/* Notification Waitlist */}
          <div className="mt-10 w-full max-w-md mx-auto flex justify-center">
            {isSubscribed ? (
              <div className="inline-flex items-center gap-3 rounded-full border border-[#FF263D] bg-[#FF263D]/15 px-6 py-3.5 text-sm font-semibold text-[#FF4054] shadow-[0_0_30px_rgba(255,38,61,0.3)]">
                <Check className="h-5 w-5 text-[#FF263D]" />
                <span>You&apos;re on the list! We&apos;ll notify you at launch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email to get notified..."
                  className="w-full rounded-full border border-white/10 bg-[rgba(7,11,15,0.85)] px-5 py-3.5 text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none backdrop-blur-md transition focus:border-[#FF263D]/60 focus:shadow-[0_0_24px_rgba(255,38,61,0.25)]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-[#FF4054] via-[#FF263D] to-[#b91c1c] px-6 py-3.5 text-xs font-bold tracking-wide text-white shadow-[0_10px_35px_rgba(255,38,61,0.35)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_15px_45px_rgba(255,38,61,0.55)] cursor-pointer"
                >
                  <span>Notify Me</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. BOTTOM FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020508]/80 py-8 text-center text-xs text-[#8F9298] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-[#F5F5F5]">KURONEX GAMES</span>
            <span>•</span>
            <span>© 2026 Kuronex Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-[#00E5FF] transition">Privacy Policy</Link>
            <Link href="#terms" className="hover:text-[#00E5FF] transition">Terms of Service</Link>
            <Link href="#support" className="hover:text-[#00E5FF] transition">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
