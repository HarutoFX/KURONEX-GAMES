"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Code2 } from "lucide-react";
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
} from "./resizable-navbar";
import { useAuth } from "@/context/AuthContext";

export interface NavItem {
  name: string;
  link: string;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { name: "Discover", link: "/discover" },
  { name: "Library", link: "/library" },
  { name: "Developers", link: "/developers" },
  { name: "Download", link: "/download" },
];

export function KuronexLogo() {
  return (
    <div className="group flex items-center gap-3">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#080808] shadow-[0_0_16px_rgba(255,38,61,0.12)] backdrop-blur-md transition-all duration-300 group-hover:border-[rgba(255,38,61,0.4)] group-hover:shadow-[0_0_24px_rgba(255,38,61,0.25)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="navBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4054" />
              <stop offset="100%" stopColor="#FF263D" />
            </linearGradient>
            <linearGradient id="navBrandCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FF4054" />
            </linearGradient>
          </defs>
          <path d="M4 4H8V20H4V4Z" fill="url(#navBrandGrad)" />
          <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navBrandGrad)" />
          <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navBrandCore)" opacity="0.9" />
          <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navBrandCore)" opacity="0.9" />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF263D] shadow-[0_0_6px_#FF263D]" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-[0.2em] text-[#FFFFFF] antialiased">
          KURONEX
        </span>
        <span className="rounded border border-[rgba(255,38,61,0.25)] bg-[rgba(255,38,61,0.10)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#FF263D] shadow-[0_0_12px_rgba(255,38,61,0.10)]">
          GAMES
        </span>
      </div>
    </div>
  );
}

export function SiteNavbar({
  activeItem,
  items = DEFAULT_NAV_ITEMS,
}: {
  activeItem?: string;
  items?: NavItem[];
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-detect active item from pathname if not explicitly provided
  const currentActive =
    activeItem ||
    items.find((item) => {
      if (item.link === "/" && pathname === "/") return true;
      if (item.link !== "/" && pathname?.startsWith(item.link)) return true;
      return false;
    })?.name;

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo href="/">
          <KuronexLogo />
        </NavbarLogo>

        <NavItems items={items} activeItem={currentActive} />

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-3.5 py-1.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {user?.role === "developer" && (
            <Link
              href="/developers"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Studio</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-[#111111]/80 py-1.5 px-3.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-semibold text-[#FFFFFF]">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[#929292] hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavbarButton href="/login" variant="secondary">
                Login
              </NavbarButton>
              <NavbarButton href="/register" variant="primary">
                Register
              </NavbarButton>
            </div>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/">
            <KuronexLogo />
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
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2 text-sm font-semibold text-[#FFFFFF] hover:text-[#FF4054] transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2 text-sm font-semibold text-[#FF4054] flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-3 border-t border-[#292929]">
            {user ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#181818] p-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-[#FFFFFF]">Signed in as {user.username}</span>
                </div>
                <button
                  type="button"
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
              <div className="flex flex-col gap-2.5">
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
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[#292929] bg-[#080808]/90 py-8 text-center text-xs text-[#929292] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-bold tracking-widest text-[#FFFFFF]">KURONEX GAMES</span>
          <span>•</span>
          <span className="text-[#FF263D]">Build Your Own Library.</span>
          <span>•</span>
          <span>© 2026 Kuronex Inc.</span>
        </div>

        <nav aria-label="Footer Navigation" className="flex items-center gap-6 text-xs">
          <Link href="/discover" className="hover:text-[#FF4054] transition-colors">
            Discover
          </Link>
          <Link href="/library" className="hover:text-[#FF4054] transition-colors">
            Library
          </Link>
          <Link href="/developers" className="hover:text-[#FF4054] transition-colors">
            Developers
          </Link>
          <Link href="/download" className="hover:text-[#FF4054] transition-colors">
            Client App
          </Link>
        </nav>
      </div>
    </footer>
  );
}

