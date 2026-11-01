import crypto from "crypto";

/**
 * Generates a cryptographically secure URL-safe token.
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Computes SHA-256 hash of a token for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verifies if a raw token matches a stored token hash in constant time.
 */
export function verifyTokenHash(rawToken: string, storedHash: string): boolean {
  try {
    const rawHash = hashToken(rawToken);
    return crypto.timingSafeEqual(Buffer.from(rawHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}
