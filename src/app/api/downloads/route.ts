import { NextRequest, NextResponse } from "next/server";
import {
  getDownloadEvents,
  recordDownloadEvent,
  getTotalDownloadCount,
  getPlatformDownloadStats,
  getGameDownloadStats,
} from "@/lib/download-store";
import { getSessionUser } from "@/lib/auth";
import { parsePagination } from "@/lib/api/validators";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { trackEvent } from "@/lib/analytics/event-tracker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(searchParams, 50, 200);
    const platform = searchParams.get("platform");
    const itemType = searchParams.get("itemType");

    let allEvents = await getDownloadEvents();
    if (platform && ["windows", "macos", "linux", "other"].includes(platform)) {
      allEvents = allEvents.filter((e) => e.platform === platform);
    }
    if (itemType && (itemType === "client" || itemType === "game")) {
      allEvents = allEvents.filter((e) => e.itemType === itemType);
    }

    const startIndex = (page - 1) * limit;
    const pagedEvents = allEvents.slice(startIndex, startIndex + limit);

    const [total, platformStats, gameStats] = await Promise.all([
      getTotalDownloadCount(),
      getPlatformDownloadStats(),
      getGameDownloadStats(),
    ]);

    return NextResponse.json(
      {
        total,
        platformStats,
        gameStats,
        events: pagedEvents,
        pagination: {
          page,
          limit,
          totalCount: allEvents.length,
          totalPages: Math.ceil(allEvents.length / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Downloads GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve download metrics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const ipRateLimit = checkRateLimit(`downloads:post:${clientIp}`, 120, 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded for download metrics telemetry.",
          retryAfter: ipRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) },
        }
      );
    }

    const user = await getSessionUser(req);
    const body = await req.json().catch(() => ({}));
    const { itemType, itemId, platform, version } = body;

    const validPlatform =
      platform === "windows" || platform === "macos" || platform === "linux" ? platform : "other";

    const validItemType = itemType === "game" ? "game" : "client";
    const rawItemId = typeof itemId === "string" && itemId.trim() ? itemId.trim() : "kuronex-launcher";
    // Sanitize itemId against path traversal and control characters
    const validItemId = rawItemId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "kuronex-launcher";
    const validVersion =
      typeof version === "string" ? version.trim().replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 32) : undefined;

    const event = await recordDownloadEvent({
      itemType: validItemType,
      itemId: validItemId,
      platform: validPlatform,
      version: validVersion,
      userId: user?.id,
    });

    // Track genuine download completion event
    await trackEvent({
      eventType: "download.completed",
      category: "downloads",
      userId: user?.id,
      clientIp,
      resourceId: validItemId,
      metadata: {
        itemType: validItemType,
        platform: validPlatform,
        version: validVersion,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Downloads POST error:", error);
    return NextResponse.json({ error: "Failed to record download event" }, { status: 500 });
  }
}

