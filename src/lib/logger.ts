/**
 * KURONEX GAMES — Production Structured Logging Architecture
 *
 * Implements high-throughput, structured NDJSON logging for production
 * and human-readable formatted logs in local development.
 * Automatically sanitizes credentials, passwords, session tokens, and secrets.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: string;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "salt",
  "token",
  "sessiontoken",
  "secret",
  "cookie",
  "authorization",
  "adminpasskey",
  "x-admin-key",
]);

/**
 * Irreversibly masks sensitive keys from logged context objects.
 */
function sanitizeLogContext(obj: unknown, depth = 0): unknown {
  if (depth > 5) return "[DEPTH_LIMIT]";
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeLogContext(val, depth + 1);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class StructuredLogger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>, err?: Error | unknown) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? (sanitizeLogContext(context) as Record<string, unknown>) : undefined;

    let errorObj: LogEntry["error"] | undefined;
    if (err instanceof Error) {
      errorObj = {
        name: err.name,
        message: err.message,
        // In production, omit internal stack trace from exported logs to prevent leak
        stack: this.isProduction ? undefined : err.stack,
      };
    } else if (err && typeof err === "object") {
      errorObj = {
        name: "UnknownError",
        message: String((err as Record<string, unknown>).message || err),
      };
    }

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context: sanitizedContext,
      error: errorObj,
      environment: process.env.NODE_ENV || "development",
    };

    if (this.isProduction) {
      // Production: write single-line structured NDJSON to stdout/stderr
      const serialized = JSON.stringify(entry);
      if (level === "ERROR" || level === "FATAL") {
        console.error(serialized);
      } else {
        console.log(serialized);
      }
    } else {
      // Development: clean color-coded output
      const prefix = `[${timestamp.split("T")[1].slice(0, 8)}] [${level}]`;
      const contextStr = sanitizedContext ? ` | ${JSON.stringify(sanitizedContext)}` : "";
      if (level === "ERROR" || level === "FATAL") {
        console.error(`${prefix} ${message}${contextStr}`, err || "");
      } else if (level === "WARN") {
        console.warn(`${prefix} ${message}${contextStr}`);
      } else {
        console.log(`${prefix} ${message}${contextStr}`);
      }
    }
  }

  public debug(message: string, context?: Record<string, unknown>) {
    if (!this.isProduction || process.env.LOG_LEVEL === "DEBUG") {
      this.write("DEBUG", message, context);
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.write("INFO", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.write("WARN", message, context);
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    this.write("ERROR", message, context, error);
  }

  public fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    this.write("FATAL", message, context, error);
  }
}

export const logger = new StructuredLogger();
export default logger;
