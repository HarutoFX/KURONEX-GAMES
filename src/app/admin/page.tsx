"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { LibraryGameSlot, DeveloperPartner } from "@/lib/library-store";
import { GAMES_DATA } from "@/lib/games";
import { AuditLog, Announcement, PlatformSettings } from "@/lib/admin-store";
import { SafeUser } from "@/lib/auth";

import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

import { DashboardTab } from "@/components/admin/tabs/DashboardTab";
import { AnalyticsTab } from "@/components/admin/tabs/AnalyticsTab";
import { GamesTab } from "@/components/admin/tabs/GamesTab";
import { UsersTab } from "@/components/admin/tabs/UsersTab";
import { LibrariesTab } from "@/components/admin/tabs/LibrariesTab";
import { DownloadsTab } from "@/components/admin/tabs/DownloadsTab";
import { PromotionsTab } from "@/components/admin/tabs/PromotionsTab";
import { CmsTab } from "@/components/admin/tabs/CmsTab";
import { AnnouncementsTab } from "@/components/admin/tabs/AnnouncementsTab";
import { AuditTab } from "@/components/admin/tabs/AuditTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isAuthenticated = !isLoading && (user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin");

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
  const [metrics, setMetrics] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    totalDownloads: number;
    platformDownloads?: { windows: number; macos: number; linux: number; other: number; total: number };
    gameLibraryStats?: Record<string, number>;
  } | null>(null);

  // UI Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Action");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        if (sData.metrics) setMetrics(sData.metrics);
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
  const handleSaveSlot = async (slot: LibraryGameSlot) => {
    setIsSaving(true);
    try {
      const isNowEmpty = !slot.title.trim();
      const updatedSlot = {
        ...slot,
        isEmpty: isNowEmpty,
        badge: isNowEmpty ? "SLOT OPEN" : slot.badge || "FEATURED",
      };

      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: updatedSlot }),
      });

      if (!res.ok) throw new Error("Failed to save slot");

      setGames((prev) => prev.map((g) => (g.id === updatedSlot.id ? updatedSlot : g)));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: clearedSlot }),
      });

      if (!res.ok) throw new Error("Failed to clear slot");

      setGames((prev) => prev.map((g) => (g.id === clearedSlot.id ? clearedSlot : g)));
      showToast(`Slot ${slotId} reset to open.`);
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error clearing slot", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDev = async (developer: DeveloperPartner) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developer }),
      });

      if (!res.ok) throw new Error("Failed to save developer");

      setDevelopers((prev) => {
        const idx = prev.findIndex((d) => d.id === developer.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = developer;
          return updated;
        }
        return [...prev, developer];
      });

      showToast(`Studio ${developer.name} saved successfully!`);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developers: remaining }),
      });

      if (!res.ok) throw new Error("Failed to delete developer");

      setDevelopers(remaining);
      showToast("Studio removed from partner directory.");
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Error deleting studio", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  const handleCreateAnnouncement = async (newAnn: {
    title: string;
    message: string;
    priority: Announcement["priority"];
    category: Announcement["category"];
    isActive: boolean;
    author: string;
  }) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createAnnouncement", announcement: newAnn }),
      });

      if (!res.ok) throw new Error("Failed to create announcement");
      const data = await res.json();
      setAnnouncements(data.announcements);
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  const handleSaveSettings = async (newSettings: PlatformSettings) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSettings", settings: newSettings }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSettings(newSettings);
      showToast("Platform runtime configuration saved!");
    } catch (err) {
      console.error(err);
      showToast("Error saving platform configuration", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── AUTH / PERMISSION GATE ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF263D] border-t-transparent" />
          <span className="font-mono text-xs text-[#A1A1AA] tracking-widest uppercase">
            VERIFYING ROOT SESSION...
          </span>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#35151C] bg-[#130A0C] p-8 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF263D]">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              ADMINISTRATIVE ACCESS REQUIRED
            </h1>
            <p className="mt-2 text-xs text-[#A1A1AA] leading-relaxed">
              You must be authenticated with a verified Administrator role to view and modify platform data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#35151C] bg-[#1A0D10] py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back Home</span>
            </Link>
            <Link
              href="/login"
              className="flex-1 rounded-xl bg-[#FF263D] py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#FF4054] text-center"
            >
              Admin Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Filtered views based on global search
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
      d.genre?.toLowerCase().includes(globalSearch.toLowerCase()) ||
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
        };
      case "announcements":
        return {
          title: "Platform Broadcasts",
          subtitle: "Publish live announcements, patch notes, and scheduled maintenance notices.",
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
    <div className="min-h-screen bg-transparent text-[#FFFFFF] antialiased selection:bg-[#FF263D]/30 selection:text-white">
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
        onSelectTab={(tab) => setCurrentTab(tab)}
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
          />

          {/* Module Content */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6">
            {currentTab === "dashboard" && (
              <DashboardTab
                usersList={usersList}
                metrics={metrics}
                games={games}
                filteredLogs={filteredLogs}
                filteredCatalogGames={filteredCatalogGames}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === "analytics" && (
              <AnalyticsTab games={games} metrics={metrics} />
            )}

            {currentTab === "games" && (
              <GamesTab
                filteredCatalogGames={filteredCatalogGames}
                metrics={metrics}
                onEditSlot={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentTab("libraries");
                }}
              />
            )}

            {currentTab === "users" && (
              <UsersTab
                mode="users"
                filteredUsers={filteredUsers}
                currentUser={user}
                onUpdateRole={handleUpdateRole}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {currentTab === "libraries" && (
              <LibrariesTab
                games={games}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSaveSlot={handleSaveSlot}
                onClearSlot={handleClearSlot}
                isSaving={isSaving}
              />
            )}

            {currentTab === "downloads" && (
              <DownloadsTab settings={settings} />
            )}

            {currentTab === "promotions" && (
              <PromotionsTab />
            )}

            {currentTab === "cms" && (
              <CmsTab
                filteredDevelopers={filteredDevelopers}
                onSaveDeveloper={handleSaveDev}
                onDeleteDeveloper={handleDeleteDev}
                isSaving={isSaving}
              />
            )}

            {currentTab === "announcements" && (
              <AnnouncementsTab
                announcements={announcements}
                currentUser={user}
                onToggleAnnouncement={handleToggleAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onCreateAnnouncement={handleCreateAnnouncement}
                isSaving={isSaving}
              />
            )}

            {currentTab === "team" && (
              <UsersTab
                mode="team"
                filteredUsers={filteredUsers}
                currentUser={user}
                onUpdateRole={handleUpdateRole}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {currentTab === "roles" && (
              <UsersTab
                mode="roles"
                filteredUsers={filteredUsers}
                currentUser={user}
                onUpdateRole={handleUpdateRole}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {currentTab === "audit" && (
              <AuditTab filteredLogs={filteredLogs} />
            )}

            {currentTab === "settings" && (
              <SettingsTab
                settings={settings}
                onSaveSettings={handleSaveSettings}
                isSaving={isSaving}
              />
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
