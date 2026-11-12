import crypto from "crypto";
import prisma from "./prisma";

export interface DownloadEvent {
  id: string;
  itemType: "client" | "game";
  itemId: string; // e.g. "kuronex-desktop-launcher" or game.id
  platform: "windows" | "macos" | "linux" | "other";
  version: string;
  timestamp: string;
  userId?: string;
}

export interface PlatformDownloadStats {
  windows: number;
  macos: number;
  linux: number;
  other: number;
  total: number;
}

export async function getDownloadEvents(): Promise<DownloadEvent[]> {
  const rows = await prisma.downloadEvent.findMany({
    orderBy: { timestamp: "desc" },
    take: 5000,
  });

  return rows.map((r) => ({
    id: r.id,
    itemType: r.itemType === "game" ? "game" : "client",
    itemId: r.itemId,
    platform:
      r.platform === "windows" || r.platform === "macos" || r.platform === "linux"
        ? r.platform
        : "other",
    version: r.version || "1.0.0",
    timestamp: r.timestamp.toISOString(),
    userId: r.userId ?? undefined,
  }));
}

export async function recordDownloadEvent(params: {
  itemType: "client" | "game";
  itemId: string;
  platform: "windows" | "macos" | "linux" | "other";
  version?: string;
  userId?: string;
}): Promise<DownloadEvent> {
  const matchedGame =
    params.itemType === "game"
      ? await prisma.game.findUnique({ where: { id: params.itemId }, select: { id: true } })
      : null;

  const created = await prisma.downloadEvent.create({
    data: {
      id: `dl_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      itemType: params.itemType,
      itemId: params.itemId,
      gameId: matchedGame?.id ?? null,
      platform: params.platform,
      version: params.version || "1.0.0",
      userId: params.userId || null,
    },
  });

  return {
    id: created.id,
    itemType: created.itemType === "game" ? "game" : "client",
    itemId: created.itemId,
    platform:
      created.platform === "windows" ||
      created.platform === "macos" ||
      created.platform === "linux"
        ? created.platform
        : "other",
    version: created.version || "1.0.0",
    timestamp: created.timestamp.toISOString(),
    userId: created.userId ?? undefined,
  };
}

export async function getTotalDownloadCount(): Promise<number> {
  return prisma.downloadEvent.count();
}

export async function getPlatformDownloadStats(): Promise<PlatformDownloadStats> {
  const grouped = await prisma.downloadEvent.groupBy({
    by: ["platform"],
    _count: { platform: true },
  });

  const stats: PlatformDownloadStats = {
    windows: 0,
    macos: 0,
    linux: 0,
    other: 0,
    total: 0,
  };

  for (const row of grouped) {
    const count = row._count.platform;
    stats.total += count;
    if (row.platform === "windows") stats.windows += count;
    else if (row.platform === "macos") stats.macos += count;
    else if (row.platform === "linux") stats.linux += count;
    else stats.other += count;
  }

  return stats;
}

export async function getGameDownloadStats(): Promise<Record<string, number>> {
  const grouped = await prisma.downloadEvent.groupBy({
    by: ["itemId"],
    where: { itemType: "game" },
    _count: { itemId: true },
  });

  const counts: Record<string, number> = {};
  for (const row of grouped) {
    counts[row.itemId] = row._count.itemId;
  }
  return counts;
}
