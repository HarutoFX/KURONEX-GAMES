import fs from "fs";
import path from "path";

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

const DOWNLOADS_FILE = path.join(process.cwd(), "src", "data", "downloads.json");

function ensureFile(filePath: string, defaultContent: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf-8");
  }
}

export function getDownloadEvents(): DownloadEvent[] {
  try {
    ensureFile(DOWNLOADS_FILE, "[]");
    const data = fs.readFileSync(DOWNLOADS_FILE, "utf-8");
    const events: DownloadEvent[] = JSON.parse(data || "[]");
    return Array.isArray(events)
      ? events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : [];
  } catch (error) {
    console.error("Failed to read downloads:", error);
    return [];
  }
}

export function recordDownloadEvent(params: {
  itemType: "client" | "game";
  itemId: string;
  platform: "windows" | "macos" | "linux" | "other";
  version?: string;
  userId?: string;
}): DownloadEvent {
  const events = getDownloadEvents();
  const newEvent: DownloadEvent = {
    id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    itemType: params.itemType,
    itemId: params.itemId,
    platform: params.platform,
    version: params.version || "1.0.0",
    timestamp: new Date().toISOString(),
    userId: params.userId,
  };

  events.unshift(newEvent);

  try {
    ensureFile(DOWNLOADS_FILE, "[]");
    fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist download event:", error);
  }

  return newEvent;
}

export function getTotalDownloadCount(): number {
  return getDownloadEvents().length;
}

export function getPlatformDownloadStats(): PlatformDownloadStats {
  const events = getDownloadEvents();
  const stats: PlatformDownloadStats = {
    windows: 0,
    macos: 0,
    linux: 0,
    other: 0,
    total: events.length,
  };

  for (const event of events) {
    if (event.platform === "windows") stats.windows++;
    else if (event.platform === "macos") stats.macos++;
    else if (event.platform === "linux") stats.linux++;
    else stats.other++;
  }

  return stats;
}

export function getGameDownloadStats(): Record<string, number> {
  const events = getDownloadEvents();
  const counts: Record<string, number> = {};
  for (const event of events) {
    if (event.itemType === "game") {
      counts[event.itemId] = (counts[event.itemId] || 0) + 1;
    }
  }
  return counts;
}

