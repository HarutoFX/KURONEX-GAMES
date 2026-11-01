"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { SiteNavbar } from "@/components/ui/navigation";

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
      {/* ── 1. Unified Shared Navbar ─────────────────────────────────── */}
      <SiteNavbar />

      {/* ── 2. Centered Hero Content ─────────────────────────────────── */}
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
            <Link href="/library" className="button button-primary">
              Explore Library
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link href="/download" className="button button-secondary">
              <Play size={15} aria-hidden="true" />
              Upcoming Client App
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Scroll Indicator with Breathing Fade & Scroll-Fade ────── */}
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
