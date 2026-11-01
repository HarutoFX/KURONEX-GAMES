import type { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

/**
 * Validates Origin and Referer headers on mutating HTTP requests to prevent
 * Cross-Site Request Forgery (CSRF).
 */
export function verifyCsrf(req: NextRequest): { valid: boolean; reason?: string } {
  // Only mutating methods require CSRF validation
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    return { valid: true };
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  // If neither Origin nor Referer is provided (e.g., direct programmatic server-to-server or test agent)
  // we allow it provided it doesn't present a forged untrusted Origin.
  if (!originHeader && !refererHeader) {
    return { valid: true };
  }

  const hostHeader = req.headers.get("host");
  const allowedHosts = new Set<string>();

  if (hostHeader) {
    allowedHosts.add(hostHeader.toLowerCase());
  }

  // Also include request URL host
  try {
    const reqUrl = new URL(req.url);
    allowedHosts.add(reqUrl.host.toLowerCase());
  } catch {
    // ignore URL parse errors
  }

  // Check Origin header if present
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      const originHost = originUrl.host.toLowerCase();

      // Check against allowed hosts
      if (allowedHosts.has(originHost)) {
        return { valid: true };
      }

      // Allow localhost / 127.0.0.1 loopbacks in non-production
      if (process.env.NODE_ENV !== "production") {
        if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
          return { valid: true };
        }
      }

      return {
        valid: false,
        reason: `CSRF block: Origin '${originHeader}' does not match host '${hostHeader || "unknown"}'`,
      };
    } catch {
      return { valid: false, reason: "Malformed Origin header" };
    }
  }

  // Check Referer header if Origin wasn't provided
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      const refererHost = refererUrl.host.toLowerCase();

      if (allowedHosts.has(refererHost)) {
        return { valid: true };
      }

      if (process.env.NODE_ENV !== "production") {
        if (refererUrl.hostname === "localhost" || refererUrl.hostname === "127.0.0.1") {
          return { valid: true };
        }
      }

      return {
        valid: false,
        reason: `CSRF block: Referer '${refererHeader}' does not match host '${hostHeader || "unknown"}'`,
      };
    } catch {
      return { valid: false, reason: "Malformed Referer header" };
    }
  }

  return { valid: true };
}

