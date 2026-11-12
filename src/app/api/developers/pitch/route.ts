import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("developers:write", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const pitches = await prisma.developerPitch.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      {
        pitches: pitches.map((p) => ({
          id: p.id,
          studioName: p.studioName,
          email: p.email,
          projectTitle: p.projectTitle,
          message: p.message,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Developer pitches GET error:", error);
    return NextResponse.json({ error: "Failed to fetch studio applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const isLoopback = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
    const rateLimit = checkRateLimit(
      `dev-pitch:post:${clientIp}`,
      isLoopback ? 100 : 10,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many pitch submissions. Please try again later.", retryAfter: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const studioName = typeof body.studioName === "string" ? body.studioName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const projectTitle = typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (studioName.length < 2 || studioName.length > 120) {
      return NextResponse.json({ error: "Studio name must be between 2 and 120 characters." }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please provide a valid contact email." }, { status: 400 });
    }
    if (projectTitle.length > 150) {
      return NextResponse.json({ error: "Project title cannot exceed 150 characters." }, { status: 400 });
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: "Project pitch message cannot exceed 3000 characters." }, { status: 400 });
    }

    const created = await prisma.developerPitch.create({
      data: {
        studioName,
        email,
        projectTitle: projectTitle || "Untitled Project",
        message: message || "Partnership inquiry submitted.",
        status: "PENDING",
      },
    });

    await logAdminAction(
      "Received Studio Pitch",
      "CMS",
      studioName,
      `New developer partnership pitch from ${studioName} (${email})`,
      email
    );

    return NextResponse.json(
      {
        success: true,
        message: "Studio application received. Our review team will reach out within 48 hours.",
        pitch: {
          id: created.id,
          studioName: created.studioName,
          email: created.email,
          projectTitle: created.projectTitle,
          status: created.status,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Developer pitch POST error:", error);
    return NextResponse.json({ error: "Failed to submit studio application." }, { status: 500 });
  }
}

