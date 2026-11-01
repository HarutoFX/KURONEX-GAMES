import { NextRequest, NextResponse } from "next/server";
import { getLibraryGames, saveLibraryGames, updateLibraryGameSlot, LibraryGameSlot } from "@/lib/library-store";
import { requirePermission } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["Action", "RPG", "Sci-Fi", "Strategy", "Survival", "Shooter"] as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("games:read", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const games = getLibraryGames();
    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    console.error("Admin games GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve game catalog" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("games:slots:write", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    if (body.slot) {
      const slot = body.slot as LibraryGameSlot;
      if (!slot.id || typeof slot.id !== "string") {
        return NextResponse.json({ error: "Valid slot ID is required" }, { status: 400 });
      }
      if (!VALID_CATEGORIES.includes(slot.category as (typeof VALID_CATEGORIES)[number])) {
        return NextResponse.json({ error: "Invalid slot category" }, { status: 400 });
      }

      updateLibraryGameSlot(slot);
      logAdminAction(
        "Updated Game Slot",
        "GAMES",
        slot.title || slot.id,
        `Slot ${slot.id} in ${slot.category} updated (isEmpty: ${slot.isEmpty})`,
        auth.user.username
      );

      return NextResponse.json({ message: "Game slot updated successfully", slot }, { status: 200 });
    }

    if (Array.isArray(body.games)) {
      saveLibraryGames(body.games);
      logAdminAction(
        "Batch Updated Library Games",
        "GAMES",
        "Cartridge Matrix",
        `Batch saved ${body.games.length} game slots`,
        auth.user.username
      );

      return NextResponse.json({ message: "Library games saved successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
  } catch (error) {
    console.error("Admin games update error:", error);
    return NextResponse.json({ error: "Failed to update games" }, { status: 500 });
  }
}
