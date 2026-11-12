"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Power, Trash2, Tag } from "lucide-react";

interface PromotionItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  promoType: string;
  gameId: string | null;
  targetUrl: string;
  code: string | null;
  claimsCount: number;
  maxClaims: number;
  isActive: boolean;
  createdAt: string;
}

export function PromotionsTab() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    promoType: "KEY_DROP",
    targetUrl: "/download",
    code: "",
    maxClaims: 100,
  });

  const loadPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promotions", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch promotions");
      }
      const data = await res.json();
      setPromotions(data.promotions || []);
      setWaitlistCount(typeof data.waitlistCount === "number" ? data.waitlistCount : 0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to load promotions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/promotions", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch promotions");
        }
        const data = await res.json();
        if (!ignore) {
          setPromotions(data.promotions || []);
          setWaitlistCount(typeof data.waitlistCount === "number" ? data.waitlistCount : 0);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : "Unable to load promotions");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create promotion");
      }
      setForm({ title: "", tagline: "", promoType: "KEY_DROP", targetUrl: "/download", code: "", maxClaims: 100 });
      setShowCreate(false);
      await loadPromotions();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create promotion");
    }
  };

  const handleToggle = async (id: string) => {
    await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id }),
    });
    await loadPromotions();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await loadPromotions();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
          <h4 className="text-sm font-bold text-white">Alpha Waitlist & Key Allocation</h4>
          <p className="text-xs text-[#A1A1AA]">
            Live count of verified alpha waitlist registrations eligible for drop campaigns.
          </p>
          <div className="pt-2">
            <span className="inline-block rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
              {waitlistCount} Waitlist Registrations • {promotions.filter((p) => p.isActive).length} Active Campaigns
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
          <h4 className="text-sm font-bold text-white">Seasonal Hero Spotlight</h4>
          <p className="text-xs text-[#A1A1AA]">
            KX-01 Neon Haven featured in the public storefront hero showcase.
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

      {errorMsg && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Active Platform Promotions</h4>
            <p className="text-xs text-[#A1A1AA]">Backed by SQLite/PostgreSQL Promotion records</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#FF4054] transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showCreate ? "Cancel" : "New Promotion"}</span>
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#35151C] bg-[#160B0E] p-4">
            <input
              type="text"
              required
              placeholder="Campaign title (e.g. Closed Alpha Wave 2)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-[#35151C] bg-[#110709] px-3 py-2 text-xs text-white outline-none focus:border-[#FF263D]"
            />
            <input
              type="text"
              placeholder="Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="rounded-lg border border-[#35151C] bg-[#110709] px-3 py-2 text-xs text-white outline-none focus:border-[#FF263D]"
            />
            <input
              type="text"
              placeholder="Promo / Access Code (optional)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="rounded-lg border border-[#35151C] bg-[#110709] px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#FF263D]"
            />
            <input
              type="number"
              min={0}
              placeholder="Max Claims"
              value={form.maxClaims}
              onChange={(e) => setForm({ ...form, maxClaims: Number(e.target.value) || 0 })}
              className="rounded-lg border border-[#35151C] bg-[#110709] px-3 py-2 text-xs text-white outline-none focus:border-[#FF263D]"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#00E5FF] px-4 py-2 text-xs font-extrabold text-black cursor-pointer"
              >
                Save Promotion
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-xs text-[#A1A1AA]">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div className="text-xs text-[#A1A1AA]">No promotions configured yet.</div>
        ) : (
          <div className="space-y-3">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#35151C] bg-[#1A0D10] p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-[#FF4054]" />
                    <span className="text-sm font-bold text-white">{promo.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                        promo.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                      }`}
                    >
                      {promo.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">
                    {promo.tagline || promo.description || promo.targetUrl} • Claims: {promo.claimsCount}
                    {promo.maxClaims > 0 ? ` / ${promo.maxClaims}` : ""}
                    {promo.code ? ` • Code: ${promo.code}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(promo.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#35151C] px-2.5 py-1.5 text-xs text-white hover:bg-white/5 cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{promo.isActive ? "Pause" : "Activate"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(promo.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
