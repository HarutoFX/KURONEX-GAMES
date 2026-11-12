"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  ExternalLink,
  Activity,
  X,
} from "lucide-react";
import type { Announcement } from "@/lib/admin-store";
import { GradientText } from "@/components/ui/gradient-text";

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  announcements: Announcement[];
  onOpenMobile: () => void;
  title: string;
  subtitle: string;
  primaryAction?: React.ReactNode;
}

export function AdminHeader({
  searchQuery,
  onSearchChange,
  announcements,
  onOpenMobile,
  title,
  subtitle,
  primaryAction,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Quick keyboard focus on Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeAnnouncements = announcements.filter((a) => a.isActive);

  return (
    <header className="sticky top-0 z-30 border-b border-[#35151C] bg-[#080808]/90 backdrop-blur-md">
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-[#A1A1AA] hover:text-white rounded-lg border border-[#35151C] bg-[#130A0C]"
            aria-label="Open Navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search games, players, studios, logs... (Ctrl+K)"
              className="w-full rounded-xl border border-[#35151C] bg-[#130A0C] py-2 pl-9 pr-14 text-xs text-[#FFFFFF] placeholder-[#A1A1AA]/60 outline-none transition-all duration-200 focus:border-[#FF263D] focus:ring-1 focus:ring-[#FF263D]/40"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center rounded border border-[#35151C] bg-[#1A0D10] px-1.5 py-0.5 text-[9px] font-mono text-[#A1A1AA]">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Right: Operational Status, Notifications & Live Site Link */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Operational Status Pill */}
          <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>SYSTEM HEALTHY</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#35151C] bg-[#130A0C] text-[#A1A1AA] hover:border-[#FF263D]/40 hover:text-white transition-all cursor-pointer"
              aria-label="Platform Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAnnouncements.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF263D] text-[9px] font-bold text-white shadow-[0_0_8px_rgba(255,38,61,0.5)]">
                  {activeAnnouncements.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#35151C] bg-[#130A0C] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#35151C]">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#FF263D]" />
                    <span className="text-xs font-bold text-white">Live System Broadcasts</span>
                  </div>
                  <span className="rounded-full bg-[#1A0D10] px-2 py-0.5 text-[10px] font-mono text-[#FF263D]">
                    {activeAnnouncements.length} Active
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto scrollbar-none">
                  {activeAnnouncements.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#A1A1AA]">
                      No active system notifications or emergency broadcasts.
                    </div>
                  ) : (
                    activeAnnouncements.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#35151C] bg-[#1A0D10] p-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono text-[#FF263D] font-bold uppercase shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Live Platform */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#35151C] bg-[#130A0C] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:border-[#FF263D]/40 hover:text-white transition-all"
            target="_blank"
            title="Open Public Platform in new tab"
          >
            <span className="hidden sm:inline">Platform</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Breadcrumb / Contextual Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#35151C]/60 px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#FFFFFF]">
            <GradientText as="span" variant="subtle">{title}</GradientText>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {subtitle}
          </p>
        </div>

        {primaryAction && (
          <div className="shrink-0 flex items-center gap-2">
            {primaryAction}
          </div>
        )}
      </div>
    </header>
  );
}
