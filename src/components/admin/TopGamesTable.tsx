"use client";

import React from "react";
import { Game } from "@/lib/games";
import { Star, Gamepad2, ArrowRight } from "lucide-react";

interface TopGamesTableProps {
  games: Game[];
  onSelectGame?: (gameId: string) => void;
  onViewAll?: () => void;
}

export function TopGamesTable({ games, onSelectGame, onViewAll }: TopGamesTableProps) {
  return (
    <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#35151C]/60 mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-[#FF263D]" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Top Performing Titles
          </h3>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#FF263D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#35151C] text-[10px] font-mono text-[#A1A1AA] uppercase">
              <th className="pb-2.5 font-semibold">Title</th>
              <th className="pb-2.5 font-semibold">Category</th>
              <th className="pb-2.5 font-semibold">Developer</th>
              <th className="pb-2.5 font-semibold">Active Players</th>
              <th className="pb-2.5 font-semibold">Rating</th>
              <th className="pb-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#35151C]/50 text-white">
            {games.slice(0, 5).map((game) => (
              <tr
                key={game.id}
                className="hover:bg-[#1A0D10]/80 transition-colors group cursor-pointer"
                onClick={() => onSelectGame?.(game.id)}
              >
                <td className="py-3 pr-3 font-semibold">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: game.accentColor }}
                    />
                    <span className="truncate group-hover:text-[#FF4054] transition-colors">
                      {game.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-[#A1A1AA] font-mono text-[11px]">
                  {game.category}
                </td>
                <td className="py-3 pr-3 text-[#A1A1AA] truncate">
                  {game.developer}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-white">
                  {game.playerCount}
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{game.rating}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="inline-block rounded-md border border-[#FF263D]/30 bg-[#FF263D]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#FF263D]">
                    {game.statusBadge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
