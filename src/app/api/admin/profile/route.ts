import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, updateAdminProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/security/rbac";
import { logAdminAction } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator session required." },
        { status: 401 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Admin profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve administrator profile." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !isAdminRole(currentUser.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator session required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { username, email, currentPassword, newPassword } = body;

    const result = updateAdminProfile(currentUser.id, {
      username,
      email,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      logAdminAction(
        "ADMIN_PROFILE_UPDATE_FAILED",
        "SETTINGS",
        currentUser.id,
        result.error || "Profile update validation failed",
        currentUser.username,
        "FAILED"
      );
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logAdminAction(
      "ADMIN_PROFILE_UPDATED",
      "SETTINGS",
      currentUser.id,
      `Administrator credentials updated for: ${result.user?.username} (${result.user?.email})`,
      result.user?.username || currentUser.username,
      "SUCCESS"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Administrator credentials updated successfully.",
        user: result.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update administrator credentials." },
      { status: 500 }
    );
  }
}
