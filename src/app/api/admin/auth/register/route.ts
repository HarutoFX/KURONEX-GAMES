import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  findUserByUsername,
  createAdminUser,
  createSession,
  validateAdminPasskey,
  SESSION_COOKIE_NAME,
  LEGACY_SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-store";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate limiting: max 15 admin registration attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`admin-register:ip:${clientIp}`, 15, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many administrative registration attempts. Please try again later.",
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { username, email, password, confirmPassword, passkey, role } = body;

    // 1. Mandatory Master Security Passkey Verification
    if (!passkey || !validateAdminPasskey(passkey)) {
      logAdminAction(
        "ADMIN_REGISTER_DENIED",
        "AUTH",
        username || "unknown",
        `Invalid setup passkey attempted from IP: ${clientIp}`,
        "system",
        "FAILED"
      );
      return NextResponse.json(
        { error: "Access Denied: Invalid Master Admin Security Passkey." },
        { status: 403 }
      );
    }

    // 2. Validation
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Admin Gamertag must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length > 30) {
      return NextResponse.json(
        { error: "Admin Gamertag cannot exceed 30 characters." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Admin Gamertag can only contain letters, numbers, underscores, and dashes." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid administrator work email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid administrator work email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Administrator password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password confirmation does not match." },
        { status: 400 }
      );
    }

    // 3. Uniqueness Checks
    if (findUserByEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    if (findUserByUsername(trimmedUsername)) {
      return NextResponse.json(
        { error: "An account with this Gamertag already exists." },
        { status: 409 }
      );
    }

    // 4. Create Dedicated Administrator
    const assignedRole = role === "admin" ? "admin" : "super_admin";
    const newAdmin = createAdminUser({
      username: trimmedUsername,
      email: trimmedEmail,
      password,
      role: assignedRole,
    });

    // 5. Establish Authenticated Session
    const sessionToken = createSession(newAdmin.id, req);

    logAdminAction(
      "ADMIN_PROVISIONED",
      "AUTH",
      newAdmin.id,
      `New ${assignedRole} provisioned: ${newAdmin.username} (${newAdmin.email})`,
      newAdmin.username,
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

    const response = NextResponse.json(
      {
        success: true,
        message: "Administrator account provisioned successfully.",
        user: newAdmin,
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, sessionToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during administrator provisioning." },
      { status: 500 }
    );
  }
}
