import { NextResponse } from "next/server";
import { getDevelopers } from "@/lib/library-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const developers = getDevelopers();
    return NextResponse.json({ developers }, { status: 200 });
  } catch (error) {
    console.error("Fetch developers error:", error);
    return NextResponse.json({ error: "Failed to fetch developers", developers: [] }, { status: 500 });
  }
}
