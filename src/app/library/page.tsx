"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Sparkles,
  Shield,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
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
import { LibraryGameSlot } from "@/lib/library-store";
import { LargeLibraryCard } from "@/components/library/LargeLibraryCard";

const navItems = [
  { name: "Discover", link: "/discover" },
  { name: "Library", link: "/library", active: true },
  { name: "Developers", link: "/developers" },
  { name: "Download", link: "/download" },
];

const CATEGORIES = ["All", "Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

export default function LibraryPage() {
  const { user, logout } = useAuth();
  const [games, setGames] = useState<LibraryGameSlot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGame, setSelectedGame] = useState<LibraryGameSlot | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                    <linearGradient id="navLibKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4054" />
                      <stop offset="100%" stopColor="#FF263D" />
                    </linearGradient>
                    <linearGradient id="navLibKCore" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FF4054" />
                    </linearGradient>
                  </defs>
                  <path d="M4 4H8V20H4V4Z" fill="url(#navLibKGrad)" />
                  <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navLibKGrad)" />
                  <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navLibKCore)" opacity="0.9" />
                  <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navLibKCore)" opacity="0.9" />
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

          <NavItems items={navItems} activeItem="Library" />

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin?tab=library"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-3.5 py-1.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Manager</span>
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
                  item.name === "Library"
                    ? "text-[#FF4054] font-bold"
                    : "text-[#8F9298] hover:text-[#F5F5F5]"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
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

      {/* ─── 2. LIBRARY SHOWCASE HEADER ──────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" aria-hidden="true" />
              CURATED CATEGORY VAULTS
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F5F5F5]">
              <AuroraText>Platform Library.</AuroraText>
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#8F9298] leading-relaxed">
              Explore 2-4 flagship titles and upcoming releases per category. All slots are managed
              directly by Kuronex curators through the in-website Admin Manager.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07080A]/85 px-4 py-2.5 backdrop-blur-md">
              <Layers className="h-4 w-4 text-[#FF4054]" />
              <span className="text-xs font-mono text-[#F5F5F5]">
                {games.length} CARTRIDGE SLOTS
              </span>
            </div>
            {isAdmin && (
              <Link
                href="/admin?tab=library"
                className="flex items-center gap-1.5 rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/15 px-4 py-2.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/25 transition backdrop-blur-md"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Edit Mode</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── Category Filter Pills ────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#8F9298] mr-1 shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FF263D] text-white shadow-[0_0_20px_rgba(255,38,61,0.35)]"
                    : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8F9298]">
            <Flame className="h-3.5 w-3.5 text-[#FF263D]" />
            <span>2-4 SLOTS PER CATEGORY</span>
          </div>
        </div>

        {/* ─── Categories & Big Cards Showcase ─────────────────────────────── */}
        {isLoading ? (
          <div className="my-24 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#FF263D]" />
            <span className="mt-4 font-mono text-xs text-[#8F9298]">SYNCING LIBRARY SLOTS...</span>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {activeCategories.map((category) => {
              const categorySlots = games.filter(
                (g) => g.category.toLowerCase() === category.toLowerCase()
              );

              return (
                <section key={category} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF263D] shadow-[0_0_8px_#FF263D]" />
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F5]">
                        {category} Vault
                      </h2>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#8F9298]">
                        {categorySlots.length} Slots Assigned
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href={`/admin?tab=library&category=${category}`}
                        className="text-xs font-semibold text-[#FF4054] hover:underline"
                      >
                        + Manage {category} Slots
                      </Link>
                    )}
                  </div>

                  {/* Big Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categorySlots.map((slot) => (
                      <LargeLibraryCard
                        key={slot.id}
                        slot={slot}
                        isAdmin={isAdmin}
                        onInspect={(selected) => setSelectedGame(selected)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ─── Game Inspector Modal ─────────────────────────────────────────── */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="relative w-full max-w-xl rounded-3xl border border-[#FF263D]/40 bg-[#07080A] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF263D] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-[#FF4054]">
                    {selectedGame.category.toUpperCase()} • SLOT {selectedGame.slotNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 text-center">
                <div className="relative mx-auto aspect-[16/10] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#03060A]">
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

                <h3 className="mt-4 text-2xl font-bold text-white">{selectedGame.title || "Unassigned Title"}</h3>
                <p className="text-xs text-[#8F9298] mt-1">{selectedGame.tagline || "Title slot ready for deployment"}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Platform Verified
                    </span>
                    <span className="font-mono text-[#FF4054] font-bold">{selectedGame.progressPercent}% Ready</span>
                  </div>
                  <p className="text-xs text-[#8F9298] leading-relaxed">
                    {selectedGame.description || "No description currently set. You can configure this title from the in-website Admin Panel."}
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8F9298] font-mono">
                    <span>Developer: {selectedGame.developer || "Unassigned"}</span>
                    <span>Status: {selectedGame.badge}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {isAdmin && (
                    <Link
                      href={`/admin?tab=library&slot=${selectedGame.id}`}
                      className="flex-1 rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 py-3 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition text-center"
                    >
                      Edit in Admin
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-[#FF4054] to-[#FF263D] py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── 3. BOTTOM FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020508]/80 py-8 text-center text-xs text-[#8F9298] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-[#F5F5F5]">KURONEX GAMES</span>
            <span>•</span>
            <span>© 2026 Kuronex Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/discover" className="hover:text-[#FF4054] transition">About Us</Link>
            <Link href="/developers" className="hover:text-[#FF4054] transition">Developers</Link>
            <Link href="/download" className="hover:text-[#FF4054] transition">Download Client</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
