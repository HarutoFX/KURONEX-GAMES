"use client";

import React from "react";
import Link from "next/link";
import { DeveloperPartner } from "@/lib/library-store";
import { Sparkles, Compass, ShieldCheck, Flame, Cpu, Trees, Layers, Zap } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Compass,
  ShieldCheck,
  Flame,
  Cpu,
  Trees,
  Layers,
  Zap,
};

interface DeveloperMarqueeProps {
  developers: DeveloperPartner[];
}

export function DeveloperMarquee({ developers }: DeveloperMarqueeProps) {
  const tickerDevs = developers.filter((d) => d.showInTicker);
  // Duplicate for seamless 50% loop
  const repeated = [...tickerDevs, ...tickerDevs, ...tickerDevs];

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Edge Blur / Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-[#020405] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-[#020405] to-transparent" />

      {/* Moving Strip Track */}
      <div className="animate-marquee flex items-center gap-4 sm:gap-6">
        {repeated.map((dev, i) => {
          const IconComponent = ICON_MAP[dev.icon] || Sparkles;
          return (
            <Link
              key={`${dev.id}-${i}`}
              href="/developers"
              className="group flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#07080A]/80 px-5 py-3 backdrop-blur-md transition-all duration-300 hover:border-[#FF263D]/40 hover:bg-[#FF263D]/5 hover:shadow-[0_0_25px_rgba(255,38,61,0.15)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#FF4054] transition-colors group-hover:border-[#FF263D]/40 group-hover:bg-[#FF263D]/10">
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold tracking-wide text-[#F5F5F5] group-hover:text-white transition-colors">
                  {dev.name}
                </span>
                <span className="text-[10px] font-mono text-[#8F9298] group-hover:text-[#FF4054] transition-colors">
                  {dev.genre}
                </span>
              </div>
              <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold text-[#8F9298] uppercase">
                {dev.partnerTier === "Premier Partner" ? "Premier" : "Studio"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
