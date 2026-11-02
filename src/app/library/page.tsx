"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Search,
  X,
  ArrowUpDown,
  Tag,
  Monitor,
  Gamepad2,
  ShieldCheck,
  Check,
  Plus,
} from "lucide-react";
import { AuroraText } from "@/registry/magicui/aurora-text";
import { useAuth } from "@/context/AuthContext";
import { LibraryGameSlot } from "@/lib/library-store";
import { LargeLibraryCard } from "@/components/library/LargeLibraryCard";
import { LargeLibraryCardSkeleton } from "@/components/library/LargeLibraryCardSkeleton";
import { SiteNavbar, SiteFooter } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { gamesService } from "@/services/games.service";

const CATEGORIES = ["All", "Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;
const QUICK_TAGS = ["All Tags", "Singleplayer", "Multiplayer", "Co-Op", "RTX", "Controller Supported"] as const;

export default function LibraryPage() {
  const { user, toggleLibraryGame, isInLibrary } = useAuth();
  const [games, setGames] = useState<LibraryGameSlot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All Tags");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"readiness" | "title" | "slot">("slot");
  const [selectedGame, setSelectedGame] = useState<LibraryGameSlot | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "specs" | "features">("overview");
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";

  useEffect(() => {
    async function loadGames() {
      try {
        const fetched = await gamesService.getGames();
        setGames(fetched as unknown as LibraryGameSlot[]);
      } catch (err) {
        console.error("Failed to load library games:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGames();
  }, []);

  // Filter & Search Logic
  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((g) => g.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Tag Filter
    if (selectedTag !== "All Tags") {
      result = result.filter(
        (g) =>
          Array.isArray(g.tags) &&
          g.tags.some((t: string) => t.toLowerCase().includes(selectedTag.toLowerCase()))
      );
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          (g.title && g.title.toLowerCase().includes(q)) ||
          (g.developer && g.developer.toLowerCase().includes(q)) ||
          (g.description && g.description.toLowerCase().includes(q)) ||
          (Array.isArray(g.tags) && g.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // 4. Sorting
    if (sortBy === "readiness") {
      result.sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0));
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      result.sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));
    }

    return result;
  }, [games, selectedCategory, selectedTag, searchQuery, sortBy]);

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
        {/* Promotional Desktop Notice */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#031B24]/90 via-[#07080A]/90 to-[#031B24]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Monitor className="h-4 w-4" />
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                KURONEX NATIVE CLIENT STOREFRONT
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  Coming Soon
                </span>
              </span>
              <p className="text-[11px] text-[#929292]">
                Games are installed and executed exclusively via the Kuronex Desktop Client. Curate and reserve titles in your vault below.
              </p>
            </div>
          </div>
          <Link
            href="/download"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            <span>Client Specs & Waitlist</span>
            <span>→</span>
          </Link>
        </div>

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
              Explore 2-4 flagship titles and upcoming releases per category. All cartridges support direct
              client vault reservations and live metadata configuration.
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

        {/* ─── SEARCH & FILTER CONTROLS BAR ─────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#929292]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by game title, developer studio, or tag..."
              className="w-full rounded-2xl border border-[#292929] bg-[#111111] pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#7A7A7A] focus:border-[#FF263D] outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929292] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-mono text-[#929292] flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "slot" | "readiness" | "title")}
              className="flex-1 rounded-xl border border-[#292929] bg-[#111111] px-3 py-2 text-xs text-white focus:border-[#FF263D] outline-none font-mono"
            >
              <option value="slot">Slot Number</option>
              <option value="readiness">Highest Readiness %</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-mono text-[#929292] flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tag:
            </span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="flex-1 rounded-xl border border-[#292929] bg-[#111111] px-3 py-2 text-xs text-white focus:border-[#FF263D] outline-none font-mono"
            >
              {QUICK_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── CATEGORY FILTER PILLS ────────────────────────────────────────── */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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

        {/* ─── CARDS VAULT SECTION ──────────────────────────────────────────── */}
        <div className="mt-12 space-y-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LargeLibraryCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedGames.length === 0 ? (
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-12 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-[#FF4054] mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">No Game Cartridges Match Your Search</h3>
              <p className="text-xs text-[#929292] max-w-md mx-auto">
                Try adjusting your search keywords, clearing tag filters, or selecting &ldquo;All&rdquo; categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedTag("All Tags");
                }}
                className="mt-2 inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            activeCategories.map((category) => {
              const catGames = filteredAndSortedGames.filter(
                (g) => g.category.toLowerCase() === category.toLowerCase()
              );
              if (catGames.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#FF263D] shadow-[0_0_8px_#FF263D]" />
                      <h2 className="font-mono text-sm font-bold tracking-widest uppercase text-white">
                        {category} Vault
                      </h2>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#929292]">
                        {catGames.length} Cartridges
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catGames.map((game) => (
                      <LargeLibraryCard
                        key={game.id}
                        slot={game}
                        isAdmin={isAdmin}
                        onInspect={() => {
                          setSelectedGame(game);
                          setModalTab("overview");
                        }}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div className="relative w-full max-w-xl my-8 rounded-3xl border border-[#292929] bg-[#111111] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                aria-label="Close dialog"
                className="absolute top-5 right-5 rounded-full p-2 text-[#929292] hover:text-white transition"
              >
                ✕
              </button>

              <div className="space-y-4">
                {/* Artwork Header */}
                <div className="relative mx-auto h-48 w-full overflow-hidden rounded-2xl border border-[#292929] bg-[#181818]">
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
                  <div className="absolute top-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                    CLIENT EXCLUSIVE
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/10 backdrop-blur-md">
                    {selectedGame.progressPercent}% Ready
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#FF4054] uppercase tracking-wider">
                      {selectedGame.category} • SLOT {selectedGame.slotNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[#929292]">
                      {selectedGame.badge || "IN LIBRARY"}
                    </span>
                  </div>
                  <h3 id="library-slot-title" className="text-2xl font-bold text-white mt-1">
                    {selectedGame.title || "Unassigned Title"}
                  </h3>
                  <p className="text-xs text-[#929292] mt-0.5">
                    {selectedGame.tagline || "Title slot ready for deployment on Kuronex Client"}
                  </p>
                </div>

                {/* Modal Sub-tabs */}
                <div className="flex items-center gap-2 border-b border-[#292929] pb-2 text-xs">
                  <button
                    onClick={() => setModalTab("overview")}
                    className={`font-mono px-3 py-1.5 rounded-lg transition ${
                      modalTab === "overview"
                        ? "bg-white/10 text-white font-bold"
                        : "text-[#929292] hover:text-white"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setModalTab("specs")}
                    className={`font-mono px-3 py-1.5 rounded-lg transition ${
                      modalTab === "specs"
                        ? "bg-white/10 text-white font-bold"
                        : "text-[#929292] hover:text-white"
                    }`}
                  >
                    Client Specs
                  </button>
                  <button
                    onClick={() => setModalTab("features")}
                    className={`font-mono px-3 py-1.5 rounded-lg transition ${
                      modalTab === "features"
                        ? "bg-white/10 text-white font-bold"
                        : "text-[#929292] hover:text-white"
                    }`}
                  >
                    Platform Features
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {modalTab === "overview" && (
                  <div className="space-y-3 rounded-2xl border border-[#292929] bg-[#181818] p-4 text-xs">
                    <p className="text-[#929292] leading-relaxed">
                      {selectedGame.description ||
                        "No description currently set. You can configure this title from the in-website Admin Panel."}
                    </p>
                    <div className="pt-2 border-t border-[#292929] flex items-center justify-between text-[11px] text-[#929292] font-mono">
                      <span>Developer: {selectedGame.developer || "Unassigned Studio"}</span>
                      <span>Target: Windows, Linux (Vulkan)</span>
                    </div>
                    {Array.isArray(selectedGame.tags) && selectedGame.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedGame.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-[#D1D5DB]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Specs */}
                {modalTab === "specs" && (
                  <div className="space-y-2 rounded-2xl border border-[#292929] bg-[#181818] p-4 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-xl border border-white/5 bg-[#111111]">
                        <span className="text-[10px] text-[#929292] block">Operating System</span>
                        <span className="text-white font-bold">Windows 10/11 64-bit</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-white/5 bg-[#111111]">
                        <span className="text-[10px] text-[#929292] block">Processor</span>
                        <span className="text-white font-bold">6-Core Intel / AMD Zen 3</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-white/5 bg-[#111111]">
                        <span className="text-[10px] text-[#929292] block">Graphics API</span>
                        <span className="text-cyan-400 font-bold">DirectX 12 / Vulkan 1.3</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-white/5 bg-[#111111]">
                        <span className="text-[10px] text-[#929292] block">Memory & Storage</span>
                        <span className="text-white font-bold">16 GB RAM • NVMe SSD</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Features */}
                {modalTab === "features" && (
                  <div className="space-y-2 rounded-2xl border border-[#292929] bg-[#181818] p-4 text-xs">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Zero-DRM Bloat & Instant Shader Pipeline</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Gamepad2 className="h-4 w-4 text-cyan-400" />
                      <span>Full Controller & Steam Deck Input Mapping</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="h-4 w-4 text-[#FF4054]" />
                      <span>Kuronex Cloud Saves & Cross-Device Sync</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGame) {
                        toggleLibraryGame(selectedGame.id);
                      }
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      selectedGame && isInLibrary(selectedGame.id)
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-[#FF263D] text-white shadow-lg hover:brightness-110"
                    }`}
                  >
                    {selectedGame && isInLibrary(selectedGame.id) ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>In My Web Vault</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Reserve to Vault</span>
                      </>
                    )}
                  </button>

                  {isAdmin && (
                    <Link
                      href={`/admin?tab=library&slot=${selectedGame.id}`}
                      className="rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-2.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition text-center"
                    >
                      Edit Slot
                    </Link>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedGame(null)}
                    className="px-4"
                  >
                    Close
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
