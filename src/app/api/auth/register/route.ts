import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  createSession,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { trackEvent } from "@/lib/analytics/event-tracker";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const ipRateLimit = checkRateLimit(`register:ip:${clientIp}`, 50, 60 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts from this network. Please try again later.",
          retryAfter: ipRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { username, email, password, role } = body;

    // 1. Validation
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Gamertag must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length > 30) {
      return NextResponse.json(
        { error: "Gamertag cannot exceed 30 characters." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Gamertag can only contain letters, numbers, underscores, and dashes." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Uniqueness Checks
    if (findUserByEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (findUserByUsername(trimmedUsername)) {
      return NextResponse.json(
        { error: "This gamertag is already claimed. Please choose another." },
        { status: 409 }
      );
    }

    // 3. Create User & Session
    const user = createUser({
      username: trimmedUsername,
      email: trimmedEmail,
      password,
      role: role === "developer" ? "developer" : "player",
    });
    const sessionToken = createSession(user.id, req);

    // Track genuine registration event
    trackEvent({
      eventType: "user.registered",
      category: "auth",
      userId: user.id,
      metadata: { username: user.username },
    });

    // 4. Return user & set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.SECURE_COOKIES === "true",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
