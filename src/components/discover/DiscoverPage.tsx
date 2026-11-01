"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  HeartHandshake,
  ArrowRight,
  Check,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { DeveloperMarquee } from "@/components/developers/DeveloperMarquee";
import { DeveloperPartner } from "@/lib/library-store";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";

export function DiscoverPage({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    <div className="relative min-h-screen w-full text-[#FFFFFF] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      {!hideNavbar && <SiteNavbar activeItem="Discover" />}

      {/* ─── 2. ABOUT US & MISSION HERO ─────────────────────────────────── */}
      <main className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 flex-1 ${hideNavbar ? "pt-12" : "pt-28 sm:pt-36"}`}>
        {/* Mission Eyebrow & Headline */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            INTRO & VISION // KURONEX GAMES
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFFFF] leading-tight">
            <AuroraText>Our Mission & Goal.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#929292] leading-relaxed max-w-2xl mx-auto">
            We are building Kuronex to free players and game creators from bloated, memory-hogging launchers.
            A sleek, high-performance ecosystem designed around genuine digital ownership.
          </p>
        </div>

        {/* ─── 3. CORE PILLARS GRID ─────────────────────────────────────────── */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#292929] bg-[#111111]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#FF263D]/40 hover:shadow-[0_0_35px_rgba(255,38,61,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054]">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Ultra-Light Client</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#929292] leading-relaxed">
              Engineered with native compiled performance. Idles at under 40MB RAM and launches in under 300ms, unlike sluggish Chromium-wrapped competitors.
            </p>
          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#111111]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#00E5FF]/40 hover:shadow-[0_0_35px_rgba(0,229,255,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Pro-Developer 88/12</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#929292] leading-relaxed">
              We partner directly with visionary indie and AA game studios with industry-leading revenue splits, instant micro-patching, and zero algorithmic paywalls.
            </p>
          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#111111]/85 p-8 backdrop-blur-2xl transition duration-300 hover:border-[#A855F7]/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.12)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">Player-First Library</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#929292] leading-relaxed">
              Build your own collection. DRM-free freedom, timestamped cloud saves with rollback safeguards, and smooth cross-platform library management.
            </p>
          </div>
        </div>

        {/* ─── 4. PARTNER STUDIOS SECTION ───────────────────────────────────── */}
        <section className="mt-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#292929] pb-6">
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
          <div className="rounded-2xl border border-[#292929] bg-[#111111]/80 backdrop-blur-md p-4">
            <DeveloperMarquee developers={developers} />
          </div>

          {/* Studios Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {developers.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#292929] bg-[#111111]/85 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#FF263D]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#FF4054]">
                      {dev.partnerTier}
                    </span>
                    <span className="text-[10px] font-mono text-[#929292]">
                      {dev.headquarters}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-[#FF4054] transition-colors">
                    {dev.name}
                  </h3>
                  <p className="text-xs text-[#929292] mt-0.5">{dev.tagline}</p>

                  <p className="mt-3 text-xs leading-relaxed text-[#929292] line-clamp-3">
                    {dev.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#292929] pt-3 text-xs font-mono text-[#929292]">
                  <span>{dev.genre || "Indie"}</span>
                  <span className="text-[#FF263D]">{dev.gamesCount} Titles</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. WAITLIST / EARLY ACCESS ───────────────────────────────────── */}
        <div className="mt-20 rounded-2xl border border-[#292929] bg-gradient-to-br from-[#111111] via-[#141414] to-[#080808] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              UPCOMING CLIENT ACCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
              Be Among The First In The Kuronex Client
            </h2>
            <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
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
                    className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto shrink-0"
                  >
                    <span>Notify Me</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── 6. FOOTER ────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
