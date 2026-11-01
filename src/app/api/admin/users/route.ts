import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

const VALID_ROLES = ["player", "developer", "admin"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const users = getAllUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user directory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { action, userId, role } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    if (action === "updateRole") {
      if (!role || !VALID_ROLES.includes(role as ValidRole)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }

      // Self-privilege modification prevention
      if (auth.user.id === userId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify your own administrator role." },
          { status: 403 }
        );
      }

      // Root administrator protection
      if (userId === "kuro_dev_admin_root" && role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Root administrator cannot be demoted." },
          { status: 403 }
        );
      }

      const ok = updateUserRole(userId, role as ValidRole, auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "User not found or role update rejected." }, { status: 400 });
      }

      return NextResponse.json(
        { message: `User role updated to ${role} successfully`, users: getAllUsers() },
        { status: 200 }
      );
    }

    if (action === "deleteUser") {
      // Self-deletion prevention
      if (auth.user.id === userId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot delete your own active administrator account." },
          { status: 403 }
        );
      }

      // Root administrator protection
      if (userId === "kuro_dev_admin_root") {
        return NextResponse.json(
          { error: "Forbidden: Root administrator account cannot be deleted." },
          { status: 403 }
        );
      }

      const ok = deleteUser(userId, auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "User not found or deletion rejected." }, { status: 400 });
      }

      return NextResponse.json(
        { message: "User account deleted successfully", users: getAllUsers() },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
