import { NextRequest, NextResponse } from "next/server";
import { getDevelopers } from "@/lib/library-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const genre = searchParams.get("genre");
    let developers = getDevelopers();

    if (tier) {
      developers = developers.filter((d) => d.partnerTier.toLowerCase() === tier.toLowerCase());
    }
    if (genre) {
      developers = developers.filter((d) => d.genre.toLowerCase().includes(genre.toLowerCase()));
    }

    return NextResponse.json({ developers, count: developers.length }, { status: 200 });
  } catch (error) {
    console.error("Fetch developers error:", error);
    return NextResponse.json({ error: "Failed to fetch developers", developers: [] }, { status: 500 });
  }
}

