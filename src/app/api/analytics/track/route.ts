import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/event-tracker";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { EventType } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

const ALLOWED_CLIENT_EVENTS: EventType[] = [
  "game.page_view",
  "download.initiated",
  "download.completed",
  "download.failed",
];

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`analytics:track:${clientIp}`, 120, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const user = await getSessionUser(req);
    const body = await req.json().catch(() => ({}));
    const { eventType, resourceId, metadata, anonymousSessionId } = body;

    if (!eventType || !ALLOWED_CLIENT_EVENTS.includes(eventType)) {
      return NextResponse.json({ error: "Invalid or unsupported eventType" }, { status: 400 });
    }

    const sanitizedResourceId =
      typeof resourceId === "string" ? resourceId.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) : undefined;

    const event = trackEvent({
      eventType,
      category: eventType.startsWith("download") ? "downloads" : "engagement",
      userId: user?.id,
      anonymousSessionId: typeof anonymousSessionId === "string" ? anonymousSessionId.slice(0, 64) : undefined,
      clientIp: !user?.id ? clientIp : undefined,
      resourceId: sanitizedResourceId,
      metadata: typeof metadata === "object" && metadata !== null ? metadata : undefined,
    });

    return NextResponse.json({ success: true, eventId: event.id }, { status: 201 });
  } catch (error) {
    console.error("Track event error:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
