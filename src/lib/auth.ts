import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { atomicWriteJsonSync } from "./db/atomic-store";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  role: "player" | "developer" | "admin";
  library?: string[];
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: "player" | "developer" | "admin";
  library: string[];
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

const DB_FILE = path.join(process.cwd(), "src", "data", "users.json");
const SESSIONS_FILE = path.join(process.cwd(), "src", "data", "sessions.json");
const SESSION_COOKIE_NAME = "kuronex_session";
const LEGACY_SESSION_COOKIE_NAME = "vyomera_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Database Persistence Helpers ───────────────────────────────────────────
function ensureFile(filePath: string, defaultContent: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, "utf-8");
  }
}

// Safe development-only administrator provisioning
function provisionDevAdminIfNeeded(users: User[]): boolean {
  // In production, automatic administrator provisioning is strictly forbidden
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  // Check if an administrator already exists
  const hasAdmin = users.some((u) => u.role === "admin");
  if (hasAdmin) return false;

  const devUsername = process.env.DEV_ADMIN_USERNAME || "kuronex_dev";
  const devEmail = process.env.DEV_ADMIN_EMAIL || "dev.admin@kuronex.internal";
  let devPassword = process.env.DEV_ADMIN_PASSWORD;

  if (!devPassword) {
    devPassword = crypto.randomBytes(16).toString("hex") + "!K1";
    console.warn(`\n[DEV SECURITY] Provisioned local development administrator:`);
    console.warn(`  Username: ${devUsername}`);
    console.warn(`  Email:    ${devEmail}`);
    console.warn(`  Password: ${devPassword}`);
    console.warn(`  (Set DEV_ADMIN_PASSWORD in .env.local to customize)\n`);
  }

  const { hash, salt } = hashPassword(devPassword);
  const devAdmin: User = {
    id: "kuro_dev_admin_root",
    username: devUsername,
    email: devEmail,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    role: "admin",
  };

  users.unshift(devAdmin);
  return true;
}

function readUsers(): User[] {
  try {
    ensureFile(DB_FILE, "[]");
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const users: User[] = JSON.parse(data || "[]");
    if (provisionDevAdminIfNeeded(users)) {
      writeUsers(users);
    }
    return users;
  } catch (err) {
    console.error("Failed to read users database:", err);
    return [];
  }
}

function writeUsers(users: User[]) {
  atomicWriteJsonSync(DB_FILE, users);
}

function readSessions(): Session[] {
  try {
    ensureFile(SESSIONS_FILE, "[]");
    const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read sessions database:", err);
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  atomicWriteJsonSync(SESSIONS_FILE, sessions);
}

// ─── Password Cryptography ──────────────────────────────────────────────────
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const checkHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(checkHash, "hex"));
  } catch {
    return false;
  }
}

// ─── User Management ────────────────────────────────────────────────────────
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    role: user.role,
    library: Array.isArray(user.library) ? user.library : [],
  };
}

export function findUserByEmail(email: string): User | undefined {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserByUsername(username: string): User | undefined {
  const users = readUsers();
  return users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find((u) => u.id === id);
}

export function createUser(data: { username: string; email: string; password: string }): SafeUser {
  const users = readUsers();
  const { hash, salt } = hashPassword(data.password);

  const newUser: User = {
    id: `kuro_${crypto.randomBytes(8).toString("hex")}`,
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    role: "player",
    library: [],
  };

  users.push(newUser);
  writeUsers(users);
  return toSafeUser(newUser);
}

export function getUserLibrary(userId: string): string[] {
  const user = findUserById(userId);
  return Array.isArray(user?.library) ? user.library : [];
}

export function updateUserLibrary(
  userId: string,
  gameId: string,
  action: "add" | "remove" | "toggle" = "toggle"
): string[] {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return [];

  const current = Array.isArray(user.library) ? [...user.library] : [];
  let updated: string[];

  if (action === "add") {
    updated = current.includes(gameId) ? current : [...current, gameId];
  } else if (action === "remove") {
    updated = current.filter((id) => id !== gameId);
  } else {
    // toggle
    updated = current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId];
  }

  user.library = updated;
  writeUsers(users);
  return updated;
}

export function getActiveSessionCount(): number {
  const sessions = readSessions();
  const now = Date.now();
  return sessions.filter((s) => s.expiresAt > now).length;
}

export function getGameLibraryStats(): Record<string, number> {
  const users = readUsers();
  const counts: Record<string, number> = {};
  for (const user of users) {
    if (Array.isArray(user.library)) {
      for (const gameId of user.library) {
        counts[gameId] = (counts[gameId] || 0) + 1;
      }
    }
  }
  return counts;
}

// ─── Session Management ─────────────────────────────────────────────────────
export function createSession(userId: string): string {
  const sessions = readSessions();
  // Clear any existing expired sessions
  const now = Date.now();
  const validSessions = sessions.filter((s) => s.expiresAt > now);

  const token = crypto.randomBytes(32).toString("hex");
  validSessions.push({
    token,
    userId,
    expiresAt: now + SESSION_DURATION_MS,
  });

  writeSessions(validSessions);
  return token;
}

export function deleteSession(token: string) {
  const sessions = readSessions();
  const filtered = sessions.filter((s) => s.token !== token);
  writeSessions(filtered);
}

export async function getSessionUser(req?: NextRequest): Promise<SafeUser | null> {
  let sessionToken: string | undefined;

  if (req) {
    sessionToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        sessionToken = authHeader.substring(7).trim();
      }
    }
  }

  if (!sessionToken) {
    try {
      const cookieStore = await cookies();
      sessionToken =
        cookieStore.get(SESSION_COOKIE_NAME)?.value ||
        cookieStore.get(LEGACY_SESSION_COOKIE_NAME)?.value;
    } catch {
      // Ignore if called in a context where cookies() is unavailable
    }
  }

  if (!sessionToken) return null;

  const sessions = readSessions();
  const session = sessions.find((s) => s.token === sessionToken && s.expiresAt > Date.now());
  if (!session) return null;

  const user = findUserById(session.userId);
  if (!user) return null;

  return toSafeUser(user);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  return getSessionUser();
}

export type RequireAdminResult =
  | { authorized: true; user: SafeUser }
  | { authorized: false; error: string; status: number };

export async function requireAdmin(req?: NextRequest): Promise<RequireAdminResult> {
  const user = await getSessionUser(req);

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in with an administrator account.",
      status: 401,
    };
  }

  if (user.role !== "admin") {
    return {
      authorized: false,
      error: "Forbidden. Administrative privileges required.",
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
  };
}

export { SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME, SESSION_DURATION_MS };
