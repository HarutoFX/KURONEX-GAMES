"use client";

import React, { useState } from "react";
import { Edit3, X } from "lucide-react";
import { LibraryGameSlot } from "@/lib/library-store";

const CATEGORIES = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

interface LibrariesTabProps {
  games: LibraryGameSlot[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSaveSlot: (slot: LibraryGameSlot) => Promise<void>;
  onClearSlot: (slotId: string) => Promise<void>;
  isSaving: boolean;
}

export function LibrariesTab({
  games,
  selectedCategory,
  onSelectCategory,
  onSaveSlot,
  onClearSlot,
  isSaving,
}: LibrariesTabProps) {
  const [editingSlot, setEditingSlot] = useState<LibraryGameSlot | null>(null);

  const filteredGames = games.filter((g) => g.category === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    await onSaveSlot(editingSlot);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              onSelectCategory(cat);
              setEditingSlot(null);
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.35)]"
                : "border border-[#35151C] bg-[#130A0C] text-[#A1A1AA] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 6-Slot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((slot) => (
          <div
            key={slot.id}
            className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
              editingSlot?.id === slot.id
                ? "border-[#FF263D] ring-2 ring-[#FF263D]/30 bg-[#1A0D10]"
                : "border-[#35151C] bg-[#130A0C] hover:border-[#FF263D]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#35151C]/60 mb-3">
                <span className="font-mono text-xs font-bold text-[#FF263D]">
                  {slot.id}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] font-mono font-bold ${
                    slot.isEmpty
                      ? "border border-[#35151C] text-[#A1A1AA]"
                      : "border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054]"
                  }`}
                >
                  {slot.badge}
                </span>
              </div>

              {slot.isEmpty ? (
                <div className="py-8 text-center text-xs text-[#A1A1AA]">
                  Empty Vault Slot
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white truncate">
                    {slot.title}
                  </h4>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2">
                    {slot.tagline || slot.description}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-[#A1A1AA]">
                    Developer: <span className="text-white">{slot.developer}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#35151C]/60 pt-3">
              <button
                onClick={() => setEditingSlot(slot)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#35151C] bg-[#1A0D10] px-3 py-1 text-xs font-semibold text-white hover:border-[#FF263D]/40 transition cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>Configure</span>
              </button>
              {!slot.isEmpty && (
                <button
                  onClick={() => onClearSlot(slot.id)}
                  className="text-xs text-[#A1A1AA] hover:text-[#FF263D] transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form Drawer */}
      {editingSlot && (
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#35151C]">
            <h4 className="text-sm font-bold text-white">
              Configure Slot: {editingSlot.id} ({selectedCategory})
            </h4>
            <button
              onClick={() => setEditingSlot(null)}
              className="text-[#A1A1AA] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Game Title
              </label>
              <input
                type="text"
                value={editingSlot.title}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, title: e.target.value })
                }
                placeholder="e.g. Neon Haven"
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={editingSlot.tagline}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, tagline: e.target.value })
                }
                placeholder="e.g. Overdrive Protocol"
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editingSlot.description}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, description: e.target.value })
                }
                placeholder="Short summary of gameplay..."
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Developer Studio
              </label>
              <input
                type="text"
                value={editingSlot.developer}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, developer: e.target.value })
                }
                placeholder="e.g. Kuronex Studios"
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Status Badge
              </label>
              <input
                type="text"
                value={editingSlot.badge}
                onChange={(e) =>
                  setEditingSlot({ ...editingSlot, badge: e.target.value })
                }
                placeholder="e.g. FEATURED, TRENDING, NEW"
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-[#35151C]">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="rounded-xl border border-[#35151C] px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-5 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Slot Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

