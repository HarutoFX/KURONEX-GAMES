"use client";

import React, { useState } from "react";
import { KeyRound, Database } from "lucide-react";
import { PlatformSettings } from "@/lib/admin-store";

interface SettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<void>;
  isSaving: boolean;
  onOpenProfileModal?: () => void;
  onOpenExportModal?: () => void;
}

export function SettingsTab({
  settings: initialSettings,
  onSaveSettings,
  isSaving,
  onOpenProfileModal,
  onOpenExportModal,
}: SettingsTabProps) {
  const [formSettings, setFormSettings] = useState<PlatformSettings>(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formSettings);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-6">
        <h4 className="text-sm font-bold text-white pb-3 border-b border-[#35151C]">
          Core Platform Runtime Parameters
        </h4>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={formSettings.platformName}
              onChange={(e) =>
                setFormSettings({ ...formSettings, platformName: e.target.value })
              }
              className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Brand Tagline
            </label>
            <input
              type="text"
              value={formSettings.tagline}
              onChange={(e) =>
                setFormSettings({ ...formSettings, tagline: e.target.value })
              }
              className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Support Contact Email
            </label>
            <input
              type="email"
              value={formSettings.supportEmail}
              onChange={(e) =>
                setFormSettings({ ...formSettings, supportEmail: e.target.value })
              }
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
              value={formSettings.sessionTimeoutDays || 30}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  sessionTimeoutDays: parseInt(e.target.value, 10) || 30,
                })
              }
              className="w-full rounded-xl border border-[#35151C] bg-[#1A0D10] p-2.5 text-xs text-white outline-none focus:border-[#FF263D]"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#35151C] bg-[#1A0D10]">
            <input
              type="checkbox"
              id="maint-mode"
              checked={formSettings.maintenanceMode}
              onChange={(e) =>
                setFormSettings({ ...formSettings, maintenanceMode: e.target.checked })
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
              checked={formSettings.registrationOpen}
              onChange={(e) =>
                setFormSettings({ ...formSettings, registrationOpen: e.target.checked })
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

      {/* Administrator Security & Credentials Migration */}
      <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#35151C]">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#FF263D]" />
              <span>Founder & Administrator Security Credentials</span>
            </h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Edit your personal administrative credentials or export verified scrypt hashes to the future backend database.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                <span>Export Backend Migration Seed</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-[#35151C] bg-[#1A0D10] space-y-1.5">
            <span className="text-white font-bold block">1. In-App Password & Profile Editing</span>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              Admins can change their Gamertag, email, or rotate their password at any time directly through the encrypted operator settings modal.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#35151C] bg-[#1A0D10] space-y-1.5">
            <span className="text-white font-bold block">2. Automated Production Database Transfer</span>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              When ready for public backend deployment, export the generated PostgreSQL SQL script or Prisma seed with 1-click. Zero password resets required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

