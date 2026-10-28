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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // 1. Validation
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Gamertag must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
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
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: "This gamertag is already claimed. Please choose another." },
        { status: 409 }
      );
    }

    // 3. Create User & Session
    const user = createUser({ username, email, password });
    const sessionToken = createSession(user.id);

    // 4. Return user & set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
