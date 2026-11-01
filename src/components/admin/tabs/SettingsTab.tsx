"use client";

import React, { useState } from "react";
import { PlatformSettings } from "@/lib/admin-store";

interface SettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<void>;
  isSaving: boolean;
}

export function SettingsTab({
  settings: initialSettings,
  onSaveSettings,
  isSaving,
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
    </div>
  );
}

