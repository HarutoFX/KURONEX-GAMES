"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { useAuth } from "@/context/AuthContext";
import { LibraryGameSlot } from "@/lib/library-store";
import { LargeLibraryCard } from "@/components/library/LargeLibraryCard";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

export default function LibraryPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<LibraryGameSlot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGame, setSelectedGame] = useState<LibraryGameSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/api/library-games");
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Failed to load library games:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGames();
  }, []);

  const activeCategories = useMemo(() => {
    if (selectedCategory === "All") {
      return Array.from(new Set(games.map((g) => g.category)));
    }
    return [selectedCategory];
  }, [games, selectedCategory]);

  return (
    <div className="relative min-h-screen w-full text-[#FFFFFF] antialiased selection:bg-[#FF263D]/25 selection:text-white flex flex-col justify-between">
      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <SiteNavbar activeItem="Library" />

      {/* ─── 2. LIBRARY SHOWCASE HEADER ──────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#292929]">
          <div>
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" aria-hidden="true" />
              CURATED CATEGORY VAULTS
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFFFFF]">
              <AuroraText>Platform Library.</AuroraText>
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#929292] leading-relaxed">
              Explore 2-4 flagship titles and upcoming releases per category. All slots are managed
              live through the platform catalogue database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin?tab=library"
                className="inline-flex items-center gap-2 rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-2.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Configure Slots</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── CATEGORY FILTER PILLS ────────────────────────────────────────── */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#FF263D] text-white shadow-[0_0_20px_rgba(255,38,61,0.35)]"
                  : "border border-[#292929] bg-[#111111] text-[#929292] hover:text-white hover:border-[#383838]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── CATEGORY SHELVES ────────────────────────────────────────────── */}
        <div className="mt-12 space-y-16">
          {isLoading ? (
            <div className="space-y-12">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-48 bg-[#181818] rounded-md animate-pulse" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-72 rounded-2xl border border-[#292929] bg-[#111111] animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#929292]">No games found in the library slots.</p>
            </div>
          ) : (
            activeCategories.map((category) => {
              const catGames = games.filter((g) => g.category === category);
              if (catGames.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#292929] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#292929] bg-[#181818] text-[#FF4054]">
                        <Flame className="h-4 w-4" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {category} Vault
                      </h2>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#929292]">
                        {catGames.length} Slots
                      </span>
                    </div>

                    <span className="text-xs font-mono text-[#929292]">
                      Live Curated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catGames.map((game) => (
                      <LargeLibraryCard
                        key={game.id}
                        slot={game}
                        isAdmin={isAdmin}
                        onInspect={() => setSelectedGame(game)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── MODAL DETAIL VIEW ───────────────────────────────────────────── */}
        {selectedGame && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-slot-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          >
            <div className="relative w-full max-w-lg rounded-2xl border border-[#292929] bg-[#111111] p-6 shadow-[0_0_50px_rgba(255,38,61,0.2)]">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 rounded-full p-2 text-[#929292] hover:text-white transition"
              >
                ✕
              </button>

              <div className="text-center">
                <div className="relative mx-auto h-44 w-full overflow-hidden rounded-xl border border-[#292929] bg-[#181818]">
                  {selectedGame.coverImage ? (
                    <Image
                      src={selectedGame.coverImage}
                      alt={selectedGame.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Sparkles className="h-10 w-10 text-[#FF4054]" />
                    </div>
                  )}
                </div>

                <h3 id="library-slot-title" className="mt-4 text-2xl font-bold text-white">{selectedGame.title || "Unassigned Title"}</h3>
                <p className="text-xs text-[#929292] mt-1">{selectedGame.tagline || "Title slot ready for deployment"}</p>

                <div className="mt-6 rounded-xl border border-[#292929] bg-[#181818] p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#FF4054] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Platform Curated
                    </span>
                    <span className="font-mono text-[#FF4054] font-bold">{selectedGame.progressPercent}% Ready</span>
                  </div>
                  <p className="text-xs text-[#929292] leading-relaxed">
                    {selectedGame.description || "No description currently set. You can configure this title from the in-website Admin Panel."}
                  </p>
                  <div className="pt-2 border-t border-[#292929] flex items-center justify-between text-[11px] text-[#929292] font-mono">
                    <span>Developer: {selectedGame.developer || "Unassigned"}</span>
                    <span>Status: {selectedGame.badge}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {isAdmin && (
                    <Link
                      href={`/admin?tab=library&slot=${selectedGame.id}`}
                      className="flex-1 rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 py-2.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition text-center"
                    >
                      Edit in Admin
                    </Link>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setSelectedGame(null)}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── 3. BOTTOM FOOTER ─────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
