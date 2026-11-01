import { NextRequest, NextResponse } from "next/server";
import { getLibraryGames } from "@/lib/library-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const occupiedOnly = searchParams.get("occupiedOnly") === "true";
    let games = getLibraryGames();

    if (category) {
      games = games.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }
    if (occupiedOnly) {
      games = games.filter((g) => !g.isEmpty);
    }

    return NextResponse.json({ games, count: games.length }, { status: 200 });
  } catch (error) {
    console.error("Fetch library games error:", error);
    return NextResponse.json({ error: "Failed to fetch games", games: [] }, { status: 500 });
  }
}

