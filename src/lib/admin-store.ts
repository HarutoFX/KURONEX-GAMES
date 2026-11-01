import fs from "fs";
import path from "path";
import { User, SafeUser, toSafeUser } from "./auth";

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
  adminPasskey: string;
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
const DEFAULT_LOGS: AuditLog[] = [
  {
    id: "log_01",
    action: "System Initialization",
    category: "SYSTEM",
    actor: "kuronex_dev",
    target: "Kuronex Core Engine",
    details: "Platform control system booted with encrypted session management.",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "SUCCESS",
  },
  {
    id: "log_02",
    action: "Catalog Sync",
    category: "GAMES",
    actor: "kuronex_dev",
    target: "KX-01 Neon Haven",
    details: "Updated cartridge asset pipeline and live server cluster status.",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "SUCCESS",
  },
  {
    id: "log_03",
    action: "Developer Studio Registered",
    category: "CMS",
    actor: "kuronex_dev",
    target: "CyberForge Dynamics",
    details: "Approved studio onboarding into premier partner directory.",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "SUCCESS",
  },
  {
    id: "log_04",
    action: "Admin Account Verified",
    category: "AUTH",
    actor: "kuronex_dev",
    target: "kuronex_dev",
    details: "Root developer privileges authenticated via security gateway.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "SUCCESS",
  },
];

export function getAuditLogs(): AuditLog[] {
  try {
    ensureFile(AUDIT_FILE, JSON.stringify(DEFAULT_LOGS, null, 2));
    const data = fs.readFileSync(AUDIT_FILE, "utf-8");
    const logs = JSON.parse(data || "[]");
    return logs.sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to read audit logs:", error);
    return DEFAULT_LOGS;
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
    ensureFile(AUDIT_FILE, "[]");
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs.slice(0, 100), null, 2), "utf-8");
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
    ensureFile(ANNOUNCEMENTS_FILE, "[]");
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write announcements:", error);
    return false;
  }
}

export function createAnnouncement(data: Omit<Announcement, "id" | "publishedAt">): Announcement {
  const list = getAnnouncements();
  const created: Announcement = {
    ...data,
    id: `ann_${Date.now()}`,
    publishedAt: new Date().toISOString(),
  };
  list.unshift(created);
  saveAnnouncements(list);
  logAdminAction("Created Announcement", "CMS", created.title, `New announcement broadcasted: ${created.title}`);
  return created;
}

export function toggleAnnouncement(id: string): boolean {
  const list = getAnnouncements();
  const item = list.find((a) => a.id === id);
  if (item) {
    item.isActive = !item.isActive;
    saveAnnouncements(list);
    logAdminAction("Toggle Announcement", "CMS", item.title, `Announcement ${item.title} toggled to ${item.isActive ? "active" : "inactive"}`);
    return true;
  }
  return false;
}

export function deleteAnnouncement(id: string): boolean {
  const list = getAnnouncements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length !== list.length) {
    saveAnnouncements(filtered);
    logAdminAction("Delete Announcement", "CMS", id, `Removed announcement ${id}`);
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
  adminPasskey: "kuronex-admin-2026",
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

export function savePlatformSettings(newSettings: Partial<PlatformSettings>): PlatformSettings {
  const current = getPlatformSettings();
  const updated = { ...current, ...newSettings };
  try {
    ensureFile(SETTINGS_FILE, "[]");
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    logAdminAction("Update Settings", "SETTINGS", "Platform Configuration", "Saved updated system parameters.");
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

export function updateUserRole(userId: string, newRole: "player" | "developer" | "admin"): boolean {
  try {
    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    // Prevent demoting root admin if it's the only one
    if (target.id === "kuro_dev_admin_root" && newRole !== "admin") {
      return false;
    }

    target.role = newRole;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    logAdminAction("Updated User Role", "USERS", target.username, `Role changed to ${newRole}`);
    return true;
  } catch (error) {
    console.error("Failed to update user role:", error);
    return false;
  }
}

export function deleteUser(userId: string): boolean {
  try {
    if (userId === "kuro_dev_admin_root") return false; // Protected root admin

    ensureFile(USERS_FILE, "[]");
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    const target = users.find((u) => u.id === userId);
    const filtered = users.filter((u) => u.id !== userId);

    if (filtered.length !== users.length) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
      logAdminAction("Deleted User Account", "USERS", target?.username || userId, `Removed account permanently from platform registry.`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}
