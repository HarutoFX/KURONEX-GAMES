import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import prisma from "./prisma";
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

const SESSION_COOKIE_NAME = "kuronex_session";
const LEGACY_SESSION_COOKIE_NAME = "vyomera_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Prisma Mappers ─────────────────────────────────────────────────────────
function mapDbUser(dbUser: {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: string;
  isSuspended: boolean;
  suspendedReason: string | null;
  isEmailVerified: boolean;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  createdAt: Date;
  library?: { gameId: string }[];
}): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    passwordHash: dbUser.passwordHash,
    salt: dbUser.salt,
    createdAt: dbUser.createdAt.toISOString(),
    role: dbUser.role,
    library: Array.isArray(dbUser.library) ? dbUser.library.map((item) => item.gameId) : [],
    isSuspended: dbUser.isSuspended,
    suspendedReason: dbUser.suspendedReason ?? undefined,
    isEmailVerified: dbUser.isEmailVerified,
    passwordResetTokenHash: dbUser.passwordResetTokenHash ?? undefined,
    passwordResetExpiresAt: dbUser.passwordResetExpiresAt
      ? dbUser.passwordResetExpiresAt.getTime()
      : undefined,
  };
}

async function resolveRoleId(roleInput?: string): Promise<{ role: string; roleId: string | null }> {
  const canonicalUpper = normalizeRole(roleInput);
  const canonicalLower = canonicalUpper.toLowerCase();
  const roleRow = await prisma.role.findUnique({ where: { name: canonicalUpper } });
  return {
    role: canonicalLower,
    roleId: roleRow?.id ?? null,
  };
}

// ─── Password Cryptography ──────────────────────────────────────────────────
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    if (!password || !hash || !salt) return false;
    const checkHash = crypto.scryptSync(password, salt, 64);
    const expectedHash = Buffer.from(hash, "hex");
    if (checkHash.length !== expectedHash.length) return false;
    return crypto.timingSafeEqual(expectedHash, checkHash);
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

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const lower = email.trim().toLowerCase();
  if (!lower) return undefined;

  const exact = await prisma.user.findUnique({
    where: { email: lower },
    include: { library: { select: { gameId: true } } },
  });
  if (exact) return mapDbUser(exact);

  // Fallback scan only if legacy mixed-case emails exist
  const candidates = await prisma.user.findMany({ select: { id: true, email: true } });
  const matched = candidates.find((u) => u.email.toLowerCase() === lower);
  if (!matched) return undefined;

  const full = await prisma.user.findUnique({
    where: { id: matched.id },
    include: { library: { select: { gameId: true } } },
  });
  return full ? mapDbUser(full) : undefined;
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const trimmed = username.trim();
  const lower = trimmed.toLowerCase();
  if (!lower) return undefined;

  const exact = await prisma.user.findUnique({
    where: { username: trimmed },
    include: { library: { select: { gameId: true } } },
  });
  if (exact) return mapDbUser(exact);

  const candidates = await prisma.user.findMany({ select: { id: true, username: true } });
  const matched = candidates.find((u) => u.username.toLowerCase() === lower);
  if (!matched) return undefined;

  const full = await prisma.user.findUnique({
    where: { id: matched.id },
    include: { library: { select: { gameId: true } } },
  });
  return full ? mapDbUser(full) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  if (!id) return undefined;
  const found = await prisma.user.findUnique({
    where: { id },
    include: { library: { select: { gameId: true } } },
  });
  return found ? mapDbUser(found) : undefined;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<SafeUser> {
  const { hash, salt } = hashPassword(data.password);
  const publicRole = data.role === "developer" ? "developer" : "player";
  const { role, roleId } = await resolveRoleId(publicRole);

  const created = await prisma.user.create({
    data: {
      id: `kuro_${crypto.randomBytes(8).toString("hex")}`,
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role,
      roleId,
      isActive: true,
    },
    include: { library: { select: { gameId: true } } },
  });

  return toSafeUser(mapDbUser(created));
}

export async function getUserLibrary(userId: string): Promise<string[]> {
  const entries = await prisma.userLibrary.findMany({
    where: { userId },
    select: { gameId: true },
    orderBy: { acquiredAt: "asc" },
  });
  return entries.map((e) => e.gameId);
}

export async function suspendUser(userId: string, suspended: boolean, reason = ""): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return false;

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

  return true;
}

export async function setPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: number
): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return false;

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: new Date(expiresAt),
    },
  });
  return true;
}

export async function clearPasswordResetToken(userId: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return false;

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });
  return true;
}

export async function findUserByResetTokenHash(tokenHash: string): Promise<User | undefined> {
  if (!tokenHash) return undefined;
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
    include: { library: { select: { gameId: true } } },
  });
  return user ? mapDbUser(user) : undefined;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return false;

  const { hash, salt } = hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hash,
      salt,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });

  await revokeAllUserSessions(userId);
  return true;
}

export function validateAdminPasskey(passkey: string): boolean {
  if (!passkey || typeof passkey !== "string") return false;
  const expectedPasskey = process.env.ADMIN_SETUP_PASSKEY;
  if (!expectedPasskey || expectedPasskey.trim().length < 8) {
    return false;
  }

  const providedDigest = crypto.createHash("sha256").update(passkey).digest();
  const expectedDigest = crypto.createHash("sha256").update(expectedPasskey).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

export async function createAdminUser(data: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<SafeUser> {
  const { hash, salt } = hashPassword(data.password);
  const targetRole = data.role === "super_admin" ? "super_admin" : "admin";
  const { role, roleId } = await resolveRoleId(targetRole);

  const created = await prisma.user.create({
    data: {
      id: `kuro_admin_${crypto.randomBytes(6).toString("hex")}`,
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role,
      roleId,
      isActive: true,
      isEmailVerified: true,
    },
    include: { library: { select: { gameId: true } } },
  });

  return toSafeUser(mapDbUser(created));
}

export async function updateAdminProfile(
  userId: string,
  data: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<{ success: boolean; error?: string; user?: SafeUser }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { library: { select: { gameId: true } } },
  });
  if (!user) return { success: false, error: "Administrator account not found" };

  const updates: {
    username?: string;
    email?: string;
    passwordHash?: string;
    salt?: string;
  } = {};

  if (data.username && data.username.trim() !== user.username) {
    const trimmed = data.username.trim();
    if (trimmed.length < 3) {
      return { success: false, error: "Gamertag must be at least 3 characters" };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { success: false, error: "Gamertag can only contain letters, numbers, underscores, and dashes" };
    }
    const existingUsers = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, username: true },
    });
    const collision = existingUsers.find((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (collision) {
      return { success: false, error: "Gamertag is already in use by another operator" };
    }
    updates.username = trimmed;
  }

  if (data.email && data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const trimmed = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { success: false, error: "Please enter a valid administrator email address" };
    }
    const collision = await prisma.user.findFirst({
      where: { id: { not: userId }, email: trimmed },
      select: { id: true },
    });
    if (collision) {
      return { success: false, error: "Email address is already registered to another account" };
    }
    updates.email = trimmed;
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      return { success: false, error: "Current password is required to change administrator password" };
    }
    const isCurrentValid = verifyPassword(data.currentPassword, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return { success: false, error: "Current password verification failed" };
    }
    if (data.newPassword.length < 8) {
      return { success: false, error: "New administrator password must be at least 8 characters long" };
    }
    const { hash, salt } = hashPassword(data.newPassword);
    updates.passwordHash = hash;
    updates.salt = salt;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updates,
    include: { library: { select: { gameId: true } } },
  });

  return { success: true, user: toSafeUser(mapDbUser(updated)) };
}

export async function updateUserLibrary(
  userId: string,
  gameId: string,
  action: "add" | "remove" | "toggle" = "toggle"
): Promise<string[]> {
  const cleanGameId = gameId.trim();
  if (!cleanGameId) return getUserLibrary(userId);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return [];

  const existingEntry = await prisma.userLibrary.findUnique({
    where: { userId_gameId: { userId, gameId: cleanGameId } },
  });

  if (action === "add") {
    if (!existingEntry) {
      await prisma.userLibrary.create({
        data: { userId, gameId: cleanGameId, status: "IN_LIBRARY" },
      });
    }
  } else if (action === "remove") {
    if (existingEntry) {
      await prisma.userLibrary.deleteMany({
        where: { userId, gameId: cleanGameId },
      });
    }
  } else {
    if (existingEntry) {
      await prisma.userLibrary.deleteMany({
        where: { userId, gameId: cleanGameId },
      });
    } else {
      await prisma.userLibrary.create({
        data: { userId, gameId: cleanGameId, status: "IN_LIBRARY" },
      });
    }
  }

  return getUserLibrary(userId);
}

export async function getActiveSessionCount(): Promise<number> {
  return prisma.session.count({
    where: { expiresAt: { gt: new Date() } },
  });
}

export async function getGameLibraryStats(): Promise<Record<string, number>> {
  const grouped = await prisma.userLibrary.groupBy({
    by: ["gameId"],
    _count: { gameId: true },
  });

  const counts: Record<string, number> = {};
  for (const row of grouped) {
    counts[row.gameId] = row._count.gameId;
  }
  return counts;
}

// ─── Session Management ─────────────────────────────────────────────────────
export async function createSession(userId: string, req?: NextRequest): Promise<string> {
  const now = new Date();
  await prisma.session.deleteMany({
    where: { expiresAt: { lte: now } },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const ipAddress = req ? getClientIp(req) : undefined;
  const userAgent = req?.headers.get("user-agent") || undefined;

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  return token;
}

export async function rotateSession(oldToken: string, userId: string, req?: NextRequest): Promise<string> {
  await deleteSession(oldToken);
  return createSession(userId, req);
}

export async function deleteSession(token: string): Promise<boolean> {
  if (!token) return false;
  const result = await prisma.session.deleteMany({
    where: { token },
  });
  return result.count > 0;
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return sessions.map((s) => ({
    token: s.token,
    userId: s.userId,
    expiresAt: s.expiresAt.getTime(),
    createdAt: s.createdAt.getTime(),
    ipAddress: s.ipAddress ?? undefined,
    userAgent: s.userAgent ?? undefined,
  }));
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

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: { library: { select: { gameId: true } } },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.user) {
    return null;
  }

  // Immediate session revocation for suspended accounts
  if (session.user.isSuspended) {
    await deleteSession(sessionToken);
    return null;
  }

  return toSafeUser(mapDbUser(session.user));
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

export { SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME, SESSION_DURATION_MS, resolveRoleId };
