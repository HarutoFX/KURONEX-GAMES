"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
} from "lucide-react";

export function StudioProfileTab() {
  const [profile, setProfile] = useState({
    studioName: "Kuronex First-Party Labs",
    tagline: "Architecting the next epoch of high-fidelity native gaming.",
    headquarters: "Tokyo / San Francisco",
    website: "https://kuronex.gg",
    teamSize: "25-50 Engineers & Artists",
    primaryEngine: "Custom C++23 / Unreal 5.4",
    bio: "Focused exclusively on zero-bloat client execution, instant-asset compilation, and high-tickrate network extraction experiences on Kuronex.",
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Studio Profile & Public Metadata</h2>
        <p className="text-xs text-[#929292] mt-0.5">
          This metadata is surfaced on public developer listings and inside the desktop client game cards.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#07080A] text-xl font-extrabold text-[#FF4054]">
            KX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{profile.studioName}</h3>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-[#929292]">Kuronex Verified Developer • ID: DEV-00412</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Studio Name
            </label>
            <input
              type="text"
              value={profile.studioName}
              onChange={(e) => setProfile({ ...profile, studioName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Official Website
            </label>
            <input
              type="text"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Headquarters / Region
            </label>
            <input
              type="text"
              value={profile.headquarters}
              onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Team Size
            </label>
            <input
              type="text"
              value={profile.teamSize}
              onChange={(e) => setProfile({ ...profile, teamSize: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
            Studio Pitch & Philosophy
          </label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-[#07080A] p-3.5 text-xs text-white focus:border-[#FF263D] outline-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" /> Studio profile saved
            </span>
          ) : (
            <span className="text-xs text-[#929292]">Changes reflect immediately across platform APIs</span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF263D] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
