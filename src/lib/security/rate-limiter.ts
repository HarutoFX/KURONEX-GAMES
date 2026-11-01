import type { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface LockoutRecord {
  attempts: number;
  lockedUntil: number;
}

// Global in-memory storage (persists across requests within the process)
const rateLimitStore = new Map<string, RateLimitRecord>();
const lockoutStore = new Map<string, LockoutRecord>();

// Sweep intervals (every 5 minutes)
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweepStaleRecords() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  for (const [key, record] of lockoutStore.entries()) {
    if (record.lockedUntil <= now && record.attempts === 0) {
      lockoutStore.delete(key);
    }
  }
}

/**
 * Extracts client IP address safely from standard reverse proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Pick the first client IP in comma-separated list
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfterSeconds: number;
}

/**
 * Evaluates rate limit for a given key using sliding expiration window.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  sweepStaleRecords();
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetTime: now + windowMs,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  if (record.count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime: record.resetAt,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    limit,
    remaining,
    resetTime: record.resetAt,
    retryAfterSeconds,
  };
}

// ─── Brute Force & Account Lockout Tracker ───────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export function isAccountLocked(identifier: string): { locked: boolean; remainingSeconds: number } {
  sweepStaleRecords();
  const key = identifier.trim().toLowerCase();
  const record = lockoutStore.get(key);
  const now = Date.now();

  if (!record) {
    return { locked: false, remainingSeconds: 0 };
  }

  if (record.lockedUntil > now) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  // Lockout expired, reset attempts if not locked anymore
  if (record.lockedUntil <= now && record.lockedUntil > 0) {
    lockoutStore.delete(key);
  }

  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
  const key = identifier.trim().toLowerCase();
  const now = Date.now();
  const record = lockoutStore.get(key) || { attempts: 0, lockedUntil: 0 };

  record.attempts += 1;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockoutStore.set(key, record);
    return {
      locked: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  lockoutStore.set(key, record);
  return {
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
    remainingSeconds: 0,
  };
}

export function recordSuccessfulLogin(identifier: string) {
  const key = identifier.trim().toLowerCase();
  lockoutStore.delete(key);
}

// Reset rate limits and lockouts (primarily for test suite isolation)
export function resetRateLimitStore() {
  rateLimitStore.clear();
  lockoutStore.clear();
}

