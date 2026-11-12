import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("promotions:write", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [promotions, waitlistCount] = await Promise.all([
      prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.waitlistEntry.count(),
    ]);

    return NextResponse.json(
      {
        waitlistCount,
        promotions: promotions.map((p) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline || "",
          description: p.description || "",
          promoType: p.promoType,
          gameId: p.gameId || null,
          bannerUrl: p.bannerUrl || null,
          targetUrl: p.targetUrl,
          code: p.code || null,
          claimsCount: p.claimsCount,
          maxClaims: p.maxClaims,
          isActive: p.isActive,
          startsAt: p.startsAt.toISOString(),
          endsAt: p.endsAt ? p.endsAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin promotions GET error:", error);
    return NextResponse.json({ error: "Failed to load promotions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("promotions:write", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "create";

    if (action === "toggle" && typeof body.id === "string") {
      const existing = await prisma.promotion.findUnique({ where: { id: body.id } });
      if (!existing) {
        return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
      }
      const updated = await prisma.promotion.update({
        where: { id: body.id },
        data: { isActive: !existing.isActive },
      });
      await logAdminAction(
        "Toggled Promotion",
        "CMS",
        updated.title,
        `Promotion ${updated.title} set to ${updated.isActive ? "active" : "inactive"}`,
        auth.user.username
      );
      return NextResponse.json({ success: true, promotion: updated }, { status: 200 });
    }

    if (action === "delete" && typeof body.id === "string") {
      await prisma.promotion.delete({ where: { id: body.id } });
      await logAdminAction("Deleted Promotion", "CMS", body.id, `Removed promotion ${body.id}`, auth.user.username);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const targetUrl = typeof body.targetUrl === "string" ? body.targetUrl.trim() : "/download";
    if (title.length < 3 || title.length > 140) {
      return NextResponse.json({ error: "Promotion title must be between 3 and 140 characters." }, { status: 400 });
    }

    const created = await prisma.promotion.create({
      data: {
        title,
        tagline: typeof body.tagline === "string" ? body.tagline.trim() : null,
        description: typeof body.description === "string" ? body.description.trim() : null,
        promoType: typeof body.promoType === "string" ? body.promoType.trim() : "SPOTLIGHT",
        gameId: typeof body.gameId === "string" ? body.gameId.trim() : null,
        targetUrl,
        code: typeof body.code === "string" && body.code.trim() ? body.code.trim().toUpperCase() : null,
        maxClaims: Math.max(0, Number(body.maxClaims) || 0),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    await logAdminAction("Created Promotion", "CMS", created.title, `Created promotion ${created.title}`, auth.user.username);
    return NextResponse.json({ success: true, promotion: created }, { status: 201 });
  } catch (error) {
    console.error("Admin promotions POST error:", error);
    return NextResponse.json({ error: "Failed to save promotion" }, { status: 500 });
  }
}

