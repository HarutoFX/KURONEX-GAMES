import prisma from "@/lib/prisma";
import {
  recordDownloadEvent,
  getTotalDownloadCount,
  getPlatformDownloadStats,
  getGameDownloadStats,
} from "@/lib/download-store";
import { DbDownloadEvent } from "./types";

export const DownloadsRepository = {
  async recordDownload(params: {
    itemType: "client" | "game";
    itemId: string;
    platform: "windows" | "macos" | "linux" | "other";
    version?: string;
    userId?: string;
  }): Promise<DbDownloadEvent> {
    return recordDownloadEvent(params);
  },

  async getDownloadEvents(params?: {
    limit?: number;
    offset?: number;
    platform?: string;
    itemType?: string;
  }): Promise<{ events: DbDownloadEvent[]; total: number }> {
    const where = {
      ...(params?.platform ? { platform: params.platform } : {}),
      ...(params?.itemType ? { itemType: params.itemType } : {}),
    };
    const [total, rows] = await Promise.all([
      prisma.downloadEvent.count({ where }),
      prisma.downloadEvent.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: params?.offset || 0,
        take: params?.limit || 50,
      }),
    ]);

    return {
      total,
      events: rows.map((r) => ({
        id: r.id,
        itemType: r.itemType === "game" ? "game" : "client",
        itemId: r.itemId,
        platform:
          r.platform === "windows" || r.platform === "macos" || r.platform === "linux"
            ? r.platform
            : "other",
        version: r.version ?? undefined,
        userId: r.userId ?? undefined,
        ipHash: r.ipHash ?? undefined,
        timestamp: r.timestamp.toISOString(),
      })),
    };
  },

  async getTotalCount(): Promise<number> {
    return getTotalDownloadCount();
  },

  async getPlatformStats() {
    return getPlatformDownloadStats();
  },

  async getGameStats() {
    return getGameDownloadStats();
  },
};
