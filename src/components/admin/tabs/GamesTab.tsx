"use client";

import React from "react";
import { Edit3 } from "lucide-react";
import { GAMES_DATA } from "@/lib/games";

interface GamesTabProps {
  filteredCatalogGames: typeof GAMES_DATA;
  metrics: {
    gameLibraryStats?: Record<string, number>;
  } | null;
  onEditSlot: (category: string) => void;
}

export function GamesTab({
  filteredCatalogGames,
  metrics,
  onEditSlot,
}: GamesTabProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Genre / Category</th>
              <th className="py-3 px-4">Developer</th>
              <th className="py-3 px-4">User Rating</th>
              <th className="py-3 px-4">Library Adds</th>
              <th className="py-3 px-4">Phase</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#35151C]/60 text-white">
            {filteredCatalogGames.map((game) => (
              <tr key={game.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                <td className="py-3 px-4 font-mono text-[#FF263D] font-bold">
                  {game.projectCode}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {game.title}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA]">
                  {game.genre} ({game.category})
                </td>
                <td className="py-3 px-4 text-[#A1A1AA]">
                  {game.developer}
                </td>
                <td className="py-3 px-4 font-mono text-[#A1A1AA]">
                  No reviews yet
                </td>
                <td className="py-3 px-4 font-mono">
                  {metrics?.gameLibraryStats?.[game.id] || 0} players
                </td>
                <td className="py-3 px-4">
                  <span className="rounded-md border border-[#35151C] bg-[#1A0D10] px-2 py-0.5 text-[10px] font-mono">
                    {game.phase}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEditSlot(game.category)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#35151C] bg-[#1A0D10] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white hover:border-[#FF263D]/40 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Slot</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

