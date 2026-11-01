"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Users,
  Download,
  Activity,
  ExternalLink,
  ArrowLeft,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { LibraryGameSlot, DeveloperPartner } from "@/lib/library-store";
import { GAMES_DATA } from "@/lib/games";
import { AuditLog, Announcement, PlatformSettings } from "@/lib/admin-store";
import { SafeUser } from "@/lib/auth";

import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { PlatformHealth } from "@/components/admin/PlatformHealth";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { TopGamesTable } from "@/components/admin/TopGamesTable";

const CATEGORIES = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isAuthenticated = !isLoading && user?.role === "admin";

  // Navigation & Layout
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Data Stores
  const [games, setGames] = useState<LibraryGameSlot[]>([]);
  const [developers, setDevelopers] = useState<DeveloperPartner[]>([]);
  const [usersList, setUsersList] = useState<SafeUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: "KURONEX GAMES",
    tagline: "Build Your Own Library.",
    maintenanceMode: false,
    registrationOpen: true,
    clientVersion: "v1.4.2",
    clientDownloadUrl: "/download",
    supportEmail: "support@kuronex.com",
    sessionTimeoutDays: 30,
    maxUploadSizeMb: 120,
    featuredCategory: "Action",
  });

  // UI Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals & Editing States
  const [editingSlot, setEditingSlot] = useState<LibraryGameSlot | null>(null);
  const [editingDev, setEditingDev] = useState<DeveloperPartner | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Action");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    priority: "NORMAL" as Announcement["priority"],
    category: "UPDATE" as Announcement["category"],
    isActive: true,
    author: user?.username || "admin",
  });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Sync tab with URL query parameters on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        queueMicrotask(() => {
          if (tabParam === "library") setCurrentTab("libraries");
          else if (tabParam === "developers") setCurrentTab("cms");
          else setCurrentTab(tabParam as AdminTab);
        });
      }
      const catParam = params.get("category");
      if (catParam) {
        queueMicrotask(() => {
          setSelectedCategory(catParam);
        });
      }
    }
  }, []);

  // Fetch all live data when authenticated
  const loadAllData = useCallback(async () => {
    try {
      const [gRes, dRes, uRes, sRes] = await Promise.all([
        fetch("/api/admin/games"),
        fetch("/api/admin/developers"),
        fetch("/api/admin/users"),
        fetch("/api/admin/system"),
      ]);

      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.games) setGames(gData.games);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        if (dData.developers) setDevelopers(dData.developers);
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.users) setUsersList(uData.users);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.logs) setAuditLogs(sData.logs);
        if (sData.announcements) setAnnouncements(sData.announcements);
        if (sData.settings) setSettings(sData.settings);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => {
        void loadAllData();
      });
    }
  }, [isAuthenticated, loadAllData]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      showToast("Error during sign out", "error");
    }
  };

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────
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
        },
        body: JSON.stringify({ slot: updatedSlot }),
      });

      if (!res.ok) throw new Error("Failed to save slot");

      setGames((prev) => prev.map((g) => (g.id === updatedSlot.id ? updatedSlot : g)));
      setEditingSlot(null);
      showToast(`Slot ${updatedSlot.id} (${updatedSlot.title || "Empty"}) saved!`);
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error saving game slot", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSlot = async (slotId: string) => {
    if (!confirm(`Are you sure you want to clear slot ${slotId}?`)) return;

    const clearedSlot: LibraryGameSlot = {
      id: slotId,
      category: selectedCategory,
      slotNumber: parseInt(slotId.split("-")[1] || "1", 10),
      title: "",
      tagline: "",
      description: "",
      coverImage: "",
      badge: "SLOT OPEN",
      accentColor: "#FF263D",
      progressPercent: 0,
      developer: "",
      isEmpty: true,
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slot: clearedSlot }),
      });

      if (!res.ok) throw new Error("Failed to clear slot");

      setGames((prev) => prev.map((g) => (g.id === clearedSlot.id ? clearedSlot : g)));
      if (editingSlot?.id === slotId) setEditingSlot(null);
      showToast(`Slot ${slotId} reset to open.`);
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error clearing slot", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error saving studio", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDev = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner studio?")) return;

    setIsSaving(true);
    try {
      const remaining = developers.filter((d) => d.id !== id);
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ developers: remaining }),
      });

      if (!res.ok) throw new Error("Failed to delete developer");

      setDevelopers(remaining);
      if (editingDev?.id === id) setEditingDev(null);
      showToast("Studio removed from partner directory.");
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error deleting studio", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "player" | "developer" | "admin") => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "updateRole", userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setUsersList(data.users);
      showToast(`User role updated to ${newRole}`);
      loadAllData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error updating role";
      showToast(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteUser", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsersList(data.users);
      showToast("User account deleted.");
      loadAllData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error deleting user";
      showToast(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "createAnnouncement", announcement: newAnnouncement }),
      });

      if (!res.ok) throw new Error("Failed to create announcement");
      const data = await res.json();
      setAnnouncements(data.announcements);
      setShowAnnouncementModal(false);
      setNewAnnouncement({
        title: "",
        message: "",
        priority: "NORMAL",
        category: "UPDATE",
        isActive: true,
        author: user?.username || "kuronex_dev",
      });
      showToast("Announcement broadcasted successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error creating announcement", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAnnouncement = async (id: string) => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "toggleAnnouncement", id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
        showToast("Announcement status updated.");
      }
    } catch {
      showToast("Error toggling announcement", "error");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement?")) return;
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteAnnouncement", id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
        showToast("Announcement removed.");
      }
    } catch {
      showToast("Error removing announcement", "error");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "updateSettings", settings }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data = await res.json();
      setSettings(data.settings);
      showToast("Platform configuration saved successfully!");
    } catch {
      showToast("Error saving platform settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── GATE: SESSION LOADING ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-16 bg-[#080808] text-[#FFFFFF] antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF263D] border-t-transparent shadow-[0_0_20px_rgba(255,38,61,0.35)]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
            Verifying Administrator Credentials...
          </p>
        </div>
      </main>
    );
  }

  // ─── GATE: UN-AUTHORIZED ACCESS RESTRICTED ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-16 bg-[#080808] text-[#FFFFFF] antialiased">
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#35151C] bg-[#100607] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#1A0D10] text-[#FF263D] mb-4 shadow-[0_0_24px_rgba(255,38,61,0.25)]">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              ADMINISTRATOR RESTRICTED
            </h1>
            <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
              This terminal is strictly restricted to verified platform administrators.
            </p>
            {user ? (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-left">
                <div className="text-[11px] font-mono font-semibold text-amber-400">
                  Active Session: @{user.username}
                </div>
                <div className="text-[10px] text-amber-200/80 mt-0.5">
                  Role: <span className="font-mono uppercase font-bold">{user.role}</span> (Insufficient Permissions)
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-[#A1A1AA]/80">
                No active session detected. Please authenticate with administrator credentials.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href="/login?redirect=/admin"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] active:bg-[#D91B30] py-3 text-xs font-bold text-white shadow-[0_4px_20px_rgba(255,38,61,0.35)] transition-all cursor-pointer"
            >
              Sign In as Administrator
            </Link>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#35151C] bg-[#130A0C] hover:bg-[#1A0D10] py-2.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Platform</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Filtered views based on global search
  const filteredGames = games.filter(
    (g) =>
      g.category.toLowerCase() === selectedCategory.toLowerCase() &&
      (!globalSearch ||
        g.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        g.developer.toLowerCase().includes(globalSearch.toLowerCase()) ||
        g.id.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  const filteredCatalogGames = GAMES_DATA.filter(
    (g) =>
      !globalSearch ||
      g.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      g.developer.toLowerCase().includes(globalSearch.toLowerCase()) ||
      g.genre.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter(
    (u) =>
      !globalSearch ||
      u.username.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredDevelopers = developers.filter(
    (d) =>
      !globalSearch ||
      d.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.genre.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.partnerTier.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (l) =>
      !globalSearch ||
      l.action.toLowerCase().includes(globalSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(globalSearch.toLowerCase()) ||
      l.actor.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // Computed Section Headers
  const getTabHeader = () => {
    switch (currentTab) {
      case "dashboard":
        return {
          title: "Platform Overview",
          subtitle: "Real-time metrics, platform inventory, and ecosystem health.",
          action: (
            <button
              onClick={() => setCurrentTab("libraries")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#FF4054] transition shadow-[0_2px_12px_rgba(255,38,61,0.3)] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Configure Slots</span>
            </button>
          ),
        };
      case "analytics":
        return {
          title: "Analytics & Telemetry",
          subtitle: "Player engagement metrics, category performance, and hardware distributions.",
        };
      case "games":
        return {
          title: "Game Catalog Manager",
          subtitle: "Inspect game registries, tags, pricing, and live deployment statuses.",
        };
      case "users":
        return {
          title: "User Account Administration",
          subtitle: "Manage registered players, developer credentials, and administrative role assignments.",
        };
      case "libraries":
        return {
          title: "Library Cartridge Slots",
          subtitle: "Configure curated cartridge slots, accent colors, and showcase slots for player vaults.",
          action: (
            <button
              onClick={() => {
                const empty = games.find((g) => g.isEmpty && g.category === selectedCategory);
                if (empty) setEditingSlot(empty);
                else showToast("All slots filled in this category.", "error");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#FF4054] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Open Slot</span>
            </button>
          ),
        };
      case "downloads":
        return {
          title: "Desktop Client Releases",
          subtitle: "Manage client binary distribution, checksums, and update manifests.",
        };
      case "promotions":
        return {
          title: "Promotions & Playtests",
          subtitle: "Control featured platform banners, seasonal sales, and alpha access key allocations.",
        };
      case "cms":
        return {
          title: "Partner Studios & CMS",
          subtitle: "Manage official game studio profiles, partnership tiers, and ticker inclusion.",
          action: (
            <button
              onClick={() =>
                setEditingDev({
                  id: `dev_${Date.now()}`,
                  name: "",
                  tagline: "",
                  icon: "Sparkles",
                  genre: "Action / Sci-Fi",
                  headquarters: "Tokyo, Japan",
                  description: "",
                  gamesCount: 1,
                  partnerTier: "Studio Partner",
                  website: "https://",
                  showInTicker: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#FF4054] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Partner Studio</span>
            </button>
          ),
        };
      case "announcements":
        return {
          title: "Platform Broadcasts",
          subtitle: "Publish live announcements, patch notes, and scheduled maintenance notices.",
          action: (
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#FF4054] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Announcement</span>
            </button>
          ),
        };
      case "team":
        return {
          title: "Platform Operations Team",
          subtitle: "Authorized curators and platform engineers with administrative credentials.",
        };
      case "roles":
        return {
          title: "Roles & Permissions Matrix",
          subtitle: "Fine-grained capability scopes for Players, Developers, Curators, and Super Admins.",
        };
      case "audit":
        return {
          title: "Security Audit Logs",
          subtitle: "Tamper-evident record of all platform modifications, role updates, and catalog changes.",
        };
      case "settings":
        return {
          title: "Platform Configuration",
          subtitle: "Global runtime flags, maintenance mode, client URLs, and session security.",
        };
      default:
        return {
          title: "Admin Console",
          subtitle: "Platform management module.",
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="min-h-screen bg-[#080808] text-[#FFFFFF] antialiased selection:bg-[#FF263D]/30 selection:text-white">
      {/* Toast Alert Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-[#130A0C] text-emerald-400"
              : "border-[#FF263D]/40 bg-[#130A0C] text-[#FF4054]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#FF263D]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Shared Navigation Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setEditingSlot(null);
          setEditingDev(null);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        adminUsername={user?.username || "Admin"}
        onLockSession={handleSignOut}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col justify-between ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <div>
          {/* Header */}
          <AdminHeader
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            announcements={announcements}
            onOpenMobile={() => setMobileOpen(true)}
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            primaryAction={headerInfo.action}
          />

          {/* Module Content */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ─── 1. OVERVIEW DASHBOARD ────────────────────────────────────── */}
            {currentTab === "dashboard" && (
              <div className="space-y-6">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Registered Players"
                    value={usersList.length.toLocaleString()}
                    icon={Users}
                    change="+18.4%"
                    changeType="positive"
                    caption="vs previous 30d"
                    sparklineData={[3, 5, 4, 8, 9, 12, usersList.length]}
                  />
                  <MetricCard
                    title="Active Sessions"
                    value={Math.max(usersList.filter((u) => u.role === "admin").length, 1)}
                    icon={Activity}
                    change="+12.0%"
                    changeType="positive"
                    caption="live connections"
                    sparklineData={[1, 1, 2, 2, 3, 2, 4]}
                  />
                  <MetricCard
                    title="Catalog Titles"
                    value={GAMES_DATA.length + games.filter((g) => !g.isEmpty).length}
                    icon={Gamepad2}
                    change="+4 titles"
                    changeType="positive"
                    caption="active production builds"
                    sparklineData={[4, 5, 5, 6, 7, 8, 9]}
                  />
                  <MetricCard
                    title="Client Downloads"
                    value={(1420 + usersList.length * 12).toLocaleString()}
                    icon={Download}
                    change="+24.6%"
                    changeType="positive"
                    caption="direct client installations"
                    sparklineData={[800, 920, 1050, 1200, 1340, 1420]}
                  />
                </div>

                {/* Main 2-Column Dashboard Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Recent Activity Feed & Audit (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <RecentActivity
                      logs={filteredLogs}
                      onViewAllLogs={() => setCurrentTab("audit")}
                    />
                    <PlatformHealth />
                  </div>

                  {/* Right Column: Platform Analytics & Top Titles (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <AnalyticsChart />
                    <TopGamesTable
                      games={filteredCatalogGames}
                      onSelectGame={() => {
                        setCurrentTab("games");
                      }}
                      onViewAll={() => setCurrentTab("games")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── 2. ANALYTICS DEEP DIVE ────────────────────────────────────── */}
            {currentTab === "analytics" && (
              <div className="space-y-6">
                <AnalyticsChart />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
                    <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
                      Category Distribution
                    </h4>
                    <div className="space-y-3">
                      {CATEGORIES.map((cat, idx) => {
                        const count = games.filter((g) => g.category === cat && !g.isEmpty).length + (idx === 0 ? 3 : 1);
                        const pct = Math.min(Math.round((count / 12) * 100), 100);
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-white">{cat}</span>
                              <span className="text-[#A1A1AA] font-mono">{count} games ({pct}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#1A0D10] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#FF263D] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
                    <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
                      Operating System Share
                    </h4>
                    <div className="space-y-3">
                      {[
                        { os: "Windows (x64 / ARM64)", pct: 68 },
                        { os: "Linux (Proton / Native)", pct: 19 },
                        { os: "macOS (Apple Silicon)", pct: 13 },
                      ].map((item) => (
                        <div key={item.os} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white">{item.os}</span>
                            <span className="text-[#A1A1AA] font-mono">{item.pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1A0D10] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-5">
                    <h4 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase mb-4">
                      Cloud Sync Health
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                        <span className="text-[#A1A1AA]">Sync Success Rate</span>
                        <span className="font-mono font-bold text-emerald-400">99.98%</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                        <span className="text-[#A1A1AA]">Average Save Size</span>
                        <span className="font-mono font-bold text-white">4.2 MB</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                        <span className="text-[#A1A1AA]">Cloud Replication Lag</span>
                        <span className="font-mono font-bold text-[#FF263D]">&lt; 85 ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 3. GAME CATALOG MANAGEMENT ─────────────────────────────────── */}
            {currentTab === "games" && (
              <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Genre / Category</th>
                        <th className="py-3 px-4">Developer</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Active Players</th>
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
                          <td className="py-3 px-4 font-semibold">
                            {game.title}
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">
                            {game.genre} ({game.category})
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">
                            {game.developer}
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-400">
                            ★ {game.rating}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {game.playerCount}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-md border border-[#35151C] bg-[#1A0D10] px-2 py-0.5 text-[10px] font-mono">
                              {game.phase}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setCurrentTab("libraries");
                                setSelectedCategory(game.category);
                              }}
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
            )}

            {/* ─── 4. USER MANAGEMENT ─────────────────────────────────────────── */}
            {currentTab === "users" && (
              <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
                        <th className="py-3 px-4">Player ID</th>
                        <th className="py-3 px-4">Gamertag</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#35151C]/60 text-white">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-[#A1A1AA]">
                            {u.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {u.username}
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">
                            {u.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#A1A1AA]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              disabled={u.id === "kuro_dev_admin_root" || u.id === user?.id}
                              onChange={(e) =>
                                handleUpdateRole(u.id, e.target.value as "player" | "developer" | "admin")
                              }
                              className={`rounded-lg border border-[#35151C] bg-[#1A0D10] px-2 py-1 text-xs font-mono font-bold outline-none cursor-pointer ${
                                u.role === "admin"
                                  ? "text-[#FF263D] border-[#FF263D]/40"
                                  : u.role === "developer"
                                  ? "text-[#00E5FF] border-[#00E5FF]/40"
                                  : "text-[#A1A1AA]"
                              } disabled:opacity-50`}
                            >
                              <option value="player">player</option>
                              <option value="developer">developer</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.id === "kuro_dev_admin_root" ? (
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                                Root Secured
                              </span>
                            ) : u.id === user?.id ? (
                              <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
                                Active User
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── 5. LIBRARY CARTRIDGE SLOTS (PRESERVED) ─────────────────────── */}
            {currentTab === "libraries" && (
              <div className="space-y-6">
                {/* Category Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
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
                            onClick={() => handleClearSlot(slot.id)}
                            className="text-xs text-[#A1A1AA] hover:text-[#FF263D] transition cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Form Modal/Drawer */}
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

                    <form onSubmit={handleSaveSlot} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            )}

            {/* ─── 6. DOWNLOADS & CLIENT RELEASES ─────────────────────────────── */}
            {currentTab === "downloads" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">
                    Current Public Desktop Client
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <div className="text-xs text-[#A1A1AA]">Client Version</div>
                      <div className="text-lg font-bold text-white mt-1">
                        {settings.clientVersion}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <div className="text-xs text-[#A1A1AA]">Installer Route</div>
                      <div className="text-xs font-mono text-[#FF263D] mt-2 truncate">
                        {settings.clientDownloadUrl}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <div className="text-xs text-[#A1A1AA]">Status</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                        LIVE DISTRIBUTION
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 7. PROMOTIONS ──────────────────────────────────────────────── */}
            {currentTab === "promotions" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">Alpha Playtest Key Allocation</h4>
                    <p className="text-xs text-[#A1A1AA]">
                      Control automated key distribution drops for waitlist players.
                    </p>
                    <div className="pt-2">
                      <span className="inline-block rounded-md border border-[#FF263D]/40 bg-[#FF263D]/10 px-3 py-1 text-xs font-mono font-bold text-[#FF4054]">
                        2,500 / 5,000 Keys Claimed
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
                    <h4 className="text-sm font-bold text-white">Seasonal Hero Spotlight</h4>
                    <p className="text-xs text-[#A1A1AA]">
                      KX-01 Neon Haven currently featured as primary platform header.
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
              </div>
            )}

            {/* ─── 8. CMS: PARTNER STUDIOS (PRESERVED) ────────────────────────── */}
            {currentTab === "cms" && (
              <div className="space-y-6">
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
                              onClick={() => handleDeleteDev(dev.id)}
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

                    <form onSubmit={handleSaveDev} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            )}

            {/* ─── 9. ANNOUNCEMENTS ───────────────────────────────────────────── */}
            {currentTab === "announcements" && (
              <div className="space-y-6">
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
                              onClick={() => handleToggleAnnouncement(ann.id)}
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
                              onClick={() => handleDeleteAnnouncement(ann.id)}
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
                {showAnnouncementModal && (
                  <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#35151C]">
                      <h4 className="text-sm font-bold text-white">Broadcast New Announcement</h4>
                      <button
                        onClick={() => setShowAnnouncementModal(false)}
                        className="text-[#A1A1AA] hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
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
                          onClick={() => setShowAnnouncementModal(false)}
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
            )}

            {/* ─── 10. TEAM MANAGEMENT ───────────────────────────────────────── */}
            {currentTab === "team" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">
                    Authorized Administrative Operators
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF263D]/20 text-xs font-bold text-[#FF263D]">
                          KD
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">kuronex_dev (You)</div>
                          <div className="text-[10px] text-[#A1A1AA]">
                            dev.admin@kuronex.internal • Root Key Holder
                          </div>
                        </div>
                      </div>
                      <span className="rounded-md border border-[#FF263D]/40 bg-[#FF263D]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#FF263D]">
                        SUPER ADMIN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 11. ROLES & PERMISSIONS MATRIX ────────────────────────────── */}
            {currentTab === "roles" && (
              <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
                        <th className="py-3 px-4">Permission Scope</th>
                        <th className="py-3 px-4 text-center">Player</th>
                        <th className="py-3 px-4 text-center">Developer</th>
                        <th className="py-3 px-4 text-center">Curator</th>
                        <th className="py-3 px-4 text-center">Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#35151C]/60 text-white">
                      {[
                        { scope: "Browse Catalog & Save Games", player: true, dev: true, curator: true, admin: true },
                        { scope: "Submit Playtest Feedback", player: true, dev: true, curator: true, admin: true },
                        { scope: "Publish Games to Developer Registry", player: false, dev: true, curator: true, admin: true },
                        { scope: "Configure 3D Cartridge Slots", player: false, dev: false, curator: true, admin: true },
                        { scope: "Broadcast Announcements", player: false, dev: false, curator: true, admin: true },
                        { scope: "Manage User Roles & Delete Accounts", player: false, dev: false, curator: false, admin: true },
                        { scope: "Modify Platform Architecture & Core Config", player: false, dev: false, curator: false, admin: true },
                      ].map((perm, idx) => (
                        <tr key={idx} className="hover:bg-[#1A0D10]/60">
                          <td className="py-3 px-4 font-semibold text-white">{perm.scope}</td>
                          <td className="py-3 px-4 text-center">{perm.player ? "✓" : "—"}</td>
                          <td className="py-3 px-4 text-center">{perm.dev ? "✓" : "—"}</td>
                          <td className="py-3 px-4 text-center">{perm.curator ? "✓" : "—"}</td>
                          <td className="py-3 px-4 text-center font-bold text-[#FF263D]">{perm.admin ? "✓" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── 12. AUDIT LOGS ─────────────────────────────────────────────── */}
            {currentTab === "audit" && (
              <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
                        <th className="py-3 px-4">Event ID</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Target</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#35151C]/60 text-white">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-[#A1A1AA]">
                            {log.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-[#FF263D]">
                            {log.category}
                          </td>
                          <td className="py-3 px-4 font-mono text-white">
                            @{log.actor}
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA]">
                            {log.target}
                          </td>
                          <td className="py-3 px-4 text-[#A1A1AA] max-w-sm truncate">
                            {log.details}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[10px] text-[#A1A1AA]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── 13. PLATFORM SETTINGS ──────────────────────────────────────── */}
            {currentTab === "settings" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-6">
                  <h4 className="text-sm font-bold text-white pb-3 border-b border-[#35151C]">
                    Core Platform Runtime Parameters
                  </h4>

                  <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                        Brand Tagline
                      </label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                        Support Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                        Session Timeout (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={settings.sessionTimeoutDays || 30}
                        onChange={(e) => setSettings({ ...settings, sessionTimeoutDays: parseInt(e.target.value, 10) || 30 })}
                        className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <input
                        type="checkbox"
                        id="maint-mode"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          setSettings({ ...settings, maintenanceMode: e.target.checked })
                        }
                        className="h-4 w-4 rounded accent-[#FF263D] cursor-pointer"
                      />
                      <label htmlFor="maint-mode" className="text-xs text-white cursor-pointer select-none">
                        Maintenance Mode (Lock non-admin access)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#35151C] bg-[#1A0D10]">
                      <input
                        type="checkbox"
                        id="reg-open"
                        checked={settings.registrationOpen}
                        onChange={(e) =>
                          setSettings({ ...settings, registrationOpen: e.target.checked })
                        }
                        className="h-4 w-4 rounded accent-[#FF263D] cursor-pointer"
                      />
                      <label htmlFor="reg-open" className="text-xs text-white cursor-pointer select-none">
                        Open Player Registration
                      </label>
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-3 border-t border-[#35151C]">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-6 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                      >
                        {isSaving ? "Saving..." : "Save Configuration"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Global Footer */}
        <footer className="border-t border-[#35151C] bg-[#100607] py-4 px-6 text-center sm:text-left text-xs text-[#A1A1AA] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 KURONEX GAMES Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>SECURE ROOT SESSION</span>
            <span>•</span>
            <span className="text-[#FF263D]">{settings.clientVersion}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
