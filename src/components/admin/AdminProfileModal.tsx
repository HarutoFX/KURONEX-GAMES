"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import type { SafeUser } from "@/lib/auth";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SafeUser | { id: string; username: string; email?: string; role?: string } | null;
  onProfileUpdated?: (updated: SafeUser) => void;
}

export function AdminProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: AdminProfileModalProps) {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New password confirmation does not match.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setErrorMsg("New administrator password must be at least 8 characters.");
      return;
    }

    if (newPassword && !currentPassword) {
      setErrorMsg("Please enter your current password to authorize a password change.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update administrator profile.");
      }

      setSuccessMsg("Administrator credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (onProfileUpdated && data.user) {
        onProfileUpdated(data.user);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#35151C] bg-[#110709] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#35151C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FF263D]/40 bg-[#FF263D]/10 text-[#FF263D]">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Administrator Credentials</h3>
              <p className="text-[11px] text-[#A1A1AA]">
                Manage your operator credentials, email, and cryptographic security key.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#A1A1AA] hover:bg-[#1A0D10] hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Admin Gamertag / Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#FF263D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#FF263D]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#35151C]">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-3">
              Change Administrator Password (Optional)
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Current Password (Required for password changes)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#FF263D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    New Password (8+ chars)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 px-3 text-xs text-white outline-none focus:border-[#FF263D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#35151C] bg-[#160B0E] py-2 px-3 text-xs text-white outline-none focus:border-[#FF263D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#35151C]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#35151C] bg-[#160B0E] px-4 py-2 text-xs font-bold text-[#A1A1AA] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF263D] hover:bg-[#FF4054] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#FF263D]/25 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isLoading ? "Saving..." : "Save Credentials"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
