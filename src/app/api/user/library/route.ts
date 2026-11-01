import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, updateUserLibrary } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { trackEvent } from "@/lib/analytics/event-tracker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ library: [] }, { status: 200 });
    }
    return NextResponse.json({ library: user.library || [] }, { status: 200 });
  } catch (error) {
    console.error("Get user library error:", error);
    return NextResponse.json({ error: "Failed to fetch user library" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const ipRateLimit = checkRateLimit(`library:post:${clientIp}`, 60, 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded for library operations.", retryAfter: ipRateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) } }
      );
    }

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required to manage persistent library" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { gameId, action } = body;

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json({ error: "Valid gameId is required" }, { status: 400 });
    }

    const sanitizedGameId = gameId.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    if (!sanitizedGameId) {
      return NextResponse.json({ error: "Malformed gameId provided" }, { status: 400 });
    }

    const validAction = action === "add" || action === "remove" ? action : "toggle";
    const updatedLibrary = updateUserLibrary(user.id, sanitizedGameId, validAction);

    // Track genuine library engagement event
    const wasAdded = updatedLibrary.includes(sanitizedGameId);
    trackEvent({
      eventType: wasAdded ? "library.game_added" : "library.game_removed",
      category: "engagement",
      userId: user.id,
      resourceId: sanitizedGameId,
      metadata: { action: wasAdded ? "added" : "removed" },
    });

    return NextResponse.json({ success: true, library: updatedLibrary }, { status: 200 });
  } catch (error) {
    console.error("Update user library error:", error);
    return NextResponse.json({ error: "Failed to update library" }, { status: 500 });
  }
}

