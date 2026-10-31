"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Trash2,
  HardDrive,
  Gamepad2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
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
import { GAMES_DATA, Game } from "@/lib/games";

const navItems = [
  { name: "Discover", link: "/discover" },
  { name: "Library", link: "/library", active: true },
  { name: "Developers", link: "#developers" },
];

export default function LibraryPage() {
  const { user, logout, library, toggleLibraryGame } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const libraryGames = useMemo(() => {
    const list = GAMES_DATA.filter((game) => library.includes(game.id));
    if (activeTab === "favorites") {
      return list.filter((game) => game.featured);
    }
    return list;
  }, [library, activeTab]);

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

      {/* ─── 2. LIBRARY DASHBOARD ────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 flex-1">
        {/* Header Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" aria-hidden="true" />
              PLAYER COLLECTION
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5]">
              <AuroraText>{user ? `${user.username}'s Vault.` : "Personal Library."}</AuroraText>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#8F9298] max-w-xl">
              Track your saved game collection, wishlists, and gaming activity in one place.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#07080A]/85 p-3.5 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-[#FF4054] mb-1">
                <Gamepad2 className="h-4 w-4" />
                <span className="text-lg font-bold">{libraryGames.length}</span>
              </div>
              <span className="text-[10px] font-mono text-[#8F9298] uppercase">Games</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07080A]/85 p-3.5 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-lg font-bold">42h</span>
              </div>
              <span className="text-[10px] font-mono text-[#8F9298] uppercase">Playtime</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07080A]/85 p-3.5 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-[#00E5FF] mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-lg font-bold">Sync</span>
              </div>
              <span className="text-[10px] font-mono text-[#8F9298] uppercase">Cloud</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.3)]"
                  : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-white"
              }`}
            >
              All Saved ({libraryGames.length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.3)]"
                  : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-white"
              }`}
            >
              Featured Picks
            </button>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4054] hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Browse More Games</span>
          </Link>
        </div>

        {/* ─── Games Grid or Empty State ─────────────────────────────── */}
        {libraryGames.length === 0 ? (
          <div className="my-20 flex flex-col items-center justify-center text-center rounded-3xl border border-white/10 bg-[#07080A]/70 p-12 backdrop-blur-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#FF263D]">
              <Gamepad2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#F5F5F5]">Your Library is Empty</h2>
            <p className="mt-1 text-xs text-[#8F9298] max-w-md">
              Start building your collection! Explore curated cyberpunk RPGs, roguelites, and tactical shooters in the Discover store.
            </p>
            <Link
              href="/discover"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,38,61,0.35)] hover:shadow-[0_15px_40px_rgba(255,38,61,0.55)] transition"
            >
              <span>Explore Discover Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryGames.map((game) => (
              <div
                key={game.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#07080A]/90 p-5 backdrop-blur-2xl transition duration-300 hover:border-[#FF263D]/40 hover:shadow-[0_0_30px_rgba(255,38,61,0.15)]"
              >
                <div>
                  {/* Game Cover */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#020405]">
                    <Image
                      src={game.coverImage}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-transparent to-transparent opacity-80" />

                    <span className="absolute top-2.5 right-2.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[10px] font-mono text-[#00E5FF] backdrop-blur-md">
                      {game.projectCode}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FF4054] transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-[#8F9298]">{game.tagline}</p>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      SYNCED
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#8F9298]">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {game.storageSize}
                    </span>
                    <span className="text-[#F5F5F5] font-mono">{game.genre}</span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <button
                    onClick={() => setPlayingGame(game)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-4 py-2 text-xs font-bold text-white shadow-[0_5px_20px_rgba(255,38,61,0.35)] hover:shadow-[0_8px_25px_rgba(255,38,61,0.5)] transition cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>View Game</span>
                  </button>

                  <button
                    onClick={() => toggleLibraryGame(game.id)}
                    title="Remove from Library"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8F9298] hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Game Overview Modal ───────────────────────────────────── */}
        {playingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-lg rounded-3xl border border-[#FF263D]/40 bg-[#07080A] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF263D] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-[#FF4054]">{playingGame.projectCode} • GAME OVERVIEW</span>
                </div>
                <button
                  onClick={() => setPlayingGame(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 text-center">
                <div className="relative mx-auto aspect-[16/9] w-full max-w-xs overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={playingGame.coverImage}
                    alt={playingGame.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">{playingGame.title}</h3>
                <p className="text-xs text-[#8F9298] mt-1">{playingGame.tagline}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="flex items-center justify-between text-xs text-[#8F9298] mb-2">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Saved in Cloud Vault
                    </span>
                    <span className="font-mono">{playingGame.genre}</span>
                  </div>
                  <p className="text-[11px] text-[#8F9298] leading-relaxed">
                    {playingGame.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="/discover"
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-[#F5F5F5] hover:bg-white/10 transition text-center"
                  >
                    View in Store
                  </Link>
                  <button
                    onClick={() => setPlayingGame(null)}
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
            <Link href="#privacy" className="hover:text-[#FF4054] transition">Privacy Policy</Link>
            <Link href="#terms" className="hover:text-[#FF4054] transition">Terms of Service</Link>
            <Link href="#support" className="hover:text-[#FF4054] transition">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
