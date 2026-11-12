import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isAdminRole } from "@/lib/security/rbac";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

function mapBuild(b: {
  id: string;
  submissionId: string | null;
  gameTitle: string;
  versionTag: string;
  channel: string;
  targetOs: string;
  executableName: string;
  buildSizeBytes: bigint;
  sha256Hash: string;
  releaseNotes: string;
  releasedAt: Date;
  status: string;
}) {
  return {
    id: b.id,
    submissionId: b.submissionId ?? undefined,
    gameTitle: b.gameTitle,
    versionTag: b.versionTag,
    channel: b.channel as "Alpha" | "Beta" | "Release",
    targetOs: b.targetOs as "Windows (DirectX 12)" | "macOS (Metal)" | "Linux (Vulkan)",
    executableName: b.executableName,
    buildSizeBytes: Number(b.buildSizeBytes),
    sha256Hash: b.sha256Hash,
    releaseNotes: b.releaseNotes,
    releasedAt: b.releasedAt.toISOString(),
    status: b.status as "Active" | "Superseded" | "Archived",
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const where = isAdminRole(auth.user.role) ? {} : { userId: auth.user.id };
    const rows = await prisma.developerBuild.findMany({
      where,
      orderBy: { releasedAt: "desc" },
    });

    return NextResponse.json({ builds: rows.map(mapBuild) }, { status: 200 });
  } catch (error) {
    console.error("Developer builds GET error:", error);
    return NextResponse.json({ error: "Failed to load client builds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const gameTitle = typeof body.gameTitle === "string" ? body.gameTitle.trim() : "";
    const versionTag = typeof body.versionTag === "string" ? body.versionTag.trim() : "v1.0.0";
    const channel =
      body.channel === "Alpha" || body.channel === "Beta" || body.channel === "Release"
        ? body.channel
        : "Beta";
    const targetOs =
      typeof body.targetOs === "string" && body.targetOs.trim()
        ? body.targetOs.trim()
        : "Windows (DirectX 12)";
    const executableName =
      typeof body.executableName === "string" && body.executableName.trim()
        ? body.executableName.trim()
        : "game_client.exe";
    const buildSizeBytes = Math.max(0, Math.round(Number(body.buildSizeBytes) || 0));
    const sha256Hash =
      typeof body.sha256Hash === "string" && body.sha256Hash.trim().length >= 8
        ? body.sha256Hash.trim()
        : crypto
            .createHash("sha256")
            .update(`${gameTitle}:${versionTag}:${executableName}:${Date.now()}`)
            .digest("hex");
    const releaseNotes =
      typeof body.releaseNotes === "string" && body.releaseNotes.trim()
        ? body.releaseNotes.trim()
        : "Client build manifest uploaded.";

    if (gameTitle.length < 2 || gameTitle.length > 120) {
      return NextResponse.json({ error: "Game title must be between 2 and 120 characters." }, { status: 400 });
    }

    const created = await prisma.developerBuild.create({
      data: {
        userId: auth.user.id,
        submissionId: typeof body.submissionId === "string" ? body.submissionId : null,
        gameTitle,
        versionTag: versionTag.slice(0, 40),
        channel,
        targetOs: targetOs.slice(0, 64),
        executableName: executableName.slice(0, 120),
        buildSizeBytes: BigInt(buildSizeBytes),
        sha256Hash: sha256Hash.slice(0, 128),
        releaseNotes: releaseNotes.slice(0, 2000),
        status: "Active",
      },
    });

    await logAdminAction(
      "Registered Client Build",
      "GAMES",
      `${gameTitle} ${versionTag}`,
      `Build ${executableName} (${channel} / ${targetOs}) registered by ${auth.user.username}`,
      auth.user.username
    );

    return NextResponse.json({ success: true, build: mapBuild(created) }, { status: 201 });
  } catch (error) {
    console.error("Developer build POST error:", error);
    return NextResponse.json({ error: "Failed to register build manifest" }, { status: 500 });
  }
}

