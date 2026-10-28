"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

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
import { useState } from "react";

const navItems = [
  {
    name: "Discover",
    link: "#discover",
  },
  {
    name: "Library",
    link: "#library",
  },
  {
    name: "Developers",
    link: "#developers",
  },
];

function ResizableNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <Navbar>
      {/* Desktop Navigation */}
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
                  <linearGradient id="kGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF4054" />
                    <stop offset="100%" stopColor="#FF263D" />
                  </linearGradient>
                  <linearGradient id="kCoreNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FF4054" />
                  </linearGradient>
                </defs>
                <path d="M4 4H8V20H4V4Z" fill="url(#kGradNav)" />
                <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#kGradNav)" />
                <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#kCoreNav)" opacity="0.9" />
                <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#kCoreNav)" opacity="0.9" />
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

        <NavItems items={navItems} />

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
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-sm font-semibold tracking-wide text-[#8F9298] transition hover:text-[#F5F5F5]"
            >
              <span className="block">{item.name}</span>
            </a>
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
                className="w-full rounded-xl border border-[#FF263D]/20 bg-[#FF263D]/10 py-2.5 text-xs font-semibold text-[#FF4054] hover:bg-[#FF263D]/20 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 pt-2">
              <NavbarButton
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Register
              </NavbarButton>
            </div>
          )}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export function HeroTitle() {
  return (
    <h1 className="text-6xl font-bold tracking-[-0.055em] leading-[0.88] md:text-7xl lg:text-8xl">
      <AuroraText>
        Build Your
        <br />
        Own Library.
      </AuroraText>
    </h1>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const { scrollY } = useScroll();
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const scrollIndicatorY = useTransform(scrollY, [0, 120], [0, 12]);

  return (
    <section className="hero" style={{ background: "transparent" }}>
      {/* ── 1. Navbar ────────────────────────────────────────────────── */}
      <ResizableNav />

      {/* ── 4. Centered Hero Content ─────────────────────────────────── */}
      <div className="hero-layout">
        <div className="hero-copy-col">
          {/* Eyebrow */}
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            THE NEXT GENERATION OF GAME LIBRARIES
          </div>

          {/* Headline with Magic UI AuroraText */}
          <HeroTitle />

          {/* Description */}
          <p className="hero-description">
            Discover the games you actually want to play. Shape your
            collection around your taste, your mood, and your way of gaming.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <a href="#discover" className="button button-primary">
              Explore Games
              <ArrowRight size={16} aria-hidden="true" />
            </a>

            <button className="button button-secondary">
              <Play size={15} aria-hidden="true" />
              See How It Works
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Scroll Indicator with Breathing Fade & Scroll-Fade ────── */}
      <motion.a
        href="#discover"
        className="scroll-indicator"
        aria-label="Scroll to discover games"
        style={{
          opacity: scrollIndicatorOpacity,
          y: scrollIndicatorY,
          cursor: "pointer",
        }}
      >
        <span style={{ paddingLeft: "0.28em" }}>Scroll to explore</span>
        <span className="scroll-line" />
      </motion.a>
    </section>
  );
}