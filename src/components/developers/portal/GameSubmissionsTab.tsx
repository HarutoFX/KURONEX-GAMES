"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Gamepad2 } from "lucide-react";
import { DeveloperSubmissionDto } from "@/services/types";

interface GameSubmissionsTabProps {
  submissions: DeveloperSubmissionDto[];
  onSubmitNew: (submission: Partial<DeveloperSubmissionDto>) => Promise<void>;
}

export function GameSubmissionsTab({ submissions, onSubmitNew }: GameSubmissionsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Action",
    targetEngine: "Unreal Engine 5.4",
    targetOs: ["Windows"],
    readinessPercent: 75,
    coverImageUrl: "/images/neon_haven.jpg",
    pitchSummary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmitNew(form);
      setIsModalOpen(false);
      setForm({
        title: "",
        category: "Action",
        targetEngine: "Unreal Engine 5.4",
        targetOs: ["Windows"],
        readinessPercent: 75,
        coverImageUrl: "/images/neon_haven.jpg",
        pitchSummary: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOs = (os: string) => {
    setForm((prev) => ({
      ...prev,
      targetOs: prev.targetOs.includes(os)
        ? prev.targetOs.filter((o) => o !== os)
        : [...prev.targetOs, os],
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Client Storefront Submissions</h2>
          <p className="text-xs text-[#929292] mt-0.5">
            Submit your games to be cataloged on the Kuronex platform and distributed to desktop clients.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF263D] px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,38,61,0.25)] hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Game Submission</span>
        </button>
      </div>

      {/* Submissions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 hover:border-[#FF263D]/40 transition duration-300"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#FF4054] tracking-wider uppercase">
                  {sub.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    sub.status === "Published"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : sub.status === "Approved"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {sub.status.toUpperCase()}
                </span>
              </div>

              {/* Artwork Preview */}
              <div className="relative my-4 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/5 bg-[#03060A]">
                {sub.coverImageUrl ? (
                  <Image
                    src={sub.coverImageUrl}
                    alt={sub.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gamepad2 className="h-8 w-8 text-[#FF4054]" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                  {sub.readinessPercent}% Ready
                </div>
              </div>

              <h3 className="text-xl font-bold text-white">{sub.title}</h3>
              <p className="mt-1 text-xs text-[#929292] leading-relaxed line-clamp-2">
                {sub.pitchSummary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#929292]">
                <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1">
                  {sub.targetEngine}
                </span>
                {sub.targetOs.map((os) => (
                  <span key={os} className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1">
                    {os}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#929292] font-mono">
              <span>Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
              {sub.clientArtifact && (
                <span className="text-[#00E5FF] font-bold">
                  Artifact: {sub.clientArtifact.versionTag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-3xl border border-[#FF263D]/40 bg-[#0E0F12] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF4054]">
                  STUDIO REGISTRY • CLIENT PIPELINE
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">Submit Game to Kuronex</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#929292] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Game Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chrono Rift: Reckoning"
                  className="w-full rounded-xl border border-white/10 bg-[#07080A] px-4 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                  >
                    <option value="Action">Action</option>
                    <option value="RPG">RPG</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Survival">Survival</option>
                    <option value="Shooter">Shooter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                    Primary Engine
                  </label>
                  <input
                    type="text"
                    value={form.targetEngine}
                    onChange={(e) => setForm({ ...form, targetEngine: e.target.value })}
                    placeholder="e.g. Unreal 5.4, Unity, Custom"
                    className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Target Desktop OS Platforms
                </label>
                <div className="flex gap-2">
                  {["Windows", "Linux", "macOS"].map((os) => {
                    const active = form.targetOs.includes(os);
                    return (
                      <button
                        key={os}
                        type="button"
                        onClick={() => toggleOs(os)}
                        className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition border cursor-pointer ${
                          active
                            ? "border-[#FF263D] bg-[#FF263D]/10 text-white"
                            : "border-white/10 bg-[#07080A] text-[#929292]"
                        }`}
                      >
                        {os}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Cover Image URL or Path
                </label>
                <input
                  type="text"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="/images/neon_haven.jpg or https://..."
                  className="w-full rounded-xl border border-white/10 bg-[#07080A] px-4 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
                  Pitch & Gameplay Summary
                </label>
                <textarea
                  rows={3}
                  value={form.pitchSummary}
                  onChange={(e) => setForm({ ...form, pitchSummary: e.target.value })}
                  placeholder="Describe gameplay mechanics, engine fidelity, and player target audience..."
                  className="w-full rounded-xl border border-white/10 bg-[#07080A] p-3 text-xs text-white focus:border-[#FF263D] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-[#929292] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#FF263D] px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit to Platform Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
