"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { DeveloperPartner } from "@/lib/library-store";

interface CmsTabProps {
  filteredDevelopers: DeveloperPartner[];
  onSaveDeveloper: (dev: DeveloperPartner) => Promise<void>;
  onDeleteDeveloper: (devId: string) => Promise<void>;
  isSaving: boolean;
}

export function CmsTab({
  filteredDevelopers,
  onSaveDeveloper,
  onDeleteDeveloper,
  isSaving,
}: CmsTabProps) {
  const [editingDev, setEditingDev] = useState<DeveloperPartner | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev) return;
    await onSaveDeveloper(editingDev);
    setEditingDev(null);
  };

  const handleAddNew = () => {
    setEditingDev({
      id: `dev_${Date.now()}`,
      name: "",
      tagline: "",
      description: "",
      headquarters: "",
      icon: "Sparkles",
      genre: "Action",
      partnerTier: "Studio Partner",
      website: "https://",
      gamesCount: 0,
      showInTicker: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white">Partner Studio Directory</h4>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Studio</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
              <th className="py-3 px-4">Studio Name</th>
              <th className="py-3 px-4">Tagline</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Headquarters</th>
              <th className="py-3 px-4">Games</th>
              <th className="py-3 px-4">Ticker</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#35151C]/60 text-white">
            {filteredDevelopers.map((dev) => (
              <tr key={dev.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-white">
                  {dev.name}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] max-w-xs truncate">
                  {dev.tagline}
                </td>
                <td className="py-3 px-4">
                  <span className="rounded-md border border-[#FF263D]/30 bg-[#FF263D]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#FF263D]">
                    {dev.partnerTier}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A1A1AA]">
                  {dev.headquarters}
                </td>
                <td className="py-3 px-4 font-mono">
                  {dev.gamesCount}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`h-2 w-2 rounded-full inline-block ${
                      dev.showInTicker ? "bg-emerald-400" : "bg-[#A1A1AA]"
                    }`}
                  />
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingDev(dev)}
                    className="text-xs text-[#A1A1AA] hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteDeveloper(dev.id)}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Developer Modal */}
      {editingDev && (
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#35151C]">
            <h4 className="text-sm font-bold text-white">
              {editingDev.name ? `Edit Studio: ${editingDev.name}` : "Add Partner Studio"}
            </h4>
            <button
              onClick={() => setEditingDev(null)}
              className="text-[#A1A1AA] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Studio Name
              </label>
              <input
                type="text"
                required
                value={editingDev.name}
                onChange={(e) => setEditingDev({ ...editingDev, name: e.target.value })}
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={editingDev.tagline}
                onChange={(e) =>
                  setEditingDev({ ...editingDev, tagline: e.target.value })
                }
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Partnership Tier
              </label>
              <select
                value={editingDev.partnerTier}
                onChange={(e) =>
                  setEditingDev({
                    ...editingDev,
                    partnerTier: e.target.value as DeveloperPartner["partnerTier"],
                  })
                }
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              >
                <option value="Premier Partner">Premier Partner</option>
                <option value="Studio Partner">Studio Partner</option>
                <option value="Indie Pioneer">Indie Pioneer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Headquarters
              </label>
              <input
                type="text"
                value={editingDev.headquarters}
                onChange={(e) =>
                  setEditingDev({ ...editingDev, headquarters: e.target.value })
                }
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingDev.description}
                onChange={(e) =>
                  setEditingDev({ ...editingDev, description: e.target.value })
                }
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-[#35151C]">
              <button
                type="button"
                onClick={() => setEditingDev(null)}
                className="rounded-xl border border-[#35151C] px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-5 py-2 text-xs font-bold text-white transition"
              >
                {isSaving ? "Saving..." : "Save Partner Studio"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
