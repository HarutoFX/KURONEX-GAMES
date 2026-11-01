import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "kuronex-admin-2026";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey && headerKey === ADMIN_PASSKEY) {
    return true;
  }
  const user = await getCurrentUser();
  if (user && user.role === "admin") {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
  }

  const users = getAllUsers();
  return NextResponse.json({ users }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const { action, userId, role } = body;

    if (action === "updateRole" && userId && role) {
      const ok = updateUserRole(userId, role);
      if (!ok) {
        return NextResponse.json({ error: "Failed to update role. Root admin is protected." }, { status: 400 });
      }
      return NextResponse.json({ message: "User role updated successfully", users: getAllUsers() }, { status: 200 });
    }

    if (action === "deleteUser" && userId) {
      const ok = deleteUser(userId);
      if (!ok) {
        return NextResponse.json({ error: "Failed to delete user. Root admin is protected." }, { status: 400 });
      }
      return NextResponse.json({ message: "User account deleted successfully", users: getAllUsers() }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
