"use client";

import React from "react";
import { Trash2 } from "lucide-react";

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
}

export function UsersTab({
  mode = "users",
  filteredUsers,
  currentUser,
  onUpdateRole,
  onDeleteUser,
}: UsersTabProps) {
  if (mode === "team") {
    return (
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
                  <div className="text-xs font-bold text-white">
                    {currentUser?.username || "admin"} (You)
                  </div>
                  <div className="text-[10px] text-[#A1A1AA]">
                    {currentUser?.email || "admin@kuronex.internal"} • Root Key Holder
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
