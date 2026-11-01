"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Announcement } from "@/lib/admin-store";

interface AnnouncementsTabProps {
  announcements: Announcement[];
  currentUser: { username?: string } | null;
  onToggleAnnouncement: (id: string) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onCreateAnnouncement: (newAnn: {
    title: string;
    message: string;
    priority: Announcement["priority"];
    category: Announcement["category"];
    isActive: boolean;
    author: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export function AnnouncementsTab({
  announcements,
  currentUser,
  onToggleAnnouncement,
  onDeleteAnnouncement,
  onCreateAnnouncement,
  isSaving,
}: AnnouncementsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    priority: "NORMAL" as Announcement["priority"],
    category: "UPDATE" as Announcement["category"],
    isActive: true,
    author: currentUser?.username || "admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAnnouncement(newAnnouncement);
    setNewAnnouncement({
      title: "",
      message: "",
      priority: "NORMAL",
      category: "UPDATE",
      isActive: true,
      author: currentUser?.username || "admin",
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white">Live Platform Announcements</h4>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Broadcast</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Published</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#35151C]/60 text-white">
            {announcements.map((ann) => (
              <tr key={ann.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-white">
                  {ann.title}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] font-mono text-[10px]">
                  {ann.category}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-mono font-bold ${
                      ann.priority === "HIGH" || ann.priority === "URGENT"
                        ? "border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054]"
                        : "border border-[#35151C] text-[#A1A1AA]"
                    }`}
                  >
                    {ann.priority}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[#A1A1AA]">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onToggleAnnouncement(ann.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold transition cursor-pointer ${
                      ann.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#1A0D10] text-[#A1A1AA] border border-[#35151C]"
                    }`}
                  >
                    {ann.isActive ? "Active" : "Archived"}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
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

      {/* Announcement Creation Modal */}
      {showModal && (
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#35151C]">
            <h4 className="text-sm font-bold text-white">Broadcast New Announcement</h4>
            <button
              onClick={() => setShowModal(false)}
              className="text-[#A1A1AA] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Headline
              </label>
              <input
                type="text"
                required
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                }
                placeholder="e.g. Kuronex Alpha Client v1.4.3 Released"
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                required
                value={newAnnouncement.message}
                onChange={(e) =>
                  setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                }
                placeholder="Detailed announcement content..."
                className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Category
                </label>
                <select
                  value={newAnnouncement.category}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      category: e.target.value as Announcement["category"],
                    })
                  }
                  className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                >
                  <option value="UPDATE">UPDATE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="COMMUNITY">COMMUNITY</option>
                  <option value="PROMOTION">PROMOTION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Priority
                </label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      priority: e.target.value as Announcement["priority"],
                    })
                  }
                  className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#35151C]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-[#35151C] px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-5 py-2 text-xs font-bold text-white transition"
              >
                {isSaving ? "Broadcasting..." : "Publish Broadcast"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
