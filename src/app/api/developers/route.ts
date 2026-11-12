import { NextRequest, NextResponse } from "next/server";
import { getDevelopers } from "@/lib/library-store";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const genre = searchParams.get("genre");
    let developers = await getDevelopers();

    if (tier) {
      developers = developers.filter((d) => d.partnerTier.toLowerCase() === tier.toLowerCase());
    }
    if (genre) {
      developers = developers.filter((d) => d.genre.toLowerCase().includes(genre.toLowerCase()));
    }

    const payload = JSON.stringify({ developers, count: developers.length });
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
    console.error("Fetch developers error:", error);
    return NextResponse.json({ error: "Failed to fetch developers", developers: [] }, { status: 500 });
  }
}

