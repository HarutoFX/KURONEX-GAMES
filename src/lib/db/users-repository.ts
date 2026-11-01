import path from "path";
import crypto from "crypto";
import { DbUser, DbSession } from "./types";
import { safeReadJsonSync, atomicWriteJsonSync } from "./atomic-store";

const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");
const SESSIONS_FILE = path.join(process.cwd(), "src", "data", "sessions.json");
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readUsers(): DbUser[] {
  return safeReadJsonSync<DbUser[]>(USERS_FILE, []);
}

function writeUsers(users: DbUser[]): void {
  atomicWriteJsonSync(USERS_FILE, users);
}

function readSessions(): DbSession[] {
  return safeReadJsonSync<DbSession[]>(SESSIONS_FILE, []);
}

function writeSessions(sessions: DbSession[]): void {
  atomicWriteJsonSync(SESSIONS_FILE, sessions);
}

export const UsersRepository = {
  async findById(id: string): Promise<DbUser | null> {
    const users = readUsers();
    return users.find((u) => u.id === id) || null;
  },

  async findByEmail(email: string): Promise<DbUser | null> {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findByUsername(username: string): Promise<DbUser | null> {
    const normalized = username.trim().toLowerCase();
    const users = readUsers();
    return users.find((u) => u.username.toLowerCase() === normalized) || null;
  },

  async createUser(params: {
    username: string;
    email: string;
    passwordHash: string;
    salt: string;
    role?: "player" | "developer" | "admin";
  }): Promise<DbUser> {
    const users = readUsers();
    const newUser: DbUser = {
      id: `kuro_${crypto.randomBytes(8).toString("hex")}`,
      username: params.username.trim(),
      email: params.email.trim().toLowerCase(),
      passwordHash: params.passwordHash,
      salt: params.salt,
      role: params.role || "player",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);
    return newUser;
  },

  async updateRole(
    userId: string,
    newRole: "player" | "developer" | "admin"
  ): Promise<DbUser | null> {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      role: newRole,
      updatedAt: new Date().toISOString(),
    };

    writeUsers(users);
    return users[index];
  },

  async deleteUser(userId: string): Promise<boolean> {
    const users = readUsers();
    const filtered = users.filter((u) => u.id !== userId);
    if (filtered.length === users.length) return false;

    writeUsers(filtered);

    // Cascade delete user sessions
    const sessions = readSessions().filter((s) => s.userId !== userId);
    writeSessions(sessions);

    return true;
  },

  async getAllUsers(params?: {
    skip?: number;
    limit?: number;
  }): Promise<{ users: DbUser[]; total: number }> {
    const users = readUsers();
    const total = users.length;
    const skip = params?.skip || 0;
    const limit = params?.limit ? Math.min(params.limit, 100) : total;

    return {
      users: users.slice(skip, skip + limit),
      total,
    };
  },

  // ─── SESSIONS ─────────────────────────────────────────────────────────────
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<DbSession> {
    const sessions = readSessions();
    const token = crypto.randomBytes(32).toString("hex");
    const newSession: DbSession = {
      id: `sess_${crypto.randomBytes(8).toString("hex")}`,
      token,
      userId,
      ipAddress,
      userAgent,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: new Date().toISOString(),
    };

    sessions.push(newSession);
    writeSessions(sessions);
    return newSession;
  },

  async findSession(token: string): Promise<DbSession | null> {
    if (!token) return null;
    const sessions = readSessions();
    const now = Date.now();
    const session = sessions.find((s) => s.token === token);

    if (!session || session.expiresAt <= now) {
      return null;
    }
    return session;
  },

  async deleteSession(token: string): Promise<boolean> {
    const sessions = readSessions();
    const filtered = sessions.filter((s) => s.token !== token);
    if (filtered.length === sessions.length) return false;

    writeSessions(filtered);
    return true;
  },

  async getActiveSessionCount(): Promise<number> {
    const sessions = readSessions();
    const now = Date.now();
    const active = sessions.filter((s) => s.expiresAt > now);
    return active.length;
  },
};
