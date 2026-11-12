import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const studio = await prisma.developerStudio.findFirst({
      where: { ownerUserId: auth.user.id },
    });

    if (!studio) {
      return NextResponse.json(
        {
          profile: {
            id: `dev_user_${auth.user.id.slice(-6)}`,
            studioName: `${auth.user.username} Studios`,
            tagline: "Independent studio building for the Kuronex Client.",
            headquarters: "Global / Remote",
            website: "",
            teamSize: "1-10 Engineers & Artists",
            primaryEngine: "Unreal Engine 5 / Custom C++",
            bio: "",
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        profile: {
          id: studio.id,
          studioName: studio.name,
          tagline: studio.tagline || "",
          headquarters: studio.headquarters,
          website: studio.website || "",
          teamSize: studio.teamSize || "",
          primaryEngine: studio.primaryEngine || "",
          bio: studio.description,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Developer profile GET error:", error);
    return NextResponse.json({ error: "Failed to load studio profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(["DEVELOPER", "ADMIN", "SUPER_ADMIN"], req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const studioName = typeof body.studioName === "string" ? body.studioName.trim() : "";
    const tagline = typeof body.tagline === "string" ? body.tagline.trim() : "";
    const headquarters = typeof body.headquarters === "string" ? body.headquarters.trim() : "Global";
    const website = typeof body.website === "string" ? body.website.trim() : "";
    const teamSize = typeof body.teamSize === "string" ? body.teamSize.trim() : "";
    const primaryEngine = typeof body.primaryEngine === "string" ? body.primaryEngine.trim() : "";
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";

    if (studioName.length < 2 || studioName.length > 120) {
      return NextResponse.json({ error: "Studio name must be between 2 and 120 characters." }, { status: 400 });
    }

    const existing = await prisma.developerStudio.findFirst({
      where: { ownerUserId: auth.user.id },
    });

    const studioId = existing?.id || `dev_user_${auth.user.id}`;
    const slugBase = slugify(studioName) || "studio";
    const uniqueSlug = `${slugBase}-${auth.user.id.slice(-6)}`;

    const saved = existing
      ? await prisma.developerStudio.update({
          where: { id: existing.id },
          data: {
            name: studioName,
            tagline: tagline || existing.tagline,
            headquarters: headquarters || existing.headquarters,
            website,
            teamSize: teamSize || null,
            primaryEngine: primaryEngine || null,
            description: bio || existing.description,
          },
        })
      : await prisma.developerStudio.create({
          data: {
            id: studioId,
            slug: uniqueSlug,
            name: studioName,
            tagline: tagline || "Partner Studio",
            icon: "Sparkles",
            genre: primaryEngine || "Action / Indie",
            headquarters: headquarters || "Global",
            teamSize: teamSize || null,
            primaryEngine: primaryEngine || null,
            ownerUserId: auth.user.id,
            description: bio || "Studio registered on Kuronex Ecosystem.",
            gamesCount: 0,
            partnerTier: "Indie Pioneer",
            website,
            showInTicker: false,
          },
        });

    await logAdminAction(
      "Updated Studio Profile",
      "CMS",
      saved.name,
      `Developer ${auth.user.username} updated studio profile`,
      auth.user.username
    );

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: saved.id,
          studioName: saved.name,
          tagline: saved.tagline || "",
          headquarters: saved.headquarters,
          website: saved.website || "",
          teamSize: saved.teamSize || "",
          primaryEngine: saved.primaryEngine || "",
          bio: saved.description,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Developer profile PUT error:", error);
    return NextResponse.json({ error: "Failed to save studio profile" }, { status: 500 });
  }
}

