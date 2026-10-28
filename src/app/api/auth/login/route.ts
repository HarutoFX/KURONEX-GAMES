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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, email, password } = body;
    const loginId = (identifier || email || "").trim();

    if (!loginId) {
      return NextResponse.json(
        { error: "Please provide your email or gamertag." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    // Allow login with either email or gamertag
    let user = findUserByEmail(loginId);
    if (!user) {
      user = findUserByUsername(loginId);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/gamertag and password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/gamertag and password." },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = createSession(user.id);
    const safeUser = toSafeUser(user);

    const response = NextResponse.json(
      { message: "Login successful", user: safeUser },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
