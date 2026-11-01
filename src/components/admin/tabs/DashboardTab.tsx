"use client";

import React from "react";
import { Users, Activity, Gamepad2, Download } from "lucide-react";
import { SafeUser } from "@/lib/auth";
import { LibraryGameSlot } from "@/lib/library-store";
import { GAMES_DATA } from "@/lib/games";
import { AuditLog } from "@/lib/admin-store";
import { AdminTab } from "@/components/admin/AdminSidebar";
import { MetricCard } from "@/components/admin/MetricCard";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";
import { PlatformHealth } from "@/components/admin/PlatformHealth";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { TopGamesTable } from "@/components/admin/TopGamesTable";

interface DashboardTabProps {
  usersList: SafeUser[];
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    totalDownloads: number;
    platformDownloads?: { windows: number; macos: number; linux: number; other: number; total: number };
    gameLibraryStats?: Record<string, number>;
  } | null;
  games: LibraryGameSlot[];
  filteredLogs: AuditLog[];
  filteredCatalogGames: typeof GAMES_DATA;
  onNavigateTab: (tab: AdminTab) => void;
}

export function DashboardTab({
  usersList,
  metrics,
  games,
  filteredLogs,
  filteredCatalogGames,
  onNavigateTab,
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Players"
          value={usersList.length.toLocaleString()}
          icon={Users}
          caption="registered player accounts"
        />
        <MetricCard
          title="Active Sessions"
          value={metrics ? metrics.activeUsers : usersList.length > 0 ? 1 : 0}
          icon={Activity}
          caption="live authenticated connections"
        />
        <MetricCard
          title="Catalog Titles"
          value={GAMES_DATA.length + games.filter((g) => !g.isEmpty).length}
          icon={Gamepad2}
          caption="active catalogue releases"
        />
        <MetricCard
          title="Client Downloads"
          value={(metrics?.totalDownloads ?? 0).toLocaleString()}
          icon={Download}
          caption="direct client installations"
        />
      </div>

      {/* Main 2-Column Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activity Feed & Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <RecentActivity
            logs={filteredLogs}
            onViewAllLogs={() => onNavigateTab("audit")}
          />
          <PlatformHealth />
        </div>

        {/* Right Column: Platform Analytics & Top Titles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AnalyticsChart />
          <TopGamesTable
            games={filteredCatalogGames}
            gameStats={metrics?.gameLibraryStats || {}}
            onSelectGame={() => onNavigateTab("games")}
            onViewAll={() => onNavigateTab("games")}
          />
        </div>
      </div>
    </div>
  );
}
