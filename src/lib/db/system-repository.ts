import path from "path";
import { DbAuditLog, DbAnnouncement, DbPlatformSettings } from "./types";
import { safeReadJsonSync, atomicWriteJsonSync } from "./atomic-store";

const AUDIT_FILE = path.join(process.cwd(), "src", "data", "audit-logs.json");
const ANNOUNCEMENTS_FILE = path.join(process.cwd(), "src", "data", "announcements.json");
const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "platform-settings.json");

const DEFAULT_SETTINGS: DbPlatformSettings = {
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

function readAuditLogs(): DbAuditLog[] {
  return safeReadJsonSync<DbAuditLog[]>(AUDIT_FILE, []);
}

function writeAuditLogs(logs: DbAuditLog[]): void {
  atomicWriteJsonSync(AUDIT_FILE, logs);
}

function readAnnouncements(): DbAnnouncement[] {
  return safeReadJsonSync<DbAnnouncement[]>(ANNOUNCEMENTS_FILE, []);
}

function writeAnnouncements(ann: DbAnnouncement[]): void {
  atomicWriteJsonSync(ANNOUNCEMENTS_FILE, ann);
}

function readSettings(): DbPlatformSettings {
  return safeReadJsonSync<DbPlatformSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

function writeSettings(settings: DbPlatformSettings): void {
  atomicWriteJsonSync(SETTINGS_FILE, settings);
}

export const SystemRepository = {
  // ─── AUDIT LOGGING ────────────────────────────────────────────────────────
  async getAuditLogs(params?: {
    limit?: number;
    category?: string;
  }): Promise<DbAuditLog[]> {
    let logs = readAuditLogs();
    if (params?.category) {
      logs = logs.filter((l) => l.category === params.category);
    }
    const limit = params?.limit || 100;
    return logs.slice(0, limit);
  },

  async logAction(params: {
    action: string;
    category: DbAuditLog["category"];
    actorUsername: string;
    target: string;
    details: string;
    status?: DbAuditLog["status"];
    ipAddress?: string;
  }): Promise<DbAuditLog> {
    const logs = readAuditLogs();
    const newLog: DbAuditLog = {
      id: `log_${Date.now()}`,
      action: params.action,
      category: params.category,
      actorUsername: params.actorUsername || "system",
      target: params.target,
      details: params.details,
      status: params.status || "SUCCESS",
      ipAddress: params.ipAddress,
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newLog);
    // Keep max 2000 logs to maintain fast read performance
    if (logs.length > 2000) {
      logs.length = 2000;
    }

    writeAuditLogs(logs);
    return newLog;
  },

  // ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────
  async getAnnouncements(onlyActive = false): Promise<DbAnnouncement[]> {
    const announcements = readAnnouncements();
    if (onlyActive) {
      return announcements.filter((a) => a.isActive);
    }
    return announcements;
  },

  async createAnnouncement(params: {
    title: string;
    message: string;
    priority: DbAnnouncement["priority"];
    category: DbAnnouncement["category"];
    isActive?: boolean;
    authorName?: string;
  }): Promise<DbAnnouncement> {
    const announcements = readAnnouncements();
    const newAnn: DbAnnouncement = {
      id: `ann_${Date.now()}`,
      title: params.title.trim(),
      message: params.message.trim(),
      priority: params.priority || "NORMAL",
      category: params.category || "UPDATE",
      isActive: params.isActive !== undefined ? params.isActive : true,
      authorName: params.authorName || "kuronex_dev",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    announcements.unshift(newAnn);
    writeAnnouncements(announcements);
    return newAnn;
  },

  async toggleAnnouncement(id: string): Promise<DbAnnouncement | null> {
    const announcements = readAnnouncements();
    const index = announcements.findIndex((a) => a.id === id);
    if (index === -1) return null;

    announcements[index] = {
      ...announcements[index],
      isActive: !announcements[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    writeAnnouncements(announcements);
    return announcements[index];
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    const announcements = readAnnouncements();
    const filtered = announcements.filter((a) => a.id !== id);
    if (filtered.length === announcements.length) return false;

    writeAnnouncements(filtered);
    return true;
  },

  // ─── PLATFORM SETTINGS ────────────────────────────────────────────────────
  async getSettings(): Promise<DbPlatformSettings> {
    return readSettings();
  },

  async saveSettings(
    newSettings: Partial<DbPlatformSettings>
  ): Promise<DbPlatformSettings> {
    const current = readSettings();
    const merged: DbPlatformSettings = {
      ...current,
      ...newSettings,
    };

    writeSettings(merged);
    return merged;
  },
};
