import { NextRequest, NextResponse } from "next/server";
import { getLibraryGames, saveLibraryGames, updateLibraryGameSlot, LibraryGameSlot } from "@/lib/library-store";
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
  const games = getLibraryGames();
  return NextResponse.json({ games }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();

    if (body.slot) {
      const slot = body.slot as LibraryGameSlot;
      updateLibraryGameSlot(slot);
      return NextResponse.json({ message: "Game slot updated successfully", slot }, { status: 200 });
    }

    if (Array.isArray(body.games)) {
      saveLibraryGames(body.games);
      return NextResponse.json({ message: "Library games saved successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  } catch (error) {
    console.error("Admin games update error:", error);
    return NextResponse.json({ error: "Failed to update games" }, { status: 500 });
  }
}

