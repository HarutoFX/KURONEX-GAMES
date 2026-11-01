import { NextRequest, NextResponse } from "next/server";
import { requirePermission, findUserById } from "@/lib/auth";
import { getAllUsers, updateUserRole, deleteUser, suspendUserAccount } from "@/lib/admin-store";
import {
  ROLES,
  normalizeRole,
  canAssignRole,
  canMutateUser,
} from "@/lib/security/rbac";

export const dynamic = "force-dynamic";

const VALID_ROLES = ROLES.map((r) => r.toLowerCase());

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("users:read", req);
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
    const body = await req.json().catch(() => ({}));
    const { action, userId, role, suspended, reason } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
    }

    // Resolve target user record to inspect current role
    const targetUser = findUserById(userId);

    // ─── ACTION: UPDATE ROLE ────────────────────────────────────────────────
    if (action === "updateRole") {
      const auth = await requirePermission("users:roles:write", req);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      if (!role || typeof role !== "string") {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }

      const normalizedRole = normalizeRole(role);
      const roleStrLower = normalizedRole.toLowerCase();

      if (!VALID_ROLES.includes(roleStrLower)) {
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
      if (userId === "kuro_dev_admin_root" && roleStrLower !== "admin" && normalizedRole !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Root administrator cannot be demoted." },
          { status: 403 }
        );
      }

      // Role hierarchy check: cannot grant role equal to or higher than own
      if (!canAssignRole(auth.user.role, normalizedRole)) {
        return NextResponse.json(
          { error: "Forbidden: You cannot assign a role equal to or higher than your own." },
          { status: 403 }
        );
      }

      // If target user currently holds a role equal to or higher than actor, reject
      if (targetUser && !canMutateUser(auth.user.role, targetUser.role, auth.user.id, targetUser.id)) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify a user with a role equal to or higher than your own." },
          { status: 403 }
        );
      }

      // Support saving in canonical format
      const ok = updateUserRole(userId, roleStrLower, auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "User not found or role update rejected." }, { status: 400 });
      }

      return NextResponse.json(
        { message: `User role updated to ${role} successfully`, users: getAllUsers() },
        { status: 200 }
      );
    }

    // ─── ACTION: DELETE USER ────────────────────────────────────────────────
    if (action === "deleteUser") {
      const auth = await requirePermission("users:delete", req);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

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

      // Role hierarchy check
      if (targetUser && !canMutateUser(auth.user.role, targetUser.role, auth.user.id, targetUser.id)) {
        return NextResponse.json(
          { error: "Forbidden: You cannot delete a user with a role equal to or higher than your own." },
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

    // ─── ACTION: SUSPEND USER ───────────────────────────────────────────────
    if (action === "suspendUser") {
      const auth = await requirePermission("users:suspend", req);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      // Self-suspension prevention
      if (auth.user.id === userId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot suspend your own administrator account." },
          { status: 403 }
        );
      }

      // Root administrator protection
      if (userId === "kuro_dev_admin_root") {
        return NextResponse.json(
          { error: "Forbidden: Root administrator account cannot be suspended." },
          { status: 403 }
        );
      }

      // Role hierarchy check
      if (targetUser && !canMutateUser(auth.user.role, targetUser.role, auth.user.id, targetUser.id)) {
        return NextResponse.json(
          { error: "Forbidden: You cannot suspend a user with a role equal to or higher than your own." },
          { status: 403 }
        );
      }

      const isSuspended = typeof suspended === "boolean" ? suspended : true;
      const ok = suspendUserAccount(userId, isSuspended, typeof reason === "string" ? reason : "", auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "User not found or suspension rejected." }, { status: 400 });
      }

      return NextResponse.json(
        {
          message: isSuspended ? "User account suspended and all active sessions revoked." : "User account reactivated successfully.",
          users: getAllUsers(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
