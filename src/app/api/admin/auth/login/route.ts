import { NextRequest, NextResponse } from "next/server";
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
import { isAdminRole } from "@/lib/security/rbac";
import {
  checkRateLimit,
  getClientIp,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/security/rate-limiter";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // IP rate limiting
    const ipRateLimit = checkRateLimit(`admin-login:ip:${clientIp}`, 30, 15 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many administrative login attempts. Please try again later.",
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
        { error: "Please enter your administrator email or Gamertag." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Please enter your administrator password." },
        { status: 400 }
      );
    }

    // Account lockout protection
    const lockout = isAccountLocked(loginId);
    if (lockout.locked) {
      return NextResponse.json(
        {
          error: `Administrator account temporarily locked. Please try again in ${lockout.remainingSeconds} seconds.`,
          retryAfter: lockout.remainingSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(lockout.remainingSeconds) },
        }
      );
    }

    let user = findUserByEmail(loginId);
    if (!user) {
      user = findUserByUsername(loginId);
    }

    if (!user) {
      recordFailedLogin(loginId);
      return NextResponse.json(
        { error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Verify Administrative Role
    if (!isAdminRole(user.role)) {
      recordFailedLogin(loginId);
      logAdminAction(
        "ADMIN_LOGIN_UNAUTHORIZED_ROLE",
        "AUTH",
        user.id,
        `Non-admin account '${user.username}' attempted admin portal access from IP: ${clientIp}`,
        user.username,
        "WARNING"
      );
      return NextResponse.json(
        { error: "Access Denied: This account does not possess administrative privileges." },
        { status: 403 }
      );
    }

    // Verify Password
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      const remainingAttempts = recordFailedLogin(loginId);
      logAdminAction(
        "ADMIN_LOGIN_FAILED",
        "AUTH",
        user.id,
        `Failed password attempt for admin: ${user.username} from IP: ${clientIp}`,
        user.username,
        "FAILED"
      );
      return NextResponse.json(
        {
          error: `Invalid administrator credentials. ${remainingAttempts} attempts remaining before temporary lockout.`,
        },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "This administrative account has been suspended by system security." },
        { status: 403 }
      );
    }

    recordSuccessfulLogin(loginId);

    const sessionToken = createSession(user.id, req);

    logAdminAction(
      "ADMIN_LOGIN_SUCCESS",
      "AUTH",
      user.id,
      `Administrator authenticated: ${user.username} (${user.role}) from IP: ${clientIp}`,
      user.username,
      "SUCCESS"
    );

    const isSecure = process.env.NODE_ENV === "production";
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax" as const,
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    };

    const safeUser = toSafeUser(user);
    const response = NextResponse.json(
      {
        success: true,
        message: "Administrator authenticated successfully.",
        user: safeUser,
      },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, sessionToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during administrator authentication." },
      { status: 500 }
    );
  }
}
