"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LibraryGameSlot, DeveloperPartner } from "@/lib/library-store";

const CATEGORIES = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;
const COLOR_PRESETS = ["#FF263D", "#00E5FF", "#A855F7", "#F59E0B", "#10B981", "#38BDF8", "#EC4899"];
const ICON_OPTIONS = ["Sparkles", "Compass", "ShieldCheck", "Flame", "Cpu", "Trees", "Layers", "Zap"];

export default function AdminPage() {
  const { user } = useAuth();
  const [adminKey, setAdminKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("kuronex_admin_passkey") || "kuronex-admin-2026";
    }
    return "kuronex-admin-2026";
  });
  const [sessionAuthed, setSessionAuthed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("kuronex_admin_passkey") === "kuronex-admin-2026";
    }
    return false;
  });
  const isAuthenticated = sessionAuthed || user?.role === "admin";
  const [activeTab, setActiveTab] = useState<"library" | "developers">("library");

  // Library State
  const [games, setGames] = useState<LibraryGameSlot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Action");
  const [editingSlot, setEditingSlot] = useState<LibraryGameSlot | null>(null);

  // Developers State
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [editingDev, setEditingDev] = useState<DeveloperPartner | null>(null);

  // Status & Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load data
  useEffect(() => {
    async function fetchData() {
      try {
        const [gRes, dRes] = await Promise.all([
          fetch("/api/admin/games"),
          fetch("/api/admin/developers"),
        ]);
        const gData = gRes.ok ? await gRes.json() : null;
        const dData = dRes.ok ? await dRes.json() : null;
        if (gData?.games) setGames(gData.games);
        if (dData?.developers) setDevelopers(dData.developers);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    }
    fetchData();
  }, []);

  const handleKeyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim() === "kuronex-admin-2026" || user?.role === "admin") {
      setSessionAuthed(true);
      sessionStorage.setItem("kuronex_admin_passkey", adminKey.trim());
      showToast("Admin access authenticated.");
    } else {
      showToast("Invalid Admin Passkey. Please verify and retry.", "error");
    }
  };

  // ─── Save Game Slot ──────────────────────────────────────────────────────────
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setIsSaving(true);
    try {
      const isNowEmpty = !editingSlot.title.trim();
      const updatedSlot = {
        ...editingSlot,
        isEmpty: isNowEmpty,
        badge: isNowEmpty ? "SLOT OPEN" : editingSlot.badge || "FEATURED",
      };

      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ slot: updatedSlot }),
      });

      if (!res.ok) throw new Error("Failed to save slot");

      setGames((prev) => prev.map((g) => (g.id === updatedSlot.id ? updatedSlot : g)));
      setEditingSlot(null);
      showToast(`Slot ${updatedSlot.id} saved successfully!`);
    } catch (err) {
      console.error(err);
      showToast("Error saving game slot. Check network.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Reset Slot to Empty ───────────────────────────────────────────────────
  const handleClearSlot = async (slotId: string) => {
    const target = games.find((g) => g.id === slotId);
    if (!target) return;

    if (!confirm(`Clear slot ${slotId} to an empty placeholder?`)) return;

    setIsSaving(true);
    try {
      const clearedSlot: LibraryGameSlot = {
        ...target,
        title: "",
        tagline: "",
        description: "",
        coverImage: "",
        badge: "SLOT OPEN",
        progressPercent: 0,
        developer: "",
        isEmpty: true,
      };

      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ slot: clearedSlot }),
      });

      if (!res.ok) throw new Error("Failed to clear slot");

      setGames((prev) => prev.map((g) => (g.id === clearedSlot.id ? clearedSlot : g)));
      if (editingSlot?.id === slotId) setEditingSlot(null);
      showToast(`Slot ${slotId} reset to empty placeholder.`);
    } catch (err) {
      console.error(err);
      showToast("Error clearing slot", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Save Developer ─────────────────────────────────────────────────────────
  const handleSaveDev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ developer: editingDev }),
      });

      if (!res.ok) throw new Error("Failed to save developer");

      setDevelopers((prev) => {
        const idx = prev.findIndex((d) => d.id === editingDev.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = editingDev;
          return updated;
        }
        return [...prev, editingDev];
      });

      setEditingDev(null);
      showToast(`Studio ${editingDev.name} saved successfully!`);
    } catch (err) {
      console.error(err);
      showToast("Error saving studio", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete Developer ───────────────────────────────────────────────────────
  const handleDeleteDev = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner studio?")) return;

    setIsSaving(true);
    try {
      const remaining = developers.filter((d) => d.id !== id);
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ developers: remaining }),
      });

      if (!res.ok) throw new Error("Failed to delete developer");

      setDevelopers(remaining);
      if (editingDev?.id === id) setEditingDev(null);
      showToast("Studio removed from partner directory.");
    } catch (err) {
      console.error(err);
      showToast("Error deleting studio", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── GATE: UN-AUTHENTICATED ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-16 text-[#F5F5F5] antialiased">
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#07080A]/90 p-8 shadow-[0_0_60px_rgba(255,38,61,0.15)] backdrop-blur-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054] mb-4">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Kuronex Admin Manager</h1>
            <p className="mt-1 text-xs text-[#8F9298]">
              Authorized platform curators only. Enter passkey to manage library slots and developer studios.
            </p>
          </div>

          <form onSubmit={handleKeyAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8F9298] mb-1.5">
                Admin Passkey
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-4 h-4 w-4 text-[#8F9298]" />
                <input
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin passkey..."
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] py-3 pl-11 pr-4 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#8F9298] outline-none transition focus:border-[#FF263D]/60"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#FF4054] to-[#FF263D] py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/10 pt-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8F9298] hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── DASHBOARD: AUTHENTICATED ───────────────────────────────────────────────
  const categorySlots = games.filter(
    (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="relative min-h-screen w-full text-[#F5F5F5] antialiased flex flex-col justify-between">
      {/* ─── Top Admin Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080A]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold tracking-widest text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF4054] text-xs font-black">
              K
            </span>
            <span>KURONEX</span>
            <span className="rounded bg-[#FF263D]/20 px-1.5 py-0.2 text-[9px] font-mono text-[#FF4054]">
              ADMIN
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 border-l border-white/10 pl-3">
            <button
              onClick={() => {
                setActiveTab("library");
                setEditingSlot(null);
                setEditingDev(null);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "library"
                  ? "bg-[#FF263D] text-white"
                  : "text-[#8F9298] hover:text-white"
              }`}
            >
              Library Manager
            </button>
            <button
              onClick={() => {
                setActiveTab("developers");
                setEditingSlot(null);
                setEditingDev(null);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "developers"
                  ? "bg-[#FF263D] text-white"
                  : "text-[#8F9298] hover:text-white"
              }`}
            >
              Developer Studios
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/library"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-white transition"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem("kuronex_admin_passkey");
              setSessionAuthed(false);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-[#FF4054] transition cursor-pointer"
          >
            Exit Admin
          </button>
        </div>
      </header>

      {/* ─── Toast Notice ────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-300"
              : "border-red-500/40 bg-red-950/90 text-red-300"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Main Admin Body ─────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Mobile Tab Selector */}
        <div className="flex sm:hidden items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${
              activeTab === "library" ? "bg-[#FF263D] text-white" : "bg-white/5 text-[#8F9298]"
            }`}
          >
            Library Slots
          </button>
          <button
            onClick={() => setActiveTab("developers")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${
              activeTab === "developers" ? "bg-[#FF263D] text-white" : "bg-white/5 text-[#8F9298]"
            }`}
          >
            Dev Studios
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1: LIBRARY MANAGER (SLOTS & TITLES)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "library" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Library Slots Manager</h2>
                <p className="text-xs text-[#8F9298]">
                  Manage the 2-4 games displayed for each category. Blank slots will display as clean empty placeholders on the public website.
                </p>
              </div>

              {/* Category Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setEditingSlot(null);
                    }}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#FF263D] text-white shadow-[0_0_15px_rgba(255,38,61,0.35)]"
                        : "border border-white/10 bg-white/5 text-[#8F9298] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categorySlots.map((slot) => {
                const isConfigured = !slot.isEmpty && slot.title.trim().length > 0;
                return (
                  <div
                    key={slot.id}
                    className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#07080A]/90 p-6 backdrop-blur-md transition hover:border-white/20"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: isConfigured ? slot.accentColor : "#8F9298" }}
                          />
                          <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                            {slot.category.toUpperCase()} • SLOT {slot.slotNumber}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                            isConfigured
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border border-white/10 bg-white/5 text-[#8F9298]"
                          }`}
                        >
                          {isConfigured ? "CONFIGURED" : "EMPTY SLOT"}
                        </span>
                      </div>

                      {/* Mini Preview Box */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#020405] mb-4">
                        {isConfigured && slot.coverImage ? (
                          <Image src={slot.coverImage} alt={slot.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-center p-4">
                            <span className="font-mono text-[11px] text-[#8F9298] uppercase">
                              Slot Available
                            </span>
                            <span className="text-[10px] text-[#606368]">No image configured</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {isConfigured ? slot.title : "(Empty Slot - No Title)"}
                      </h3>
                      <p className="text-xs text-[#8F9298] mt-0.5">
                        {isConfigured ? slot.tagline : "Will render as empty hardware cartridge slot"}
                      </p>
                      {isConfigured && (
                        <p className="text-xs text-[#8F9298] mt-2 line-clamp-2">{slot.description}</p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setEditingSlot({ ...slot })}
                        className="rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-4 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                      >
                        Edit This Slot
                      </button>

                      {isConfigured && (
                        <button
                          onClick={() => handleClearSlot(slot.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8F9298] hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
                        >
                          Clear to Empty
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slot Edit Modal */}
            {editingSlot && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
                <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-[#FF263D]/40 bg-[#07080A] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#FF4054]">
                        EDITING {editingSlot.category.toUpperCase()} • SLOT {editingSlot.slotNumber}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        Configure Game Metadata & Image
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingSlot(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveSlot} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Game Title (Leave empty for blank slot)
                        </label>
                        <input
                          type="text"
                          value={editingSlot.title}
                          onChange={(e) => setEditingSlot({ ...editingSlot, title: e.target.value })}
                          placeholder="e.g. Neon Haven"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={editingSlot.tagline}
                          onChange={(e) => setEditingSlot({ ...editingSlot, tagline: e.target.value })}
                          placeholder="e.g. Overdrive Protocol"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                        Cover Image Path or URL
                      </label>
                      <input
                        type="text"
                        value={editingSlot.coverImage}
                        onChange={(e) => setEditingSlot({ ...editingSlot, coverImage: e.target.value })}
                        placeholder="e.g. /images/neon_haven.jpg or https://..."
                        className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60"
                      />
                      <span className="text-[10px] text-[#8F9298] mt-1 block">
                        Tip: Available project images include: /images/neon_haven.jpg, /images/frostbound.jpg, /images/voidstrike.jpg, /images/nightfall_realms.jpg, /images/project_kaiju.jpg, /images/the_last_grove.jpg, /images/echoes_of_solara.jpg, /images/twin_ashes.jpg, /images/parallel_minds.jpg
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingSlot.description}
                        onChange={(e) => setEditingSlot({ ...editingSlot, description: e.target.value })}
                        placeholder="Game synopsis and player experience description..."
                        className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Status Badge
                        </label>
                        <input
                          type="text"
                          value={editingSlot.badge}
                          onChange={(e) => setEditingSlot({ ...editingSlot, badge: e.target.value })}
                          placeholder="e.g. FEATURED, PLAYTEST"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Readiness % ({editingSlot.progressPercent}%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingSlot.progressPercent}
                          onChange={(e) =>
                            setEditingSlot({ ...editingSlot, progressPercent: Number(e.target.value) || 0 })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Developer Studio
                        </label>
                        <input
                          type="text"
                          value={editingSlot.developer}
                          onChange={(e) => setEditingSlot({ ...editingSlot, developer: e.target.value })}
                          placeholder="e.g. Kuronex Studios"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1.5">
                        Accent Color Theme
                      </label>
                      <div className="flex items-center gap-2">
                        {COLOR_PRESETS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setEditingSlot({ ...editingSlot, accentColor: col })}
                            style={{ backgroundColor: col }}
                            className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                              editingSlot.accentColor === col ? "border-white scale-110" : "border-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingSlot(null)}
                        className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs text-[#8F9298] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isSaving ? "Saving Slot..." : "Save Changes"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2: DEVELOPER STUDIOS MANAGER
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "developers" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Partner Developer Studios</h2>
                <p className="text-xs text-[#8F9298]">
                  Manage the game development companies featured on the public website and in the continuous moving ticker strip.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingDev({
                    id: `dev-${Date.now().toString().slice(-4)}`,
                    name: "",
                    tagline: "",
                    icon: "Sparkles",
                    genre: "Action RPG",
                    headquarters: "Global",
                    description: "",
                    gamesCount: 1,
                    partnerTier: "Studio Partner",
                    website: "https://",
                    showInTicker: true,
                  })
                }
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Partner Studio</span>
              </button>
            </div>

            {/* Developers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developers.map((dev) => (
                <div
                  key={dev.id}
                  className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#07080A]/90 p-6 backdrop-blur-md transition hover:border-white/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-[#FF4054]">
                        {dev.partnerTier}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                          dev.showInTicker
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-[#8F9298] border border-white/10"
                        }`}
                      >
                        {dev.showInTicker ? "Ticker Active" : "Ticker Hidden"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{dev.name}</h3>
                    <p className="text-xs font-semibold text-[#8F9298] mt-0.5">{dev.tagline}</p>

                    <p className="mt-3 text-xs text-[#8F9298] line-clamp-3 leading-relaxed">
                      {dev.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#8F9298] flex items-center justify-between">
                      <span>HQ: {dev.headquarters}</span>
                      <span className="text-[#00E5FF]">{dev.genre}</span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setEditingDev({ ...dev })}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      Edit Studio
                    </button>

                    <button
                      onClick={() => handleDeleteDev(dev.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8F9298] hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Developer Edit Modal */}
            {editingDev && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
                <div className="relative w-full max-w-xl my-8 rounded-3xl border border-[#FF263D]/40 bg-[#07080A] p-6 sm:p-8 shadow-[0_0_60px_rgba(255,38,61,0.25)]">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">
                      {developers.some((d) => d.id === editingDev.id)
                        ? `Edit Studio: ${editingDev.name}`
                        : "Add New Partner Studio"}
                    </h3>
                    <button
                      onClick={() => setEditingDev(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8F9298] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveDev} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Studio / Company Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editingDev.name}
                          onChange={(e) => setEditingDev({ ...editingDev, name: e.target.value })}
                          placeholder="e.g. Aether Dynamics"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={editingDev.tagline}
                          onChange={(e) => setEditingDev({ ...editingDev, tagline: e.target.value })}
                          placeholder="e.g. Zero-G Physics Specialists"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Icon Motif
                        </label>
                        <select
                          value={editingDev.icon}
                          onChange={(e) => setEditingDev({ ...editingDev, icon: e.target.value })}
                          className="w-full rounded-2xl border border-white/10 bg-[#07080A] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60 cursor-pointer"
                        >
                          {ICON_OPTIONS.map((ico) => (
                            <option key={ico} value={ico}>
                              {ico}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Genre Focus
                        </label>
                        <input
                          type="text"
                          value={editingDev.genre}
                          onChange={(e) => setEditingDev({ ...editingDev, genre: e.target.value })}
                          placeholder="e.g. Space Simulation"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Headquarters
                        </label>
                        <input
                          type="text"
                          value={editingDev.headquarters}
                          onChange={(e) => setEditingDev({ ...editingDev, headquarters: e.target.value })}
                          placeholder="e.g. Tokyo, Japan"
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                        Studio Bio / Philosophy
                      </label>
                      <textarea
                        rows={3}
                        value={editingDev.description}
                        onChange={(e) => setEditingDev({ ...editingDev, description: e.target.value })}
                        placeholder="Brief studio description..."
                        className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#8F9298] outline-none focus:border-[#FF263D]/60 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Partner Tier
                        </label>
                        <select
                          value={editingDev.partnerTier}
                          onChange={(e) =>
                            setEditingDev({
                              ...editingDev,
                              partnerTier: e.target.value as "Premier Partner" | "Studio Partner" | "Indie Pioneer",
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#07080A] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60 cursor-pointer"
                        >
                          <option value="Premier Partner">Premier Partner</option>
                          <option value="Studio Partner">Studio Partner</option>
                          <option value="Indie Pioneer">Indie Pioneer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8F9298] uppercase mb-1">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={editingDev.website}
                          onChange={(e) => setEditingDev({ ...editingDev, website: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-2xl border border-white/10 bg-[rgba(15,20,28,0.7)] px-4 py-2.5 text-xs text-white outline-none focus:border-[#FF263D]/60"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingDev.showInTicker}
                          onChange={(e) => setEditingDev({ ...editingDev, showInTicker: e.target.checked })}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#FF263D] cursor-pointer"
                        />
                        <span className="text-xs text-[#F5F5F5]">
                          Display in continuous moving partner ticker strip
                        </span>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingDev(null)}
                        className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs text-[#8F9298] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isSaving ? "Saving..." : "Save Studio"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
