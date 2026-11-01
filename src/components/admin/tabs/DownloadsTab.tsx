"use client";

import React from "react";
import { PlatformSettings } from "@/lib/admin-store";

interface DownloadsTabProps {
  settings: PlatformSettings;
}

export function DownloadsTab({ settings }: DownloadsTabProps) {
  return (
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
  );
}

