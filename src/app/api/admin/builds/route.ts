import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("downloads:read", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [builds, devBuilds, waitlistGroups] = await Promise.all([
      prisma.downloadBuild.findMany({ orderBy: { releasedAt: "desc" } }),
      prisma.developerBuild.findMany({ orderBy: { releasedAt: "desc" }, take: 50 }),
      prisma.waitlistEntry.groupBy({ by: ["platform"], _count: { platform: true } }),
    ]);

    const byPlatform: Record<string, number> = { windows: 0, macos: 0, linux: 0 };
    let totalWaitlist = 0;
    for (const row of waitlistGroups) {
      byPlatform[row.platform] = row._count.platform;
      totalWaitlist += row._count.platform;
    }

    return NextResponse.json(
      {
        builds: builds.map((b) => ({
          id: b.id,
          itemType: b.itemType,
          itemId: b.itemId,
          platform: b.platform,
          version: b.version,
          downloadUrl: b.downloadUrl,
          checksumSha256: b.checksumSha256,
          fileSizeBytes: b.fileSizeBytes ? Number(b.fileSizeBytes) : null,
          isPublic: b.isPublic,
          releasedAt: b.releasedAt.toISOString(),
        })),
        developerBuilds: devBuilds.map((b) => ({
          id: b.id,
          gameTitle: b.gameTitle,
          versionTag: b.versionTag,
          channel: b.channel,
          targetOs: b.targetOs,
          executableName: b.executableName,
          buildSizeBytes: Number(b.buildSizeBytes),
          status: b.status,
          releasedAt: b.releasedAt.toISOString(),
        })),
        waitlistSummary: {
          total: totalWaitlist,
          byPlatform,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin builds GET error:", error);
    return NextResponse.json({ error: "Failed to load build manifests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("system:settings:write", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const platform = typeof body.platform === "string" ? body.platform.trim().toLowerCase() : "windows";
    const version = typeof body.version === "string" ? body.version.trim() : "";
    const downloadUrl = typeof body.downloadUrl === "string" ? body.downloadUrl.trim() : "/download";

    if (!version) {
      return NextResponse.json({ error: "Build version string is required." }, { status: 400 });
    }

    const created = await prisma.downloadBuild.create({
      data: {
        itemType: body.itemType === "game" ? "game" : "client",
        itemId: typeof body.itemId === "string" && body.itemId.trim() ? body.itemId.trim() : "kuronex-desktop-launcher",
        platform,
        version,
        downloadUrl,
        checksumSha256: typeof body.checksumSha256 === "string" ? body.checksumSha256.trim() : null,
        fileSizeBytes: body.fileSizeBytes ? BigInt(Math.round(Number(body.fileSizeBytes))) : null,
        isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
      },
    });

    await logAdminAction(
      "Published Download Build",
      "SYSTEM",
      `${created.itemId} (${created.platform})`,
      `Registered build version ${created.version} for ${created.platform}`,
      auth.user.username
    );

    return NextResponse.json(
      {
        success: true,
        build: {
          ...created,
          fileSizeBytes: created.fileSizeBytes ? Number(created.fileSizeBytes) : null,
          releasedAt: created.releasedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin builds POST error:", error);
    return NextResponse.json({ error: "Failed to save download build manifest" }, { status: 500 });
  }
}

