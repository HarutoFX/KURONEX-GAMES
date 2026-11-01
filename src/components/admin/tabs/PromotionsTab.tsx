"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function PromotionsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
          <h4 className="text-sm font-bold text-white">Alpha Playtest Key Allocation</h4>
          <p className="text-xs text-[#A1A1AA]">
            Control automated key distribution drops for waitlist players.
          </p>
          <div className="pt-2">
            <span className="inline-block rounded-md border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-mono font-bold text-zinc-300">
              0 Keys Claimed • Playtest Distribution Pending
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
          <h4 className="text-sm font-bold text-white">Seasonal Hero Spotlight</h4>
          <p className="text-xs text-[#A1A1AA]">
            KX-01 Neon Haven currently featured as primary platform header.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#FF263D] hover:underline"
          >
            <span>Preview Live Banner</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
