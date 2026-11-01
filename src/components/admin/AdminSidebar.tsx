"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Gamepad2,
  Users,
  Bookmark,
  Download,
  Flame,
  FileText,
  Megaphone,
  UserCheck,
  Key,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "analytics"
  | "games"
  | "users"
  | "libraries"
  | "downloads"
  | "promotions"
  | "cms"
  | "announcements"
  | "team"
  | "roles"
  | "audit"
  | "settings";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "PLATFORM",
    items: [
      { id: "games", label: "Games", icon: Gamepad2 },
      { id: "users", label: "Users", icon: Users },
      { id: "libraries", label: "Libraries", icon: Bookmark },
      { id: "downloads", label: "Downloads", icon: Download },
    ],
  },
  {
    group: "CONTENT",
    items: [
      { id: "promotions", label: "Promotions", icon: Flame },
      { id: "cms", label: "CMS", icon: FileText },
      { id: "announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    group: "ADMINISTRATION",
    items: [
      { id: "team", label: "Team", icon: UserCheck },
      { id: "roles", label: "Roles & Permissions", icon: Key },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { id: "audit", label: "Audit Logs", icon: ScrollText },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  adminUsername: string;
  onLockSession: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  adminUsername,
  onLockSession,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-[#35151C] bg-[#100607] text-[#FFFFFF] transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="flex h-16 items-center justify-between border-b border-[#35151C] px-4">
            <Link
              href="/"
              className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${
                collapsed ? "justify-center w-full" : ""
              }`}
              title="KURONEX GAMES Admin"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#FF263D]/40 bg-[#1A0D10] shadow-[0_0_12px_rgba(255,38,61,0.2)]">
                <Shield className="h-4 w-4 text-[#FF263D]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF263D]" />
              </div>

              {!collapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-[0.18em] text-[#FFFFFF]">
                      KURONEX
                    </span>
                    <span className="rounded border border-[#FF263D]/30 bg-[#FF263D]/10 px-1 py-0.2 text-[8px] font-black text-[#FF263D]">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    Platform Core
                  </span>
                </div>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex h-6 w-6 items-center justify-center rounded-lg border border-[#35151C] bg-[#130A0C] text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="h-[calc(100vh-140px)] overflow-y-auto px-2.5 py-4 scrollbar-none">
            {NAV_GROUPS.map((group, gIdx) => (
              <div key={group.group} className={gIdx > 0 ? "mt-5" : ""}>
                {!collapsed ? (
                  <div className="px-3 pb-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-[#A1A1AA]/70">
                    {group.group}
                  </div>
                ) : (
                  <div className="my-2 border-t border-[#35151C]/60" />
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobile();
                        }}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                          collapsed ? "justify-center px-0 py-2.5" : ""
                        } ${
                          isActive
                            ? "bg-[#1A0D10] text-[#FFFFFF] border-l-2 border-[#FF263D] shadow-[inset_0_1px_0_rgba(255,38,61,0.15)]"
                            : "text-[#A1A1AA] hover:bg-[#130A0C] hover:text-[#FFFFFF]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#FF263D]"
                              : "text-[#A1A1AA] group-hover:text-[#FFFFFF]"
                          }`}
                        />

                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}

                        {!collapsed && item.badge && (
                          <span className="ml-auto rounded-full bg-[#FF263D]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#FF263D]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Administrator Profile Card */}
        <div className="border-t border-[#35151C] bg-[#100607] p-2.5">
          <div
            className={`flex items-center gap-2.5 rounded-xl border border-[#35151C] bg-[#130A0C] p-2 ${
              collapsed ? "justify-center p-2" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF263D]/15 text-xs font-bold text-[#FF263D] border border-[#FF263D]/30">
                {adminUsername.slice(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#100607]" />
              </div>

              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-[#FFFFFF] truncate">
                    {adminUsername}
                  </span>
                  <span className="text-[9px] font-mono text-[#FF263D] font-bold tracking-wider">
                    SUPER ADMIN
                  </span>
                </div>
              )}
            </div>

            {!collapsed ? (
              <button
                type="button"
                onClick={onLockSession}
                className="p-1.5 text-[#A1A1AA] hover:text-[#FF263D] transition-colors rounded-lg hover:bg-[#1A0D10] cursor-pointer"
                title="Lock Admin Session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              collapsed && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1 text-[#A1A1AA] hover:text-white"
                  title="Expand Sidebar"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
