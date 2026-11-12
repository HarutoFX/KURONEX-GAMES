"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { PlatformSettings } from "@/lib/admin-store";

interface DownloadsTabProps {
  settings: PlatformSettings;
}

interface DownloadBuildItem {
  id: string;
  itemType: string;
  itemId: string;
  platform: string;
  version: string;
  downloadUrl: string;
  isPublic: boolean;
  releasedAt: string;
}

interface WaitlistSummary {
  total: number;
  byPlatform: Record<string, number>;
}

export function DownloadsTab({ settings }: DownloadsTabProps) {
  const [builds, setBuilds] = useState<DownloadBuildItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistSummary>({
    total: 0,
    byPlatform: { windows: 0, macos: 0, linux: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/builds", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds || []);
        if (data.waitlistSummary) {
          setWaitlist(data.waitlistSummary);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
            <div className="text-xs text-[#A1A1AA]">Alpha Waitlist</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
              {waitlist.total} TOTAL ({waitlist.byPlatform.windows || 0} WIN / {waitlist.byPlatform.macos || 0} MAC / {waitlist.byPlatform.linux || 0} LINUX)
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#35151C] bg-[#130A0C] p-6 space-y-3">
        <h4 className="text-sm font-bold text-white">Published Installer Manifests</h4>
        {isLoading ? (
          <p className="text-xs text-[#A1A1AA]">Loading manifests...</p>
        ) : builds.length === 0 ? (
          <p className="text-xs text-[#A1A1AA]">No installer manifests recorded.</p>
        ) : (
          <div className="space-y-2.5">
            {builds.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#35151C] bg-[#1A0D10] px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold uppercase text-[#00E5FF]">{b.platform}</span>
                  <span className="font-bold text-white">{b.itemId}</span>
                  <span className="font-mono text-[#FF4054]">{b.version}</span>
                </div>
                <span className="font-mono text-[#A1A1AA]">{b.downloadUrl}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
