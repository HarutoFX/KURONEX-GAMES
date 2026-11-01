import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, updateUserLibrary } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ library: [] }, { status: 200 });
    }
    return NextResponse.json({ library: user.library || [] }, { status: 200 });
  } catch (error) {
    console.error("Get user library error:", error);
    return NextResponse.json({ error: "Failed to fetch user library" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required to manage persistent library" }, { status: 401 });
    }

    const body = await req.json();
    const { gameId, action } = body;

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json({ error: "Valid gameId is required" }, { status: 400 });
    }

    const validAction = action === "add" || action === "remove" ? action : "toggle";
    const updatedLibrary = updateUserLibrary(user.id, gameId.trim(), validAction);

    return NextResponse.json({ success: true, library: updatedLibrary }, { status: 200 });
  } catch (error) {
    console.error("Update user library error:", error);
    return NextResponse.json({ error: "Failed to update library" }, { status: 500 });
  }
}

