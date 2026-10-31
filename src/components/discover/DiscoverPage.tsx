"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Check,
  ArrowRight,
  Bookmark,
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
import { ProjectCartridgeCard } from "@/components/discover/ProjectCartridgeCard";

const navItems = [
  { name: "Discover", link: "/discover", active: true },
  { name: "Library", link: "/library" },
  { name: "Developers", link: "#developers" },
];

const CATEGORIES = ["All", "Action", "RPG", "Sci-Fi", "Shooter", "Survival", "Strategy"] as const;

export function DiscoverPage({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, logout, library } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
    }
  };

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((game: Game) => {
      const matchesCategory =
        selectedCategory === "All" || game.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        game.tagline.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query) ||
        game.projectCode.toLowerCase().includes(query) ||
        game.developer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

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
              <Link
                href="/library"
                className="relative hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1.5 px-3 text-xs font-semibold text-[#8F9298] hover:text-[#F5F5F5] hover:border-white/20 transition"
              >
                <Bookmark className="h-3.5 w-3.5 text-[#FF4054]" />
                <span>Library</span>
                {library.length > 0 && (
                  <span className="ml-1 rounded-full bg-[#FF263D] px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {library.length}
                  </span>
                )}
              </Link>

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
              <Link
                href="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#8F9298] hover:text-[#F5F5F5] flex items-center gap-2"
              >
                <span>My Library</span>
                <span className="rounded-full bg-[#FF263D]/20 px-2 py-0.5 text-xs text-[#FF4054]">
                  {library.length}
                </span>
              </Link>
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

      {/* ─── 2. CATALOG HEADER ─────────────────────────────────────────── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" aria-hidden="true" />
              DIGITAL STORE & LIBRARY
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F5F5F5]">
              <AuroraText>Discover Titles.</AuroraText>
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-[#8F9298]">
              Explore the next generation of games curated for seamless performance,
              high-fidelity gameplay, and zero-bloat digital ownership.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07080A]/80 px-4 py-2.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#FF4054]" />
              <span className="text-xs font-mono text-[#F5F5F5]">
                {filteredGames.length} OF {GAMES_DATA.length} TITLES
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-[#07080A]/80 px-4 py-2.5 backdrop-blur-md">
              <Flame className="h-4 w-4 text-[#FF263D]" />
              <span className="text-xs font-mono text-[#8F9298]">WEB GAMING PLATFORM</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Category Filters Bar ────────────────────────────── */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9298]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, genre, code (e.g. KX-01)..."
              className="w-full rounded-2xl border border-white/10 bg-[#07080A]/80 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none backdrop-blur-md transition focus:border-[#FF263D]/60 focus:shadow-[0_0_20px_rgba(255,38,61,0.2)]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#8F9298] mr-1 shrink-0 hidden sm:block" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.35)]"
                    : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-[#F5F5F5] hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3. GAMES CARTRIDGES GRID ──────────────────────────────────── */}
        {filteredGames.length === 0 ? (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#8F9298]">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#F5F5F5]">No matching titles found</h3>
            <p className="mt-1 text-xs text-[#8F9298] max-w-sm">
              Try adjusting your search query or selecting &quot;All&quot; in the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-2 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <ProjectCartridgeCard
                key={game.id}
                id={game.id}
                projectCode={game.projectCode}
                title={game.title}
                tagline={game.tagline}
                genre={game.genre}
                phase={game.phase}
                statusBadge={game.statusBadge}
                accentColor={game.accentColor}
                description={game.description}
                progressPercent={game.progressPercent}
                coverImage={game.coverImage}
              />
            ))}
          </div>
        )}

        {/* ─── 4. PLAYTEST WAITLIST BANNER ───────────────────────────────── */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-[#07080A] via-[#090D12] to-[#040608] p-8 sm:p-12 shadow-[0_0_50px_rgba(255,38,61,0.06)] backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,38,61,0.18)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="rounded-full border border-[#FF263D]/30 bg-[#FF263D]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#FF4054] uppercase">
              ALPHA PROGRAM
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
              Request Early Playtest Keys
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#8F9298]">
              Be the first to play upcoming Kuronex titles. Test exclusive developer builds and earn permanent platform badges.
            </p>

            <div className="mt-6 flex justify-center">
              {isSubscribed ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-xs font-bold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>You&apos;re queued for early playtest access keys!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email for playtest drops..."
                    className="w-full rounded-full border border-white/10 bg-[rgba(15,20,28,0.7)] px-5 py-3 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_30px_rgba(255,38,61,0.35)] hover:shadow-[0_15px_40px_rgba(255,38,61,0.55)] transition cursor-pointer"
                  >
                    <span>Request Access</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BOTTOM FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020508]/80 py-8 text-center text-xs text-[#8F9298] backdrop-blur-md mt-16">
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
