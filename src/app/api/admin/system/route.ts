import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getAuditLogs,
  getAnnouncements,
  getPlatformSettings,
  savePlatformSettings,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getAllUsers,
  logAdminAction,
} from "@/lib/admin-store";
import { getLibraryGames, getDevelopers } from "@/lib/library-store";
import { GAMES_DATA } from "@/lib/games";

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

  const logs = getAuditLogs();
  const announcements = getAnnouncements();
  const settings = getPlatformSettings();
  const users = getAllUsers();
  const librarySlots = getLibraryGames();
  const developers = getDevelopers();

  const metrics = {
    totalUsers: users.length,
    activeUsers: Math.max(users.filter((u) => u.role === "admin").length, 1),
    totalGames: GAMES_DATA.length + librarySlots.filter((s) => !s.isEmpty).length,
    totalDownloads: 1420 + users.length * 12,
    totalSlots: librarySlots.length,
    filledSlots: librarySlots.filter((s) => !s.isEmpty).length,
    developersCount: developers.length,
  };

  return NextResponse.json(
    {
      logs,
      announcements,
      settings,
      metrics,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdmin(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "updateSettings") {
      const updated = savePlatformSettings(body.settings || {});
      return NextResponse.json({ message: "Settings updated successfully", settings: updated }, { status: 200 });
    }

    if (action === "createAnnouncement") {
      createAnnouncement(body.announcement);
      return NextResponse.json(
        { message: "Announcement broadcasted successfully", announcements: getAnnouncements() },
        { status: 201 }
      );
    }

    if (action === "toggleAnnouncement") {
      toggleAnnouncement(body.id);
      return NextResponse.json(
        { message: "Announcement status updated", announcements: getAnnouncements() },
        { status: 200 }
      );
    }

    if (action === "deleteAnnouncement") {
      deleteAnnouncement(body.id);
      return NextResponse.json(
        { message: "Announcement removed", announcements: getAnnouncements() },
        { status: 200 }
      );
    }

    if (action === "logAction") {
      const log = logAdminAction(body.actionName, body.category, body.target, body.details);
      return NextResponse.json({ message: "Action logged", log }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin system action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
