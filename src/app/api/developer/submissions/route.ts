import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isAdminRole } from "@/lib/security/rbac";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

function parseOsList(raw: string | null | undefined): string[] {
  if (!raw) return ["Windows"];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : ["Windows"];
  } catch {
    return ["Windows"];
  }
}

function mapSubmission(s: {
  id: string;
  studioName: string;
  contactEmail: string;
  title: string;
  category: string;
  targetEngine: string;
  targetOs: string;
  readinessPercent: number;
  coverImageUrl: string | null;
  status: string;
  pitchSummary: string;
  clientBinaryName: string | null;
  clientVersionTag: string | null;
  clientChannel: string | null;
  submittedAt: Date;
}) {
  return {
    id: s.id,
    studioName: s.studioName,
    contactEmail: s.contactEmail,
    title: s.title,
    category: s.category,
    targetEngine: s.targetEngine,
    targetOs: parseOsList(s.targetOs),
    readinessPercent: s.readinessPercent,
    coverImageUrl: s.coverImageUrl || undefined,
    status: s.status as "Draft" | "In Review" | "Approved" | "Published",
    pitchSummary: s.pitchSummary,
    submittedAt: s.submittedAt.toISOString(),
    ...(s.clientBinaryName && s.clientVersionTag
      ? {
          clientArtifact: {
            binaryName: s.clientBinaryName,
            versionTag: s.clientVersionTag,
            channel: (s.clientChannel as "Alpha" | "Beta" | "Release") || "Alpha",
          },
        }
      : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const where = isAdminRole(auth.user.role) ? {} : { userId: auth.user.id };
    const [rows, totalVaultAdds] = await Promise.all([
      prisma.developerSubmission.findMany({
        where,
        orderBy: { submittedAt: "desc" },
      }),
      prisma.userLibrary.count(),
    ]);

    return NextResponse.json(
      {
        submissions: rows.map(mapSubmission),
        vaultAdds: totalVaultAdds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Developer submissions GET error:", error);
    return NextResponse.json({ error: "Failed to load studio submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const studioName =
      typeof body.studioName === "string" && body.studioName.trim()
        ? body.studioName.trim()
        : auth.user.username;
    const contactEmail =
      typeof body.contactEmail === "string" && body.contactEmail.trim()
        ? body.contactEmail.trim().toLowerCase()
        : auth.user.email;
    const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "Action";
    const targetEngine =
      typeof body.targetEngine === "string" && body.targetEngine.trim()
        ? body.targetEngine.trim()
        : "Unreal Engine 5";
    const targetOs = Array.isArray(body.targetOs) && body.targetOs.length > 0 ? body.targetOs.map(String) : ["Windows"];
    const readinessPercent = Math.min(100, Math.max(0, Number(body.readinessPercent ?? 50) || 50));
    const coverImageUrl = typeof body.coverImageUrl === "string" ? body.coverImageUrl.trim() : null;
    const pitchSummary =
      typeof body.pitchSummary === "string" && body.pitchSummary.trim()
        ? body.pitchSummary.trim()
        : "Desktop client submission.";

    if (title.length < 2 || title.length > 120) {
      return NextResponse.json({ error: "Game title must be between 2 and 120 characters." }, { status: 400 });
    }

    const created = await prisma.developerSubmission.create({
      data: {
        userId: auth.user.id,
        studioName: studioName.slice(0, 120),
        contactEmail: contactEmail.slice(0, 254),
        title,
        category: category.slice(0, 40),
        targetEngine: targetEngine.slice(0, 80),
        targetOs: JSON.stringify(targetOs.slice(0, 6)),
        readinessPercent,
        coverImageUrl: coverImageUrl || null,
        status: "In Review",
        pitchSummary: pitchSummary.slice(0, 2000),
      },
    });

    await logAdminAction(
      "Developer Game Submission",
      "GAMES",
      title,
      `Studio ${studioName} submitted '${title}' for Kuronex Client review`,
      auth.user.username
    );

    return NextResponse.json(
      {
        success: true,
        submission: mapSubmission(created),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Developer submission POST error:", error);
    return NextResponse.json({ error: "Failed to create game submission" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const existing = await prisma.developerSubmission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const admin = isAdminRole(auth.user.role);
    if (!admin && existing.userId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this submission." }, { status: 403 });
    }

    const allowedStatuses = ["Draft", "In Review", "Approved", "Published"];
    const nextStatus =
      admin && typeof body.status === "string" && allowedStatuses.includes(body.status)
        ? body.status
        : existing.status;

    const updated = await prisma.developerSubmission.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(typeof body.readinessPercent === "number"
          ? { readinessPercent: Math.min(100, Math.max(0, body.readinessPercent)) }
          : {}),
        ...(typeof body.pitchSummary === "string" ? { pitchSummary: body.pitchSummary.trim().slice(0, 2000) } : {}),
      },
    });

    return NextResponse.json({ success: true, submission: mapSubmission(updated) }, { status: 200 });
  } catch (error) {
    console.error("Developer submission PATCH error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}

