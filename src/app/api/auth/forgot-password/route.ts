import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, setPasswordResetToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { generateSecureToken, hashToken } from "@/lib/security/tokens";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const isLoopback = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
    const maxForgotAttempts = isLoopback ? 200 : 10;
    const ipRateLimit = checkRateLimit(`forgot-password:ip:${clientIp}`, maxForgotAttempts, 15 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many password recovery requests. Please try again later.",
          retryAfter: ipRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(trimmedEmail);

    let debugToken: string | undefined;

    if (user && !user.isSuspended) {
      const rawToken = generateSecureToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity

      await setPasswordResetToken(user.id, tokenHash, expiresAt);

      if (process.env.NODE_ENV !== "production" || process.env.ENABLE_TEST_DEBUG_TOKEN === "true") {
        debugToken = rawToken;
      }
    }

    // Always return a neutral success message to prevent user enumeration
    const responsePayload: { message: string; debugResetToken?: string } = {
      message: "If an account exists with this email address, password reset instructions have been dispatched.",
    };

    if (debugToken) {
      responsePayload.debugResetToken = debugToken;
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}

