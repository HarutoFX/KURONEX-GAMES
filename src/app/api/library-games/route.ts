import { NextResponse } from "next/server";
import { getLibraryGames } from "@/lib/library-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const games = getLibraryGames();
    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    console.error("Fetch library games error:", error);
    return NextResponse.json({ error: "Failed to fetch games", games: [] }, { status: 500 });
  }
}
