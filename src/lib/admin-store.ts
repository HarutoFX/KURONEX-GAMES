import crypto from "crypto";
import prisma from "./prisma";
import { SafeUser, revokeAllUserSessions, resolveRoleId } from "./auth";

export interface AuditLog {
  id: string;
  action: string;
  category: "GAMES" | "USERS" | "SYSTEM" | "CMS" | "AUTH" | "SETTINGS";
  actor: string;
  target: string;
  details: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category: "UPDATE" | "MAINTENANCE" | "COMMUNITY" | "PROMOTION";
  isActive: boolean;
  publishedAt: string;
  author: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  clientVersion: string;
  clientDownloadUrl: string;
  supportEmail: string;
  sessionTimeoutDays: number;
  maxUploadSizeMb: number;
  featuredCategory: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: "KURONEX GAMES",
  tagline: "Build Your Own Library.",
  maintenanceMode: false,
  registrationOpen: true,
  clientVersion: "v1.4.2",
  clientDownloadUrl: "/download",
  supportEmail: "support@kuronex.com",
  sessionTimeoutDays: 30,
  maxUploadSizeMb: 120,
  featuredCategory: "Action",
};

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 500,
    });
    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      category: (l.category as AuditLog["category"]) || "SYSTEM",
      actor: l.actorUsername,
      target: l.target,
      details: l.details,
      timestamp: l.timestamp.toISOString(),
      status: (l.status as AuditLog["status"]) || "SUCCESS",
    }));
  } catch (error) {
    console.error("Failed to read audit logs:", error);
    return [];
  }
}

export async function logAdminAction(
  action: string,
  category: AuditLog["category"],
  target: string,
  details: string,
  actor = "system",
  status: AuditLog["status"] = "SUCCESS",
  actorId?: string,
  ipAddress?: string
): Promise<AuditLog> {
  const id = `log_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`;
  try {
    const created = await prisma.auditLog.create({
      data: {
        id,
        action,
        category,
        actorId: actorId || null,
        actorUsername: actor,
        target,
        details,
        status,
        ipAddress: ipAddress || null,
      },
    });

    return {
      id: created.id,
      action: created.action,
      category: created.category as AuditLog["category"],
      actor: created.actorUsername,
      target: created.target,
      details: created.details,
      timestamp: created.timestamp.toISOString(),
      status: created.status as AuditLog["status"],
    };
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return {
      id,
      action,
      category,
      actor,
      target,
      details,
      timestamp: new Date().toISOString(),
      status,
    };
  }
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const list = await prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return list.map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      priority: (a.priority as Announcement["priority"]) || "NORMAL",
      category: (a.category as Announcement["category"]) || "UPDATE",
      isActive: a.isActive,
      publishedAt: a.publishedAt.toISOString(),
      author: a.authorName,
    }));
  } catch (error) {
    console.error("Failed to read announcements:", error);
    return [];
  }
}

export async function createAnnouncement(
  data: Omit<Announcement, "id" | "publishedAt">,
  actor = "system"
): Promise<Announcement> {
  const created = await prisma.announcement.create({
    data: {
      id: `ann_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`,
      title: data.title.trim(),
      message: data.message.trim(),
      priority: data.priority || "NORMAL",
      category: data.category || "UPDATE",
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      authorName: data.author || actor,
    },
  });

  await logAdminAction(
    "Created Announcement",
    "CMS",
    created.title,
    `New announcement broadcasted: ${created.title}`,
    actor
  );

  return {
    id: created.id,
    title: created.title,
    message: created.message,
    priority: created.priority as Announcement["priority"],
    category: created.category as Announcement["category"],
    isActive: created.isActive,
    publishedAt: created.publishedAt.toISOString(),
    author: created.authorName,
  };
}

export async function toggleAnnouncement(id: string, actor = "system"): Promise<boolean> {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) return false;

  const updated = await prisma.announcement.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  await logAdminAction(
    "Toggle Announcement",
    "CMS",
    updated.title,
    `Announcement ${updated.title} toggled to ${updated.isActive ? "active" : "inactive"}`,
    actor
  );
  return true;
}

export async function deleteAnnouncement(id: string, actor = "system"): Promise<boolean> {
  const existing = await prisma.announcement.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!existing) return false;

  await prisma.announcement.delete({ where: { id } });
  await logAdminAction("Delete Announcement", "CMS", existing.title || id, `Removed announcement ${id}`, actor);
  return true;
}

// ─── PLATFORM SETTINGS ──────────────────────────────────────────────────────
export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const rows = await prisma.platformSetting.findMany();
    if (rows.length === 0) return DEFAULT_SETTINGS;

    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if (row.valueType === "boolean") {
        result[row.key] = row.value === "true";
      } else if (row.valueType === "number") {
        const parsed = Number(row.value);
        result[row.key] = Number.isNaN(parsed) ? result[row.key] : parsed;
      } else {
        result[row.key] = row.value;
      }
    }
    return result as unknown as PlatformSettings;
  } catch (error) {
    console.error("Failed to read platform settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function savePlatformSettings(
  newSettings: Partial<PlatformSettings>,
  actor = "system"
): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const updated = { ...current, ...newSettings };

  try {
    const publicKeys = new Set([
      "platformName",
      "tagline",
      "clientVersion",
      "clientDownloadUrl",
      "maintenanceMode",
      "registrationOpen",
      "featuredCategory",
    ]);

    for (const [key, val] of Object.entries(updated)) {
      if (val === undefined) continue;
      const valueType =
        typeof val === "boolean" ? "boolean" : typeof val === "number" ? "number" : "string";
      await prisma.platformSetting.upsert({
        where: { key },
        update: { value: String(val), valueType },
        create: {
          key,
          value: String(val),
          valueType,
          isPublic: publicKeys.has(key),
        },
      });
    }

    await logAdminAction(
      "Update Settings",
      "SETTINGS",
      "Platform Configuration",
      "Saved updated system parameters.",
      actor
    );
  } catch (error) {
    console.error("Failed to write settings:", error);
  }

  return updated;
}

// ─── USER ADMIN OPERATIONS ──────────────────────────────────────────────────
export async function getAllUsers(): Promise<SafeUser[]> {
  try {
    const users = await prisma.user.findMany({
      include: { library: { select: { gameId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      role: u.role,
      library: u.library.map((l) => l.gameId),
      isSuspended: u.isSuspended,
      isEmailVerified: u.isEmailVerified,
    }));
  } catch (error) {
    console.error("Failed to read all users:", error);
    return [];
  }
}

export async function updateUserRole(
  userId: string,
  newRole: string,
  actor = "system"
): Promise<boolean> {
  try {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return false;

    if (
      target.id === "kuro_dev_admin_root" &&
      newRole.toLowerCase() !== "admin" &&
      newRole.toLowerCase() !== "super_admin"
    ) {
      return false;
    }

    const { role, roleId } = await resolveRoleId(newRole);
    await prisma.user.update({
      where: { id: userId },
      data: { role, roleId },
    });

    await logAdminAction(
      "Updated User Role",
      "USERS",
      target.username,
      `Role changed to ${role} by ${actor}`,
      actor
    );
    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
}

export async function suspendUserAccount(
  userId: string,
  suspended: boolean,
  reason = "",
  actor = "system"
): Promise<boolean> {
  try {
    if (userId === "kuro_dev_admin_root") return false;

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return false;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: suspended,
        suspendedReason: suspended ? reason : null,
      },
    });

    if (suspended) {
      await revokeAllUserSessions(userId);
    }

    await logAdminAction(
      suspended ? "Suspended User Account" : "Reactivated User Account",
      "USERS",
      target.username,
      suspended
        ? `Account suspended (${reason || "Policy violation"}) by ${actor}`
        : `Account reactivated by ${actor}`,
      actor
    );
    return true;
  } catch (error) {
    console.error("Failed to suspend user account:", error);
    return false;
  }
}

export async function deleteUser(userId: string, actor = "system"): Promise<boolean> {
  try {
    if (userId === "kuro_dev_admin_root") return false;

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
    if (!target) return false;

    await prisma.user.delete({ where: { id: userId } });
    await logAdminAction(
      "Deleted User Account",
      "USERS",
      target.username || userId,
      `Removed account permanently by ${actor}`,
      actor
    );
    return true;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}
