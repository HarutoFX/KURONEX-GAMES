import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  findUserByEmail,
  findUserByUsername,
  verifyPassword,
  createSession,
  toSafeUser,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/security/rate-limiter";
import { trackEvent } from "@/lib/analytics/event-tracker";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. IP-level rate limiting (stricter in production, generous for local test suites)
    const maxLoginAttempts = process.env.NODE_ENV === "production" ? 15 : 120;
    const ipRateLimit = checkRateLimit(`login:ip:${clientIp}`, maxLoginAttempts, 15 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts from this network. Please try again later.",
          retryAfter: ipRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { identifier, email, password } = body;
    const loginId = (identifier || email || "").trim();

    if (!loginId) {
      return NextResponse.json(
        { error: "Please provide your email or gamertag." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    // 2. Targeted identifier brute-force & lockout protection
    const lockout = isAccountLocked(loginId);
    if (lockout.locked) {
      return NextResponse.json(
        {
          error: `Account temporarily locked due to excessive failed attempts. Please try again in ${lockout.remainingSeconds} seconds.`,
          retryAfter: lockout.remainingSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(lockout.remainingSeconds) },
        }
      );
    }

    // Allow login with either email or gamertag
    let user = findUserByEmail(loginId);
    if (!user) {
      user = findUserByUsername(loginId);
    }

    // 3. User not found: execute dummy scrypt computation to neutralize side-channel timing attacks
    if (!user) {
      crypto.scryptSync("dummy_pad_for_constant_timing", "0000000000000000", 64);
      const attempt = recordFailedLogin(loginId);
      if (attempt.locked) {
        return NextResponse.json(
          {
            error: `Account temporarily locked due to excessive failed attempts. Please try again in ${attempt.remainingSeconds} seconds.`,
            retryAfter: attempt.remainingSeconds,
          },
          {
            status: 429,
            headers: { "Retry-After": String(attempt.remainingSeconds) },
          }
        );
      }
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/gamertag and password." },
        { status: 401 }
      );
    }

    // 4. Verify password with constant-time comparison
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      const attempt = recordFailedLogin(loginId);
      if (attempt.locked) {
        return NextResponse.json(
          {
            error: `Account temporarily locked due to excessive failed attempts. Please try again in ${attempt.remainingSeconds} seconds.`,
            retryAfter: attempt.remainingSeconds,
          },
          {
            status: 429,
            headers: { "Retry-After": String(attempt.remainingSeconds) },
          }
        );
      }
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/gamertag and password." },
        { status: 401 }
      );
    }

    // 5. Account status verification (Suspended accounts rejected)
    if (user.isSuspended) {
      return NextResponse.json(
        {
          error: "Account suspended: Access has been disabled by platform administration. Please contact support.",
          reason: user.suspendedReason || "Policy violation",
        },
        { status: 403 }
      );
    }

    // Clear failed attempts counter upon verified credentials
    recordSuccessfulLogin(loginId);

    // Track genuine login event
    trackEvent({
      eventType: "user.login",
      category: "auth",
      userId: user.id,
      metadata: { username: user.username },
    });

    // 6. Create session with client metadata
    const sessionToken = createSession(user.id, req);
    const safeUser = toSafeUser(user);

    const response = NextResponse.json(
      { message: "Login successful", user: safeUser },
      { status: 200 }
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
