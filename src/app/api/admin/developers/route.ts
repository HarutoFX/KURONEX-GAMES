import { NextRequest, NextResponse } from "next/server";
import { getDevelopers, saveDevelopers, updateDeveloper, DeveloperPartner } from "@/lib/library-store";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "kuronex-admin-2026";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey && headerKey === ADMIN_PASSKEY) {
    return true;
  }
  const user = await getCurrentUser();
  if (user && user.role === "admin") {
    return true;
  }
  return false;
}

export async function GET() {
  const developers = getDevelopers();
  return NextResponse.json({ developers }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();

    if (body.developer) {
      const dev = body.developer as DeveloperPartner;
      updateDeveloper(dev);
      return NextResponse.json({ message: "Developer updated successfully", developer: dev }, { status: 200 });
    }

    if (Array.isArray(body.developers)) {
      saveDevelopers(body.developers);
      return NextResponse.json({ message: "Developers list updated successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  } catch (error) {
    console.error("Admin developers update error:", error);
    return NextResponse.json({ error: "Failed to update developers" }, { status: 500 });
  }
}

