"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { developersService, type StudioProfileDto } from "@/services/developers.service";

const DEFAULT_PROFILE: StudioProfileDto = {
  studioName: "Kuronex Partner Studio",
  tagline: "Architecting the next epoch of high-fidelity native gaming.",
  headquarters: "Tokyo / San Francisco",
  website: "https://kuronex.gg",
  teamSize: "10-25 Engineers & Artists",
  primaryEngine: "Unreal Engine 5 / Vulkan",
  bio: "Focused on zero-bloat native desktop execution and responsive gameplay.",
};

export function StudioProfileTab() {
  const [profile, setProfile] = useState<StudioProfileDto>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      try {
        const fetched = await developersService.getStudioProfile();
        if (!ignore && fetched) {
          setProfile(fetched);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load studio profile.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaved(false);
    setIsSaving(true);
    try {
      const res = await developersService.updateStudioProfile(profile);
      if (res.profile) {
        setProfile(res.profile);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save studio profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.studioName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "KX";

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Studio Profile & Public Metadata</h2>
        <p className="text-xs text-[#929292] mt-0.5">
          This metadata is persisted in the database and surfaced on developer listings.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-3xl border border-[#292929] bg-[#0E0F12] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#07080A] text-xl font-extrabold text-[#FF4054]">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{profile.studioName}</h3>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-[#929292]">
              {isLoading ? "Syncing studio record..." : `Kuronex Verified Developer • ID: ${profile.id || "PENDING"}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Studio Name
            </label>
            <input
              type="text"
              required
              disabled={isLoading || isSaving}
              value={profile.studioName}
              onChange={(e) => setProfile({ ...profile, studioName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Official Website
            </label>
            <input
              type="text"
              disabled={isLoading || isSaving}
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none font-mono disabled:opacity-60"
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
              disabled={isLoading || isSaving}
              value={profile.headquarters}
              onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Team Size
            </label>
            <input
              type="text"
              disabled={isLoading || isSaving}
              value={profile.teamSize}
              onChange={(e) => setProfile({ ...profile, teamSize: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Tagline
            </label>
            <input
              type="text"
              disabled={isLoading || isSaving}
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
              Primary Engine
            </label>
            <input
              type="text"
              disabled={isLoading || isSaving}
              value={profile.primaryEngine}
              onChange={(e) => setProfile({ ...profile, primaryEngine: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#07080A] px-3.5 py-2.5 text-xs text-white focus:border-[#FF263D] outline-none disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#929292] mb-1">
            Studio Pitch & Philosophy
          </label>
          <textarea
            rows={4}
            disabled={isLoading || isSaving}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-[#07080A] p-3.5 text-xs text-white focus:border-[#FF263D] outline-none leading-relaxed disabled:opacity-60"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" /> Studio profile saved
            </span>
          ) : (
            <span className="text-xs text-[#929292]">Changes persist directly to database</span>
          )}

          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF263D] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
