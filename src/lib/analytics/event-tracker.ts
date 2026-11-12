import crypto from "crypto";
import { EventEmitter } from "events";
import {
  PlatformEvent,
  AnalyticsSummary,
  EventType,
  EventCategory,
  MetricTrend,
} from "./types";
import prisma from "@/lib/prisma";
import { getDownloadEvents } from "@/lib/download-store";
import { getLibraryGames } from "@/lib/library-store";

// In-memory event bus for real-time Server-Sent Events (SSE) dispatch
export const analyticsEventBus = new EventEmitter();
// Allow multiple concurrent admin subscribers
analyticsEventBus.setMaxListeners(50);

function parseMetadata(
  raw: string | null | undefined
): Record<string, string | number | boolean | undefined> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hashes an IP address using SHA-256 with a salt for privacy compliance
 * so raw IPs are never stored in telemetry records.
 */
export function hashIpForPrivacy(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || "kuronex_telemetry_salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}

/**
 * Persists an authentic platform event and notifies real-time listeners.
 */
export async function trackEvent(params: {
  eventType: EventType;
  category: EventCategory;
  userId?: string;
  anonymousSessionId?: string;
  clientIp?: string;
  resourceId?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}): Promise<PlatformEvent> {
  // Ensure IP is never persisted raw - hash for pseudonymized unique actor aggregation
  const actorId =
    params.anonymousSessionId ||
    (params.clientIp ? `ip_${hashIpForPrivacy(params.clientIp)}` : undefined);

  const newEvent: PlatformEvent = {
    id: `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    eventType: params.eventType,
    category: params.category,
    timestamp: new Date().toISOString(),
    userId: params.userId,
    anonymousSessionId: actorId,
    resourceId: params.resourceId,
    metadata: params.metadata,
  };

  try {
    await prisma.platformEvent.create({
      data: {
        id: newEvent.id,
        eventType: newEvent.eventType,
        category: newEvent.category,
        timestamp: new Date(newEvent.timestamp),
        userId: newEvent.userId || null,
        anonymousSessionId: newEvent.anonymousSessionId || null,
        resourceId: newEvent.resourceId || null,
        metadata: newEvent.metadata ? JSON.stringify(newEvent.metadata) : null,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS ERROR] Failed to persist event:", error);
  }

  // Real-time broadcast to connected SSE streams
  analyticsEventBus.emit("event", newEvent);

  return newEvent;
}

/**
 * Retrieves platform events with optional filtering.
 */
export async function getEvents(filter?: {
  category?: EventCategory;
  eventType?: EventType;
  sinceMs?: number;
  limit?: number;
}): Promise<PlatformEvent[]> {
  try {
    const rows = await prisma.platformEvent.findMany({
      where: {
        ...(filter?.category ? { category: filter.category } : {}),
        ...(filter?.eventType ? { eventType: filter.eventType } : {}),
        ...(filter?.sinceMs ? { timestamp: { gte: new Date(filter.sinceMs) } } : {}),
      },
      orderBy: { timestamp: "desc" },
      take: filter?.limit || 100,
    });

    return rows.map((r) => ({
      id: r.id,
      eventType: r.eventType as EventType,
      category: r.category as EventCategory,
      timestamp: r.timestamp.toISOString(),
      userId: r.userId ?? undefined,
      anonymousSessionId: r.anonymousSessionId ?? undefined,
      resourceId: r.resourceId ?? undefined,
      metadata: parseMetadata(r.metadata),
    }));
  } catch (error) {
    console.error("[ANALYTICS ERROR] Failed to query events:", error);
    return [];
  }
}

/**
 * Computes trend comparison between current and previous periods.
 */
function calculateTrend(current: number, previous: number): MetricTrend {
  if (previous === 0) {
    return {
      current,
      previous,
      percentChange: null,
      trendDirection: current > 0 ? "UP" : "INSUFFICIENT_DATA",
    };
  }

  const change = ((current - previous) / previous) * 100;
  const percentChange = Math.round(change * 10) / 10;

  let trendDirection: MetricTrend["trendDirection"] = "FLAT";
  if (percentChange > 0) trendDirection = "UP";
  else if (percentChange < 0) trendDirection = "DOWN";

  return {
    current,
    previous,
    percentChange,
    trendDirection,
  };
}

/**
 * Calculates genuine platform analytics metrics strictly from persisted records.
 */
export async function calculateAnalyticsSummary(
  timeRange: "24H" | "7D" | "30D" | "ALL" = "7D"
): Promise<AnalyticsSummary> {
  const [events, legacyDownloads, librarySlots, totalRegistered] = await Promise.all([
    getEvents({ limit: 5000 }),
    getDownloadEvents(),
    getLibraryGames(),
    prisma.user.count(),
  ]);

  const now = Date.now();
  let windowMs: number;
  switch (timeRange) {
    case "24H":
      windowMs = 24 * 60 * 60 * 1000;
      break;
    case "7D":
      windowMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case "30D":
      windowMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case "ALL":
    default:
      windowMs = Infinity;
      break;
  }

  const startTime = windowMs === Infinity ? 0 : now - windowMs;
  const previousStartTime = windowMs === Infinity ? 0 : now - windowMs * 2;

  const periodEvents = events.filter((e) => new Date(e.timestamp).getTime() >= startTime);
  const previousPeriodEvents = events.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= previousStartTime && t < startTime;
  });

  // Unique Active User Calculations (DAU / WAU / MAU)
  const past24hTime = now - 24 * 60 * 60 * 1000;
  const past7dTime = now - 7 * 24 * 60 * 60 * 1000;
  const past30dTime = now - 30 * 24 * 60 * 60 * 1000;

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  for (const e of events) {
    const t = new Date(e.timestamp).getTime();
    const actorId = e.userId || e.anonymousSessionId;
    if (!actorId) continue;

    if (t >= past24hTime) dauSet.add(actorId);
    if (t >= past7dTime) wauSet.add(actorId);
    if (t >= past30dTime) mauSet.add(actorId);
  }

  // Registration metrics
  const newRegistrations = periodEvents.filter((e) => e.eventType === "user.registered").length;
  const previousRegistrations = previousPeriodEvents.filter(
    (e) => e.eventType === "user.registered"
  ).length;

  // Engagement & Traffic metrics
  const pageViews = periodEvents.filter((e) => e.eventType === "game.page_view");
  const uniqueVisitorSet = new Set<string>();
  for (const pv of pageViews) {
    const id = pv.userId || pv.anonymousSessionId;
    if (id) uniqueVisitorSet.add(id);
  }

  const libraryAdds = periodEvents.filter((e) => e.eventType === "library.game_added").length;
  const libraryRemoves = periodEvents.filter((e) => e.eventType === "library.game_removed").length;

  const activeUserCount = Math.max(1, wauSet.size);
  const libraryAddsPerActiveUser = Math.round((libraryAdds / activeUserCount) * 10) / 10;

  // Telemetry & Downloads
  const initiatedDownloads = periodEvents.filter((e) => e.eventType === "download.initiated").length;
  const completedEvents = periodEvents.filter((e) => e.eventType === "download.completed");
  const failedEvents = periodEvents.filter((e) => e.eventType === "download.failed");

  const legacyInWindow = legacyDownloads.filter((dl) => new Date(dl.timestamp).getTime() >= startTime);
  const totalCompletedDownloads = Math.max(completedEvents.length, legacyInWindow.length);
  const totalFailedDownloads = failedEvents.length;
  const totalDownloadAttempts = Math.max(
    initiatedDownloads,
    totalCompletedDownloads + totalFailedDownloads
  );

  const successRate =
    totalDownloadAttempts > 0
      ? Math.round((totalCompletedDownloads / Math.max(1, totalCompletedDownloads + totalFailedDownloads)) * 100)
      : null;

  // Platform breakdown
  const platformShare = {
    windows: 0,
    linux: 0,
    macos: 0,
    other: 0,
    total: 0,
  };

  for (const dl of legacyInWindow) {
    if (dl.platform === "windows") platformShare.windows++;
    else if (dl.platform === "linux") platformShare.linux++;
    else if (dl.platform === "macos") platformShare.macos++;
    else platformShare.other++;
    platformShare.total++;
  }

  for (const ce of completedEvents) {
    const plat = String(ce.metadata?.platform || "");
    if (!legacyInWindow.some((l) => l.id === ce.id)) {
      if (plat === "windows") platformShare.windows++;
      else if (plat === "linux") platformShare.linux++;
      else if (plat === "macos") platformShare.macos++;
      else platformShare.other++;
      platformShare.total++;
    }
  }

  const downloadsPerActiveUser = Math.round((totalCompletedDownloads / activeUserCount) * 10) / 10;

  // Top Games Calculation
  const gameStatsMap = new Map<string, { views: number; downloads: number; libraryAdds: number }>();

  for (const pv of pageViews) {
    const gid = pv.resourceId || String(pv.metadata?.gameId || "");
    if (!gid) continue;
    const curr = gameStatsMap.get(gid) || { views: 0, downloads: 0, libraryAdds: 0 };
    curr.views++;
    gameStatsMap.set(gid, curr);
  }

  for (const ce of completedEvents) {
    const gid = ce.resourceId || String(ce.metadata?.itemId || "");
    if (!gid) continue;
    const curr = gameStatsMap.get(gid) || { views: 0, downloads: 0, libraryAdds: 0 };
    curr.downloads++;
    gameStatsMap.set(gid, curr);
  }

  for (const e of periodEvents) {
    if (e.eventType === "library.game_added") {
      const gid = e.resourceId || String(e.metadata?.gameId || "");
      if (!gid) continue;
      const curr = gameStatsMap.get(gid) || { views: 0, downloads: 0, libraryAdds: 0 };
      curr.libraryAdds++;
      gameStatsMap.set(gid, curr);
    }
  }

  const topGames = Array.from(gameStatsMap.entries())
    .map(([gameId, stat]) => {
      const matchedSlot = librarySlots.find(
        (s) => s.id === gameId || s.title?.toLowerCase().replace(/\s+/g, "-") === gameId
      );
      return {
        gameId,
        title: matchedSlot?.title || gameId,
        views: stat.views,
        downloads: stat.downloads,
        libraryAdds: stat.libraryAdds,
      };
    })
    .sort((a, b) => b.downloads + b.views - (a.downloads + a.views))
    .slice(0, 10);

  // Category Distribution
  const validSlots = librarySlots.filter((s) => !s.isEmpty);
  const totalSlotsCount = validSlots.length || 1;
  const categoryCounts: Record<string, number> = {};
  for (const s of validSlots) {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  }

  const categoryShare = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    count,
    percentage: Math.round((count / totalSlotsCount) * 100),
  }));

  return {
    timeRange,
    lastUpdated: new Date().toISOString(),
    isLive: true,
    users: {
      totalRegistered,
      dau: dauSet.size,
      wau: wauSet.size,
      mau: mauSet.size,
      newRegistrations,
      trend: calculateTrend(newRegistrations, previousRegistrations),
    },
    engagement: {
      totalPageViews: pageViews.length,
      uniqueVisitors: uniqueVisitorSet.size,
      libraryAdditions: libraryAdds,
      libraryRemovals: libraryRemoves,
      netLibraryGrowth: libraryAdds - libraryRemoves,
      libraryAddsPerActiveUser,
      downloadsPerActiveUser,
    },
    downloads: {
      initiated: totalDownloadAttempts,
      completed: totalCompletedDownloads,
      failed: totalFailedDownloads,
      successRate,
      platformShare,
    },
    topGames,
    categoryShare,
    recentEvents: events.slice(0, 25),
  };
}
