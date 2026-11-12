"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Sparkles, Play, Edit3 } from "lucide-react";
import type { LibraryGameSlot } from "@/lib/library-store";

interface LargeLibraryCardProps {
  slot: LibraryGameSlot;
  isAdmin?: boolean;
  onInspect?: (slot: LibraryGameSlot) => void;
}

export function LargeLibraryCard({ slot, isAdmin = false, onInspect }: LargeLibraryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // ─── 1. EMPTY CARTRIDGE SLOT STATE ──────────────────────────────────────────
  if (slot.isEmpty || !slot.title.trim()) {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
        className="group relative min-h-[440px] h-full"
      >
        <div
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
          }}
          className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-dashed border-white/10 bg-[#07080A]/60 p-7 backdrop-blur-2xl transition-all duration-300 group-hover:border-[#FF263D]/40 group-hover:bg-[#07080A]/85 group-hover:shadow-[0_0_40px_rgba(255,38,61,0.12)]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/20 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#8F9298]">
                {slot.category.toUpperCase()} • SLOT {slot.slotNumber}
              </span>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] font-mono font-bold text-[#8F9298]">
              {slot.badge || "EMPTY"}
            </span>
          </div>

          {/* Holographic Chamber Placeholder */}
          <div className="relative my-6 flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#03060A]">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#8F9298] transition-transform duration-300 group-hover:scale-110 group-hover:border-[#FF263D]/40 group-hover:text-[#FF4054]">
                <Plus className="h-7 w-7" />
              </div>
              <span className="mt-3 font-mono text-[11px] font-semibold tracking-wider text-[#8F9298] uppercase">
                Awaiting Title Deployment
              </span>
              <p className="mt-1 text-[11px] text-[#606368] max-w-xs">
                Slot allocated for upcoming {slot.category} release. Configurable via Admin Panel.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-[11px] font-mono text-[#606368]">
              ID: {slot.id}
            </span>

            {isAdmin ? (
              <Link
                href={`/admin?tab=library&slot=${slot.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#FF263D]/40 bg-[#FF263D]/10 px-4 py-1.5 text-xs font-bold text-[#FF4054] hover:bg-[#FF263D]/20 transition"
              >
                <Edit3 className="h-3 w-3" />
                <span>Configure in Admin</span>
              </Link>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#8F9298]">
                Slot Unassigned
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. CONFIGURED GAME CARTRIDGE STATE (BIGGER SIZE) ────────────────────────
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="group relative min-h-[440px] h-full"
    >
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
        }}
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#07080A]/90 p-7 backdrop-blur-2xl transition-all duration-300 group-hover:border-[#FF263D]/45 group-hover:shadow-[0_0_50px_rgba(255,38,61,0.18)]"
      >
        {/* Dynamic Holographic Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 80%)`,
          }}
        />

        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_#FF263D]"
                style={{ backgroundColor: slot.accentColor || "#FF263D" }}
              />
              <span className="font-mono text-xs font-bold tracking-widest text-[#FF4054]">
                {slot.category.toUpperCase()} • SLOT {slot.slotNumber}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[10px] font-bold text-[#F5F5F5]">
              {slot.badge || "IN LIBRARY"}
            </span>
          </div>

          {/* Big Artwork Chamber */}
          <div className="relative my-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#020405]">
            {slot.coverImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={slot.coverImage}
                  alt={slot.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-transparent to-transparent opacity-80" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0c1219] to-[#040609]">
                <Sparkles className="h-10 w-10 text-[#FF4054] opacity-50" />
              </div>
            )}

            {/* Live Equalizer telemetry */}
            <div className="absolute bottom-3 left-4 flex items-end gap-1.5 z-10">
              {[50, 90, 40, 80, 65].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#FF263D] rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.18}px`,
                    animationDelay: `${i * 180}ms`,
                  }}
                />
              ))}
            </div>

            <div className="absolute top-3 right-4 text-[10px] font-mono text-white/70 z-10">
              {slot.developer || "Kuronex Partner"}
            </div>
          </div>

          {/* Title & Tagline */}
          <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-[#FF4054] transition-colors">
            {slot.title}
          </h3>
          <p className="text-xs font-semibold text-[#8F9298] mt-1">
            {slot.tagline}
          </p>

          <p className="mt-3 text-xs leading-relaxed text-[#8F9298] line-clamp-2">
            {slot.description}
          </p>

          {/* Progress / Readiness bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9298] mb-1">
              <span>DEVELOPMENT READINESS</span>
              <span className="text-[#FF4054] font-bold">{slot.progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] rounded-full transition-all duration-500 shadow-[0_0_10px_#FF263D]"
                style={{ width: `${slot.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-mono text-[#8F9298]">
            Category: <strong className="text-white">{slot.category}</strong>
          </span>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/admin?tab=library&slot=${slot.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8F9298] hover:text-white transition"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit</span>
              </Link>
            )}

            <button
              onClick={() => onInspect?.(slot)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-4 py-1.5 text-xs font-bold text-white shadow-[0_5px_20px_rgba(255,38,61,0.3)] hover:shadow-[0_8px_25px_rgba(255,38,61,0.5)] transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
