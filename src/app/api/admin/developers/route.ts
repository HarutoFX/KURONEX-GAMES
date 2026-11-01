import { NextRequest, NextResponse } from "next/server";
import { getDevelopers, saveDevelopers, updateDeveloper, DeveloperPartner } from "@/lib/library-store";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const developers = getDevelopers();
    return NextResponse.json({ developers }, { status: 200 });
  } catch (error) {
    console.error("Admin developers GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve developer partners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    if (body.developer) {
      const dev = body.developer as DeveloperPartner;
      if (!dev.id || typeof dev.id !== "string" || !dev.name || typeof dev.name !== "string") {
        return NextResponse.json({ error: "Valid developer partner ID and name are required" }, { status: 400 });
      }

      updateDeveloper(dev);
      logAdminAction(
        "Updated Developer Partner",
        "CMS",
        dev.name,
        `Developer partner ${dev.name} (${dev.partnerTier}) updated`,
        auth.user.username
      );

      return NextResponse.json({ message: "Developer updated successfully", developer: dev }, { status: 200 });
    }

    if (Array.isArray(body.developers)) {
      saveDevelopers(body.developers);
      logAdminAction(
        "Batch Updated Developers",
        "CMS",
        "Partner Directory",
        `Batch saved ${body.developers.length} developer partners`,
        auth.user.username
      );

      return NextResponse.json({ message: "Developers list updated successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  } catch (error) {
    console.error("Admin developers update error:", error);
    return NextResponse.json({ error: "Failed to update developers" }, { status: 500 });
  }
}
