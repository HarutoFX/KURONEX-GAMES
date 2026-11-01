import { NextRequest, NextResponse } from "next/server";
import {
  deleteSession,
  revokeAllUserSessions,
  getSessionUser,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { trackEvent } from "@/lib/analytics/event-tracker";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const sessionToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const revokeAll = url.searchParams.get("all") === "true" || body.all === true;

    if (revokeAll) {
      if (user) {
        revokeAllUserSessions(user.id);
      }
    } else if (sessionToken) {
      deleteSession(sessionToken);
    }

    if (user) {
      trackEvent({
        eventType: "user.logout",
        category: "auth",
        userId: user.id,
      });
    }

    const response = NextResponse.json(
      { message: revokeAll ? "All sessions revoked successfully" : "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "true",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set({
      name: LEGACY_SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "true",
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
