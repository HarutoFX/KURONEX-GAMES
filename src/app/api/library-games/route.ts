import { NextRequest, NextResponse } from "next/server";
import { getLibraryGames } from "@/lib/library-store";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const occupiedOnly = searchParams.get("occupiedOnly") === "true";
    let games = await getLibraryGames();

    if (category) {
      games = games.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }
    if (occupiedOnly) {
      games = games.filter((g) => !g.isEmpty);
    }

    const payload = JSON.stringify({ games, count: games.length });
    const etag = `"${crypto.createHash("md5").update(payload).digest("hex")}"`;

    if (req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ETag: etag,
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Fetch library games error:", error);
    return NextResponse.json({ error: "Failed to fetch games", games: [] }, { status: 500 });
  }
}

