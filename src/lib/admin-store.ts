import fs from "fs";
import path from "path";
import { User, SafeUser, toSafeUser, revokeAllUserSessions } from "./auth";
import { atomicWriteJsonSync } from "./db/atomic-store";

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

const AUDIT_FILE = path.join(process.cwd(), "src", "data", "audit-logs.json");
const ANNOUNCEMENTS_FILE = path.join(process.cwd(), "src", "data", "announcements.json");
const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "platform-settings.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");

function ensureFile(filePath: string, defaultContent: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf-8");
  }
}

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────
export function getAuditLogs(): AuditLog[] {
  try {
    ensureFile(AUDIT_FILE, "[]");
    const data = fs.readFileSync(AUDIT_FILE, "utf-8");
    const logs = JSON.parse(data || "[]");
    return Array.isArray(logs)
      ? logs.sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : [];
  } catch (error) {
    console.error("Failed to read audit logs:", error);
    return [];
  }
}

export function logAdminAction(
  action: string,
  category: AuditLog["category"],
  target: string,
  details: string,
  actor = "kuronex_dev",
  status: AuditLog["status"] = "SUCCESS"
): AuditLog {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log_${Date.now()}`,
    action,
    category,
    actor,
    target,
    details,
    timestamp: new Date().toISOString(),
    status,
  };
  logs.unshift(newLog);
  try {
    atomicWriteJsonSync(AUDIT_FILE, logs.slice(0, 500));
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
  return newLog;
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_01",
    title: "Kuronex Alpha Client v1.4.2 Deployed",
    message: "New direct-to-metal rendering backend enabled for Windows and Linux installations.",
    priority: "HIGH",
    category: "UPDATE",
    isActive: true,
    publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    author: "kuronex_dev",
  },
  {
    id: "ann_02",
    title: "Global Playtest Weekend Commencing",
    message: "Servers for Voidstrike: Infinite and Neon Haven open for unrestricted stress testing.",
    priority: "NORMAL",
    category: "COMMUNITY",
    isActive: true,
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: "kuronex_dev",
  },
  {
    id: "ann_03",
    title: "Scheduled Cloud Save Maintenance",
    message: "Database indexing scheduled for Tuesday at 03:00 UTC. Zero downtime anticipated.",
    priority: "LOW",
    category: "MAINTENANCE",
    isActive: false,
    publishedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    author: "kuronex_dev",
  },
];

export function getAnnouncements(): Announcement[] {
  try {
    ensureFile(ANNOUNCEMENTS_FILE, JSON.stringify(DEFAULT_ANNOUNCEMENTS, null, 2));
    const data = fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Failed to read announcements:", error);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveAnnouncements(announcements: Announcement[]): boolean {
  try {
    atomicWriteJsonSync(ANNOUNCEMENTS_FILE, announcements);
    return true;
  } catch (error) {
    console.error("Failed to write announcements:", error);
    return false;
  }
}

export function createAnnouncement(data: Omit<Announcement, "id" | "publishedAt">, actor = "system"): Announcement {
  const list = getAnnouncements();
  const created: Announcement = {
    ...data,
    id: `ann_${Date.now()}`,
    publishedAt: new Date().toISOString(),
  };
  list.unshift(created);
  saveAnnouncements(list);
  logAdminAction("Created Announcement", "CMS", created.title, `New announcement broadcasted: ${created.title}`, actor);
  return created;
}

export function toggleAnnouncement(id: string, actor = "system"): boolean {
  const list = getAnnouncements();
  const item = list.find((a) => a.id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveAnnouncements(list);
    logAdminAction("Toggle Announcement", "CMS", item.title, `Announcement ${item.title} toggled to ${item.isActive ? "active" : "inactive"}`, actor);
    return true;
  }
  return false;
}

export function deleteAnnouncement(id: string, actor = "system"): boolean {
  const list = getAnnouncements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length !== list.length) {
    saveAnnouncements(filtered);
    logAdminAction("Delete Announcement", "CMS", id, `Removed announcement ${id}`, actor);
    return true;
  }
  return false;
}

// ─── PLATFORM SETTINGS ──────────────────────────────────────────────────────
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

export function getPlatformSettings(): PlatformSettings {
  try {
    ensureFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data || "{}") };
  } catch (error) {
    console.error("Failed to read platform settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function savePlatformSettings(newSettings: Partial<PlatformSettings>, actor = "system"): PlatformSettings {
  const current = getPlatformSettings();
  const updated = { ...current, ...newSettings };
  try {
    atomicWriteJsonSync(SETTINGS_FILE, updated);
    logAdminAction("Update Settings", "SETTINGS", "Platform Configuration", "Saved updated system parameters.", actor);
  } catch (error) {
    console.error("Failed to write settings:", error);
  }
  return updated;
}

// ─── USER ADMIN OPERATIONS ──────────────────────────────────────────────────
export function getAllUsers(): SafeUser[] {
  try {
    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    return users.map(toSafeUser);
  } catch (error) {
    console.error("Failed to read all users:", error);
    return [];
  }
}

export function updateUserRole(userId: string, newRole: string, actor = "system"): boolean {
  try {
    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    // Prevent demoting root admin if it's the only one
    if (target.id === "kuro_dev_admin_root" && newRole !== "admin" && newRole !== "SUPER_ADMIN") {
      return false;
    }

    target.role = newRole;
    atomicWriteJsonSync(USERS_FILE, users);
    logAdminAction("Updated User Role", "USERS", target.username, `Role changed to ${newRole} by ${actor}`, actor);
    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
}

export function suspendUserAccount(userId: string, suspended: boolean, reason = "", actor = "system"): boolean {
  try {
    if (userId === "kuro_dev_admin_root") return false; // Protected root admin cannot be suspended

    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    target.isSuspended = suspended;
    target.suspendedReason = suspended ? reason : undefined;
    atomicWriteJsonSync(USERS_FILE, users);

    // Invalidate all active sessions immediately upon suspension
    if (suspended) {
      revokeAllUserSessions(userId);
    }

    logAdminAction(
      suspended ? "Suspended User Account" : "Reactivated User Account",
      "USERS",
      target.username,
      suspended ? `Account suspended (${reason || "Policy violation"}) by ${actor}` : `Account reactivated by ${actor}`,
      actor
    );
    return true;
  } catch (error) {
    console.error("Failed to suspend user account:", error);
    return false;
  }
}

export function deleteUser(userId: string, actor = "system"): boolean {
  try {
    if (userId === "kuro_dev_admin_root") return false; // Protected root admin

    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    const target = users.find((u) => u.id === userId);
    const filtered = users.filter((u) => u.id !== userId);

    if (filtered.length !== users.length) {
      atomicWriteJsonSync(USERS_FILE, filtered);
      logAdminAction("Deleted User Account", "USERS", target?.username || userId, `Removed account permanently by ${actor}`, actor);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}

