import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { trackEvent } from "@/lib/analytics/event-tracker";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLATFORMS = ["windows", "macos", "linux"] as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("downloads:read", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [entries, grouped] = await Promise.all([
      prisma.waitlistEntry.findMany({
        orderBy: { queueNumber: "desc" },
        take: 200,
      }),
      prisma.waitlistEntry.groupBy({
        by: ["platform"],
        _count: { platform: true },
      }),
    ]);

    const byPlatform: Record<string, number> = { windows: 0, macos: 0, linux: 0 };
    let total = 0;
    for (const g of grouped) {
      byPlatform[g.platform] = g._count.platform;
      total += g._count.platform;
    }

    return NextResponse.json(
      {
        count: total,
        byPlatform,
        entries: entries.map((e) => ({
          id: e.id,
          email: e.email,
          platform: e.platform,
          queueNumber: e.queueNumber,
          vipToken: e.vipToken,
          source: e.source,
          createdAt: e.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json({ error: "Failed to load waitlist entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const isLoopback = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
    const rateLimit = checkRateLimit(
      `waitlist:post:${clientIp}`,
      isLoopback ? 200 : 20,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many waitlist requests. Please try again later.", retryAfter: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawPlatform = typeof body.platform === "string" ? body.platform.trim().toLowerCase() : "windows";
    const source = body.source === "discover" ? "discover" : "download";

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const platform = VALID_PLATFORMS.includes(rawPlatform as (typeof VALID_PLATFORMS)[number])
      ? (rawPlatform as (typeof VALID_PLATFORMS)[number])
      : "windows";

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.waitlistEntry.findUnique({ where: { email: rawEmail } });
      if (existing) {
        return { created: false, row: existing };
      }

      const maxRow = await tx.waitlistEntry.aggregate({
        _max: { queueNumber: true },
      });
      const nextQueue = (maxRow._max.queueNumber ?? 0) + 1;
      const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
      const vipToken = `KX-VIP-${String(nextQueue).padStart(4, "0")}-${platform.toUpperCase()}-${suffix}`;

      const row = await tx.waitlistEntry.create({
        data: {
          email: rawEmail,
          platform,
          queueNumber: nextQueue,
          vipToken,
          source,
        },
      });
      return { created: true, row };
    });

    if (result.created) {
      await trackEvent({
        eventType: "download.initiated",
        category: "downloads",
        clientIp,
        resourceId: "kuronex-waitlist",
        metadata: { platform, source },
      });
    }

    return NextResponse.json(
      {
        success: true,
        alreadyRegistered: !result.created,
        entry: {
          id: result.row.id,
          email: result.row.email,
          platform: result.row.platform,
          queueNumber: result.row.queueNumber,
          vipToken: result.row.vipToken,
          createdAt: result.row.createdAt.toISOString(),
        },
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    console.error("Waitlist POST error:", error);
    return NextResponse.json({ error: "Failed to join client waitlist." }, { status: 500 });
  }
}

