import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  role: "player" | "developer" | "admin";
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: "player" | "developer" | "admin";
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

function readUsers(): User[] {
  try {
    ensureFile(DB_FILE, "[]");
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read users database:", err);
    return [];
  }
}

function writeUsers(users: User[]) {
  ensureFile(DB_FILE, "[]");
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
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
  ensureFile(SESSIONS_FILE, "[]");
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
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
  };

  users.push(newUser);
  writeUsers(users);
  return toSafeUser(newUser);
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

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const sessions = readSessions();
  const session = sessions.find((s) => s.token === sessionToken && s.expiresAt > Date.now());
  if (!session) return null;

  const user = findUserById(session.userId);
  if (!user) return null;

  return toSafeUser(user);
}

export { SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME, SESSION_DURATION_MS };
