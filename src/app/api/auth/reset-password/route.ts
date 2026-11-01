import { NextRequest, NextResponse } from "next/server";
import { findUserByResetTokenHash, updateUserPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { hashToken } from "@/lib/security/tokens";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const ipRateLimit = checkRateLimit(`reset-password:ip:${clientIp}`, 10, 15 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many password reset attempts. Please try again later.",
          retryAfter: ipRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { token, newPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "A valid password reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token.trim());
    const user = findUserByResetTokenHash(tokenHash);

    if (!user) {
      return NextResponse.json(
        { error: "Password reset token is invalid, expired, or has already been used." },
        { status: 400 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Cannot reset password: User account is currently suspended." },
        { status: 403 }
      );
    }

    // Update password, clear token, and revoke all active sessions
    updateUserPassword(user.id, newPassword);

    return NextResponse.json(
      {
        message: "Password reset successful. All active sessions have been invalidated. Please log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password. Please try again." },
      { status: 500 }
    );
  }
}

