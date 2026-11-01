import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  getUserSessions,
  deleteSession,
  revokeAllUserSessions,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const currentToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;

    const rawSessions = getUserSessions(user.id);

    // Sanitize sessions before sending to client: mask tokens to prevent leakage
    const sanitizedSessions = rawSessions.map((s, index) => ({
      sessionId: `sess_${index + 1}_${s.token.slice(0, 8)}`,
      createdAt: s.createdAt || s.expiresAt - 30 * 24 * 60 * 60 * 1000,
      expiresAt: s.expiresAt,
      ipAddress: s.ipAddress || "Unknown",
      userAgent: s.userAgent || "Unknown client",
      isCurrent: s.token === currentToken,
    }));

    return NextResponse.json(
      {
        totalActiveSessions: sanitizedSessions.length,
        sessions: sanitizedSessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch active sessions" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const revokeAllOthers = searchParams.get("revokeOthers") === "true";
    const currentToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;

    if (revokeAllOthers) {
      const allSessions = getUserSessions(user.id);
      let revoked = 0;
      for (const s of allSessions) {
        if (s.token !== currentToken) {
          deleteSession(s.token);
          revoked++;
        }
      }

      return NextResponse.json(
        { message: `Revoked ${revoked} other active session(s) successfully.` },
        { status: 200 }
      );
    }

    // Revoke all sessions including current
    revokeAllUserSessions(user.id);

    const response = NextResponse.json(
      { message: "All sessions terminated successfully." },
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

    return response;
  } catch (error) {
    console.error("Sessions DELETE error:", error);
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 });
  }
}
