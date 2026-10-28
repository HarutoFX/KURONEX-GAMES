import { NextRequest, NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sessionToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;
    if (sessionToken) {
      deleteSession(sessionToken);
    }

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set({
      name: LEGACY_SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout." },
      { status: 500 }
    );
  }
}
