import { NextRequest, NextResponse } from "next/server";
import {
  getDownloadEvents,
  recordDownloadEvent,
  getTotalDownloadCount,
  getPlatformDownloadStats,
  getGameDownloadStats,
} from "@/lib/download-store";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const events = getDownloadEvents().slice(0, limit);
    const total = getTotalDownloadCount();
    const platformStats = getPlatformDownloadStats();
    const gameStats = getGameDownloadStats();

    return NextResponse.json(
      {
        total,
        platformStats,
        gameStats,
        events,
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
    const user = await getSessionUser(req);
    const body = await req.json().catch(() => ({}));
    const { itemType, itemId, platform, version } = body;

    const validPlatform =
      platform === "windows" || platform === "macos" || platform === "linux" ? platform : "other";

    const validItemType = itemType === "game" ? "game" : "client";
    const validItemId = typeof itemId === "string" && itemId.trim() ? itemId.trim() : "kuronex-launcher";

    const event = recordDownloadEvent({
      itemType: validItemType,
      itemId: validItemId,
      platform: validPlatform,
      version: typeof version === "string" ? version : undefined,
      userId: user?.id,
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Downloads POST error:", error);
    return NextResponse.json({ error: "Failed to record download event" }, { status: 500 });
  }
}
