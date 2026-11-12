import crypto from "crypto";
import prisma from "@/lib/prisma";
import { DbUser, DbUserRole, DbSession } from "./types";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const UsersRepository = {
  async findById(id: string): Promise<DbUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      salt: user.salt,
      role: user.role as DbUserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },

  async findByEmail(email: string): Promise<DbUser | null> {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      salt: user.salt,
      role: user.role as DbUserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },

  async findByUsername(username: string): Promise<DbUser | null> {
    const lower = username.trim().toLowerCase();
    const candidates = await prisma.user.findMany({ where: { username: { contains: username.trim() } } });
    const user = candidates.find((u) => u.username.toLowerCase() === lower);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      salt: user.salt,
      role: user.role as DbUserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },

  async createUser(params: {
    username: string;
    email: string;
    passwordHash: string;
    salt: string;
    role?: DbUserRole;
  }): Promise<DbUser> {
    const user = await prisma.user.create({
      data: {
        id: `kuro_${crypto.randomBytes(8).toString("hex")}`,
        username: params.username.trim(),
        email: params.email.trim().toLowerCase(),
        passwordHash: params.passwordHash,
        salt: params.salt,
        role: params.role || "player",
        isActive: true,
      },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      salt: user.salt,
      role: user.role as DbUserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  },

  async updateRole(userId: string, newRole: DbUserRole): Promise<DbUser | null> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return null;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      passwordHash: updated.passwordHash,
      salt: updated.salt,
      role: updated.role as DbUserRole,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id: userId } });
      return true;
    } catch {
      return false;
    }
  },

  async getAllUsers(params?: {
    skip?: number;
    limit?: number;
  }): Promise<{ users: DbUser[]; total: number }> {
    const [total, rows] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip: params?.skip || 0,
        take: params?.limit ? Math.min(params.limit, 100) : undefined,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      total,
      users: rows.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        passwordHash: u.passwordHash,
        salt: u.salt,
        role: u.role as DbUserRole,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    };
  },

  async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<DbSession> {
    const token = crypto.randomBytes(32).toString("hex");
    const session = await prisma.session.create({
      data: {
        token,
        userId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      },
    });
    return {
      id: session.id,
      token: session.token,
      userId: session.userId,
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
      expiresAt: session.expiresAt.getTime(),
      createdAt: session.createdAt.toISOString(),
    };
  },

  async findSession(token: string): Promise<DbSession | null> {
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt <= new Date()) return null;
    return {
      id: session.id,
      token: session.token,
      userId: session.userId,
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
      expiresAt: session.expiresAt.getTime(),
      createdAt: session.createdAt.toISOString(),
    };
  },

  async deleteSession(token: string): Promise<boolean> {
    const result = await prisma.session.deleteMany({ where: { token } });
    return result.count > 0;
  },

  async getActiveSessionCount(): Promise<number> {
    return prisma.session.count({ where: { expiresAt: { gt: new Date() } } });
  },
};
