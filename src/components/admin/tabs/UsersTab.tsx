"use client";

import React from "react";
import Link from "next/link";
import {
  Trash2,
  KeyRound,
  Database,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

export interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: string;
}

interface UsersTabProps {
  mode?: "users" | "team" | "roles";
  filteredUsers: AdminUserItem[];
  currentUser: { id: string; username: string; email?: string; role?: string } | null;
  onUpdateRole: (userId: string, newRole: string) => void;
  onDeleteUser: (userId: string) => void;
  onOpenProfileModal?: () => void;
  onOpenExportModal?: () => void;
}

export function UsersTab({
  mode = "users",
  filteredUsers,
  currentUser,
  onUpdateRole,
  onDeleteUser,
  onOpenProfileModal,
  onOpenExportModal,
}: UsersTabProps) {
  if (mode === "team") {
    const adminOperators = filteredUsers.filter(
      (u) =>
        u.role.toLowerCase() === "admin" ||
        u.role.toLowerCase() === "super_admin"
    );

    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#35151C] bg-[#130A0C]">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00E5FF]" />
              <span>Core Platform Administrators ({adminOperators.length})</span>
            </h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Verified founders and authorized operators with root-level management access.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenProfileModal && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#35151C] bg-[#1A0D10] hover:border-[#FF263D]/40 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#FF263D]" />
                <span>Edit My Credentials</span>
              </button>
            )}

            {onOpenExportModal && (
              <button
                type="button"
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#35151C] bg-[#1A0D10] hover:border-cyan-500/40 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-[#00E5FF]" />
                <span>Export Backend Seed</span>
              </button>
            )}

            <Link
              href="/admin/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00E5FF] hover:bg-[#38F5FF] px-3.5 py-2 text-xs font-extrabold text-black shadow-md shadow-[#00E5FF]/20 transition cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Provision Admin</span>
            </Link>
          </div>
        </div>

        {/* Administrative Operators Directory */}
        <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
          <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
            Active Administrative Accounts
          </h4>
          <div className="space-y-3">
            {adminOperators.map((admin) => {
              const isCurrent = admin.id === currentUser?.id || admin.username === currentUser?.username;
              return (
                <div
                  key={admin.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#35151C] bg-[#1A0D10]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF263D]/20 text-xs font-black text-[#FF263D] border border-[#FF263D]/30 shrink-0">
                      {admin.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{admin.username}</span>
                        {isCurrent && (
                          <span className="rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                        {admin.email} • Registered {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="rounded-md border border-[#FF263D]/40 bg-[#FF263D]/10 px-2.5 py-1 text-[10px] font-mono font-bold text-[#FF263D]">
                      {admin.role.toUpperCase()}
                    </span>

                    {isCurrent && onOpenProfileModal && (
                      <button
                        type="button"
                        onClick={onOpenProfileModal}
                        className="rounded-lg border border-[#35151C] bg-[#160B0E] px-2.5 py-1 text-xs text-white hover:border-[#FF263D] transition cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "roles") {
    return (
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
    );
  }

  return (
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
                    value={u.role.toLowerCase()}
                    disabled={u.id === "kuro_dev_admin_root" || u.id === currentUser?.id}
                    onChange={(e) => onUpdateRole(u.id, e.target.value)}
                    className={`rounded-lg border border-[#35151C] bg-[#1A0D10] px-2 py-1 text-xs font-mono font-bold outline-none cursor-pointer ${
                      u.role === "admin" || u.role === "super_admin"
                        ? "text-[#FF263D] border-[#FF263D]/40"
                        : u.role === "developer"
                        ? "text-[#00E5FF] border-[#00E5FF]/40"
                        : u.role === "moderator"
                        ? "text-amber-400 border-amber-400/40"
                        : "text-[#A1A1AA]"
                    } disabled:opacity-50`}
                  >
                    <option value="player">player</option>
                    <option value="developer">developer</option>
                    <option value="analyst">analyst</option>
                    <option value="content_manager">content_manager</option>
                    <option value="game_manager">game_manager</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  {u.id === "kuro_dev_admin_root" ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Root Secured
                    </span>
                  ) : u.id === currentUser?.id ? (
                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
                      Active User
                    </span>
                  ) : (
                    <button
                      onClick={() => onDeleteUser(u.id)}
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
  );
}
