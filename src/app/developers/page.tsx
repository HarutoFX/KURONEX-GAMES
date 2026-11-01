"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  Check,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { DeveloperMarquee } from "@/components/developers/DeveloperMarquee";
import { DeveloperPartner } from "@/lib/library-store";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";

const TIERS = ["All", "Premier Partner", "Studio Partner", "Indie Pioneer"] as const;

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [pitchForm, setPitchForm] = useState({ studioName: "", email: "", projectTitle: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="relative min-h-screen w-full text-[#FFFFFF] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <SiteNavbar activeItem="Developers" />

      {/* ─── 2. DEVELOPERS HERO ───────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex-1">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="eyebrow mx-auto">
            <span className="eyebrow-dot" aria-hidden="true" />
            STUDIO NETWORK & CREATOR ECOSYSTEM
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFFFFF] leading-tight">
            <AuroraText>Our Partner Studios.</AuroraText>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#929292] leading-relaxed max-w-2xl mx-auto">
            Meet the innovative game companies, independent teams, and craft studios shaping
            the future of gaming with Kuronex.
          </p>
        </div>

        {/* ─── 3. CONTINUOUS MOVING SPONSOR/PARTNER STRIP ───────────────────── */}
        <div className="mt-14">
          <div className="text-center mb-3">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#929292] uppercase">
              • ACTIVE PARTNER STUDIOS •
            </span>
          </div>
          <DeveloperMarquee developers={developers} />
        </div>

        {/* ─── 4. TIER FILTER TABS ──────────────────────────────────────────── */}
        <div className="mt-16 flex items-center justify-center gap-2 flex-wrap">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer ${
                selectedTier === tier
                  ? "bg-[#FF263D] text-white shadow-[0_0_20px_rgba(255,38,61,0.35)]"
                  : "border border-[#292929] bg-[#111111] text-[#929292] hover:text-white hover:border-[#383838]"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* ─── 5. STUDIO DIRECTORY GRID ─────────────────────────────────────── */}
        <section className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border border-[#292929] bg-[#111111] animate-pulse" />
              ))}
            </div>
          ) : filteredDevs.length === 0 ? (
            <div className="py-20 text-center text-[#929292]">
              <p>No studios currently listed under this tier.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevs.map((dev) => (
                <div
                  key={dev.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#292929] bg-[#111111] p-6 backdrop-blur-md transition-all duration-300 hover:border-[#FF263D]/50 hover:shadow-[0_0_30px_rgba(255,38,61,0.12)] hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF4054]">
                          {dev.partnerTier}
                        </span>
                        <h3 className="mt-1 text-xl font-bold text-white group-hover:text-[#FF4054] transition">
                          {dev.name}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-[#929292]">
                        {dev.headquarters}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#929292] line-clamp-3 leading-relaxed">
                      {dev.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-[#292929] bg-[#181818] px-2 py-0.5 text-[10px] font-medium text-[#929292]">
                        {dev.genre}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#292929] pt-4 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-[#929292]">
                      {dev.genre} Studio
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
        <section className="mt-20 rounded-2xl border border-[#292929] bg-gradient-to-br from-[#111111] via-[#141414] to-[#080808] p-8 sm:p-14 shadow-[0_0_60px_rgba(255,38,61,0.06)] backdrop-blur-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              PUBLISH ON KURONEX
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
              Partner Your Studio With Us
            </h2>
            <p className="text-xs sm:text-sm text-[#929292] leading-relaxed">
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
                    className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D]"
                  />
                  <input
                    type="email"
                    required
                    value={pitchForm.email}
                    onChange={(e) => setPitchForm({ ...pitchForm, email: e.target.value })}
                    placeholder="Developer Email"
                    className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D]"
                  />
                </div>
                <input
                  type="text"
                  value={pitchForm.projectTitle}
                  onChange={(e) => setPitchForm({ ...pitchForm, projectTitle: e.target.value })}
                  placeholder="Upcoming Game Title (Optional)"
                  className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D]"
                />
                <textarea
                  rows={3}
                  value={pitchForm.message}
                  onChange={(e) => setPitchForm({ ...pitchForm, message: e.target.value })}
                  placeholder="Tell us briefly about your engine, genre, and timeline..."
                  className="w-full rounded-xl border border-[#292929] bg-[#181818] px-4 py-2.5 text-xs text-white placeholder-[#929292] outline-none transition focus:border-[#FF263D] resize-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Studio Application</span>
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ─── 7. FOOTER ────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
