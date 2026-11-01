import path from "path";
import crypto from "crypto";
import { DbDownloadEvent } from "./types";
import { safeReadJsonSync, atomicWriteJsonSync } from "./atomic-store";

const DOWNLOADS_FILE = path.join(process.cwd(), "src", "data", "downloads.json");

function readDownloads(): DbDownloadEvent[] {
  const events = safeReadJsonSync<DbDownloadEvent[]>(DOWNLOADS_FILE, []);
  return Array.isArray(events)
    ? events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];
}

function writeDownloads(events: DbDownloadEvent[]): void {
  atomicWriteJsonSync(DOWNLOADS_FILE, events);
}

export const DownloadsRepository = {
  async recordDownload(params: {
    itemType: "client" | "game";
    itemId: string;
    platform: "windows" | "macos" | "linux" | "other";
    version?: string;
    userId?: string;
  }): Promise<DbDownloadEvent> {
    const events = readDownloads();
    const newEvent: DbDownloadEvent = {
      id: `dl_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      itemType: params.itemType,
      itemId: params.itemId,
      platform: params.platform,
      version: params.version || "1.0.0-preview",
      timestamp: new Date().toISOString(),
      userId: params.userId,
    };

    events.unshift(newEvent);
    // Keep max 5000 recent raw events to prevent unbounded JSON file bloating
    if (events.length > 5000) {
      events.length = 5000;
    }

    writeDownloads(events);
    return newEvent;
  },

  async getDownloadEvents(params?: {
    limit?: number;
    offset?: number;
    platform?: string;
    itemType?: string;
  }): Promise<{ events: DbDownloadEvent[]; total: number }> {
    let events = readDownloads();

    if (params?.platform) {
      events = events.filter((e) => e.platform === params.platform);
    }
    if (params?.itemType) {
      events = events.filter((e) => e.itemType === params.itemType);
    }

    const total = events.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;

    return {
      events: events.slice(offset, offset + limit),
      total,
    };
  },

  async getTotalCount(): Promise<number> {
    const events = readDownloads();
    return events.length;
  },

  async getPlatformStats(): Promise<{
    windows: number;
    macos: number;
    linux: number;
    other: number;
    total: number;
  }> {
    const events = readDownloads();
    const stats = {
      windows: 0,
      macos: 0,
      linux: 0,
      other: 0,
      total: events.length,
    };

    for (const e of events) {
      if (e.platform === "windows") stats.windows++;
      else if (e.platform === "macos") stats.macos++;
      else if (e.platform === "linux") stats.linux++;
      else stats.other++;
    }

    return stats;
  },

  async getGameStats(): Promise<Record<string, number>> {
    const events = readDownloads();
    const counts: Record<string, number> = {};

    for (const e of events) {
      if (e.itemType === "game") {
        counts[e.itemId] = (counts[e.itemId] || 0) + 1;
      }
    }

    return counts;
  },
};

