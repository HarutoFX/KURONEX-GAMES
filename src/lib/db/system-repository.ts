import {
  getAuditLogs,
  logAdminAction,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getPlatformSettings,
  savePlatformSettings,
} from "@/lib/admin-store";
import { DbAuditLog, DbAnnouncement, DbPlatformSettings } from "./types";

export const SystemRepository = {
  async getAuditLogs(params?: { limit?: number; category?: string }): Promise<DbAuditLog[]> {
    let logs = await getAuditLogs();
    if (params?.category) {
      logs = logs.filter((l) => l.category === params.category);
    }
    return logs.slice(0, params?.limit || 100).map((l) => ({
      id: l.id,
      action: l.action,
      category: l.category,
      actorUsername: l.actor,
      target: l.target,
      details: l.details,
      status: l.status,
      timestamp: l.timestamp,
    }));
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
    const created = await logAdminAction(
      params.action,
      params.category,
      params.target,
      params.details,
      params.actorUsername,
      params.status || "SUCCESS",
      undefined,
      params.ipAddress
    );
    return {
      id: created.id,
      action: created.action,
      category: created.category,
      actorUsername: created.actor,
      target: created.target,
      details: created.details,
      status: created.status,
      ipAddress: params.ipAddress,
      timestamp: created.timestamp,
    };
  },

  async getAnnouncements(onlyActive = false): Promise<DbAnnouncement[]> {
    const list = await getAnnouncements();
    const filtered = onlyActive ? list.filter((a) => a.isActive) : list;
    return filtered.map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      priority: a.priority,
      category: a.category,
      isActive: a.isActive,
      authorName: a.author,
      publishedAt: a.publishedAt,
      updatedAt: a.publishedAt,
    }));
  },

  async createAnnouncement(params: {
    title: string;
    message: string;
    priority: DbAnnouncement["priority"];
    category: DbAnnouncement["category"];
    isActive?: boolean;
    authorName?: string;
  }): Promise<DbAnnouncement> {
    const created = await createAnnouncement(
      {
        title: params.title,
        message: params.message,
        priority: params.priority,
        category: params.category,
        isActive: params.isActive !== undefined ? params.isActive : true,
        author: params.authorName || "system",
      },
      params.authorName || "system"
    );
    return {
      id: created.id,
      title: created.title,
      message: created.message,
      priority: created.priority,
      category: created.category,
      isActive: created.isActive,
      authorName: created.author,
      publishedAt: created.publishedAt,
      updatedAt: created.publishedAt,
    };
  },

  async toggleAnnouncement(id: string): Promise<DbAnnouncement | null> {
    const ok = await toggleAnnouncement(id);
    if (!ok) return null;
    const all = await this.getAnnouncements();
    return all.find((a) => a.id === id) || null;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    return deleteAnnouncement(id);
  },

  async getSettings(): Promise<DbPlatformSettings> {
    return getPlatformSettings();
  },

  async saveSettings(newSettings: Partial<DbPlatformSettings>): Promise<DbPlatformSettings> {
    return savePlatformSettings(newSettings);
  },
};
