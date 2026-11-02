"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { GradientText } from "@/components/ui/gradient-text";

interface AuthLayoutProps {
  children: React.ReactNode;
  brandLabel?: string;
  sectionLabel: string;
  heading: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthLayout({
  children,
  brandLabel = "KURONEX GAMES",
  sectionLabel,
  heading,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#FFFFFF] antialiased flex flex-col justify-between selection:bg-[#FF263D]/30 selection:text-white">
      {/* ─── Top Header Navigation ────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-[#929292] hover:text-[#FFFFFF] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] rounded-lg py-1 px-2 -ml-2"
          aria-label="Navigate back to KURONEX GAMES Home"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 text-[#929292] group-hover:text-[#FFFFFF]" />
          <span>Back to Home</span>
        </Link>

        {/* KURONEX GAMES Brand Logo Lockup */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] rounded-xl p-1"
          aria-label="KURONEX GAMES Home"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] transition-all duration-300 group-hover:border-[#FF263D]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="kAuthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4054" />
                  <stop offset="100%" stopColor="#FF263D" />
                </linearGradient>
                <linearGradient id="kAuthCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FF4054" />
                </linearGradient>
              </defs>
              <path d="M4 4H8V20H4V4Z" fill="url(#kAuthGrad)" />
              <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#kAuthGrad)" />
              <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#kAuthCore)" opacity="0.9" />
              <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#kAuthCore)" opacity="0.9" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF263D]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-[0.2em] text-[#FFFFFF]">
              KURONEX
            </span>
            <span className="rounded border border-[#FF263D]/30 bg-[#FF263D]/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#FF263D]">
              GAMES
            </span>
          </div>
        </Link>
      </header>

      {/* ─── Centered Authentication Panel with Magic Card Spotlight Effect ─── */}
      <main className="relative z-10 w-full max-w-[440px] mx-auto px-4 py-8 sm:py-12 my-auto">
        <MagicCard
          gradientColor="rgba(255, 38, 61, 0.35)"
          gradientSize={260}
          className="p-6 sm:p-8 md:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Header Typography */}
          <div className="mb-7 text-center">
            {/* Small Section Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#292929] bg-[#181818] px-3 py-1 mb-3.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF263D]" aria-hidden="true" />
              <span className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-[#929292]">
                {sectionLabel}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
              <GradientText as="span">{heading}</GradientText>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-[#929292] leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer Navigation Link */}
          <div className="mt-7 pt-6 border-t border-[#292929] text-center text-xs text-[#929292]">
            <span>{footerText} </span>
            <Link
              href={footerLinkHref}
              className="font-semibold text-[#FF263D] hover:text-[#FF4054] underline-offset-4 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] rounded px-1"
            >
              {footerLinkText}
            </Link>
          </div>
        </MagicCard>
      </main>

      {/* ─── Page Legal Footer ────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 text-[11px] text-[#929292] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© 2026 {brandLabel} Inc. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link
            href="#privacy"
            className="hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF263D] rounded"
          >
            Privacy Policy
          </Link>
          <Link
            href="#terms"
            className="hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF263D] rounded"
          >
            Terms of Service
          </Link>
          <Link
            href="#support"
            className="hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF263D] rounded"
          >
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}

