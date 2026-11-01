import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getActiveSessionCount, getGameLibraryStats } from "@/lib/auth";
import { getTotalDownloadCount, getPlatformDownloadStats } from "@/lib/download-store";
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
  PlatformSettings,
  Announcement,
} from "@/lib/admin-store";
import { getLibraryGames, getDevelopers } from "@/lib/library-store";
import { GAMES_DATA } from "@/lib/games";

export const dynamic = "force-dynamic";

const ALLOWED_SETTINGS_KEYS: (keyof PlatformSettings)[] = [
  "platformName",
  "tagline",
  "maintenanceMode",
  "registrationOpen",
  "clientVersion",
  "clientDownloadUrl",
  "supportEmail",
  "sessionTimeoutDays",
  "maxUploadSizeMb",
  "featuredCategory",
];

const VALID_PRIORITIES: Announcement["priority"][] = ["LOW", "NORMAL", "HIGH", "URGENT"];
const VALID_CATEGORIES: Announcement["category"][] = ["UPDATE", "MAINTENANCE", "COMMUNITY", "PROMOTION"];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const logs = getAuditLogs();
    const announcements = getAnnouncements();
    const settings = getPlatformSettings();
    const users = getAllUsers();
    const librarySlots = getLibraryGames();
    const developers = getDevelopers();

    const totalDownloads = getTotalDownloadCount();
    const platformDownloads = getPlatformDownloadStats();
    const gameLibraryStats = getGameLibraryStats();
    const activeSessions = getActiveSessionCount();

    const metrics = {
      totalUsers: users.length,
      activeUsers: activeSessions,
      totalGames: GAMES_DATA.length + librarySlots.filter((s) => !s.isEmpty).length,
      totalDownloads,
      platformDownloads,
      gameLibraryStats,
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
  } catch (error) {
    console.error("Admin system GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve platform telemetry" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "updateSettings") {
      const incoming = body.settings;
      if (!incoming || typeof incoming !== "object") {
        return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
      }

      // Whitelist and sanitize incoming settings
      const sanitized: Partial<PlatformSettings> = {};
      for (const key of ALLOWED_SETTINGS_KEYS) {
        if (key in incoming) {
          (sanitized as Record<string, unknown>)[key] = incoming[key];
        }
      }

      const updated = savePlatformSettings(sanitized, auth.user.username);
      return NextResponse.json({ message: "Settings updated successfully", settings: updated }, { status: 200 });
    }

    if (action === "createAnnouncement") {
      const ann = body.announcement;
      if (!ann || typeof ann !== "object") {
        return NextResponse.json({ error: "Invalid announcement payload" }, { status: 400 });
      }

      const title = typeof ann.title === "string" ? ann.title.trim() : "";
      const message = typeof ann.message === "string" ? ann.message.trim() : "";
      const priority = VALID_PRIORITIES.includes(ann.priority) ? ann.priority : "NORMAL";
      const category = VALID_CATEGORIES.includes(ann.category) ? ann.category : "UPDATE";

      if (title.length < 3 || title.length > 150) {
        return NextResponse.json({ error: "Announcement title must be between 3 and 150 characters" }, { status: 400 });
      }

      if (message.length < 3 || message.length > 2000) {
        return NextResponse.json({ error: "Announcement message must be between 3 and 2000 characters" }, { status: 400 });
      }

      // Enforce author identity from authenticated session to prevent spoofing
      createAnnouncement(
        {
          title,
          message,
          priority,
          category,
          isActive: Boolean(ann.isActive),
          author: auth.user.username,
        },
        auth.user.username
      );

      return NextResponse.json(
        { message: "Announcement broadcasted successfully", announcements: getAnnouncements() },
        { status: 201 }
      );
    }

    if (action === "toggleAnnouncement") {
      if (!body.id || typeof body.id !== "string") {
        return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
      }
      const ok = toggleAnnouncement(body.id, auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
      }
      return NextResponse.json(
        { message: "Announcement status updated", announcements: getAnnouncements() },
        { status: 200 }
      );
    }

    if (action === "deleteAnnouncement") {
      if (!body.id || typeof body.id !== "string") {
        return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
      }
      const ok = deleteAnnouncement(body.id, auth.user.username);
      if (!ok) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
      }
      return NextResponse.json(
        { message: "Announcement removed", announcements: getAnnouncements() },
        { status: 200 }
      );
    }

    if (action === "logAction") {
      const actionName = typeof body.actionName === "string" ? body.actionName.trim() : "Custom Action";
      const category = body.category || "SYSTEM";
      const target = typeof body.target === "string" ? body.target.trim() : "Console";
      const details = typeof body.details === "string" ? body.details.trim() : "";

      const log = logAdminAction(actionName, category, target, details, auth.user.username);
      return NextResponse.json({ message: "Action logged", log }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin system action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
