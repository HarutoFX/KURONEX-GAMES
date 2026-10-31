"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Check, Bell, Sparkles } from "lucide-react";

export interface ProjectCartridgeCardProps {
  id?: string;
  projectCode: string;
  title?: string;
  tagline: string;
  genre: string;
  phase: string;
  statusBadge: string;
  accentColor?: string;
  description: string;
  progressPercent: number;
  coverImage?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ProjectCartridgeCard({
  projectCode,
  title,
  tagline,
  genre,
  phase,
  statusBadge,
  accentColor = "#FF263D",
  description,
  progressPercent,
  coverImage,
  icon: Icon = Sparkles,
}: ProjectCartridgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isNotified, setIsNotified] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="group relative h-full"
    >
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
        }}
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#07080A]/90 p-5 backdrop-blur-2xl transition-all duration-300 group-hover:border-[rgba(255,38,61,0.45)] group-hover:shadow-[0_0_35px_rgba(255,38,61,0.18)]"
      >
        {/* Dynamic Holographic Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 80%)`,
          }}
        />

        {/* Top Card Bar */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px_#FF263D]"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-mono text-xs font-bold tracking-widest text-[#FF263D]">
                {projectCode}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-[#F5F5F5]">
              {statusBadge}
            </span>
          </div>

          {/* Interactive Holographic Display Chamber */}
          <div className="relative my-4 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#020405]">
            {coverImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={coverImage}
                  alt={title || tagline}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-transparent to-transparent opacity-80" />
              </div>
            ) : (
              <>
                {/* Cyber Grid Lines */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, #FF263D 1px, transparent 1px), linear-gradient(to bottom, #FF263D 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                  }}
                />

                {/* Live Animated Radar Sweep */}
                <div className="absolute h-32 w-32 rounded-full border border-[#FF263D]/20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#FF263D]/30 animate-spin [animation-duration:12s]" />
                  <div className="absolute h-16 w-16 rounded-full border border-[#FF263D]/15" />
                </div>

                {/* Central Holographic Icon */}
                <div className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054] shadow-[0_0_24px_rgba(255,38,61,0.25)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="mt-2 text-[9px] font-mono tracking-widest text-[#8F9298] uppercase">
                    CARTRIDGE CORE
                  </span>
                </div>
              </>
            )}

            {/* Live Audio Equalizer Bars */}
            <div className="absolute bottom-2.5 left-3 flex items-end gap-1 z-10">
              {[60, 100, 45, 80, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#FF263D] rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.14}px`,
                    animationDelay: `${i * 180}ms`,
                  }}
                />
              ))}
            </div>

            {/* Telemetry Corner Readout */}
            <div className="absolute top-2.5 right-3 text-[9px] font-mono text-white/70 z-10">
              CORE // ONLINE
            </div>
          </div>

          {/* Title & Description */}
          {title && (
            <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FF4054] transition-colors">
              {title}
            </h3>
          )}
          <p className="text-xs font-semibold text-[#8F9298] mt-0.5">
            {tagline}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-[#8F9298] line-clamp-2">
            {description}
          </p>

          {/* Genre & Phase */}
          <div className="mt-3.5 flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#C5C7CC]">{genre}</span>
            <span className="font-mono text-[#FF263D]">{phase}</span>
          </div>

          {/* Development Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9298] mb-1">
              <span>PLAYTEST READINESS</span>
              <span className="text-[#FF263D] font-bold">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] rounded-full transition-all duration-500 shadow-[0_0_10px_#FF263D]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
          <span className="text-[11px] font-semibold text-[#8F9298]">
            Status: <span className="text-[#F5F5F5]">Available</span>
          </span>

          <button
            onClick={() => setIsNotified(!isNotified)}
            aria-label={`Save ${projectCode}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
              isNotified
                ? "border border-[#FF263D] bg-[#FF263D] text-white shadow-[0_0_18px_rgba(255,38,61,0.5)]"
                : "border border-white/10 bg-white/5 text-[#8F9298] hover:border-[#FF263D]/50 hover:text-[#FF4054] hover:bg-[#FF263D]/10"
            }`}
          >
            {isNotified ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added to Library</span>
              </>
            ) : (
              <>
                <Bell className="h-3.5 w-3.5" />
                <span>Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
