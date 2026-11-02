import fs from "fs";
import path from "path";

/**
 * Atomic file writer using write-then-rename to eliminate torn writes
 * and race condition corruptions.
 */
export function atomicWriteJsonSync(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  const content = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tempPath, content, "utf-8");
    try {
      fs.renameSync(tempPath, filePath);
    } catch (renameError: unknown) {
      const err = renameError as { code?: string };
      if (err?.code === "EPERM" || err?.code === "EBUSY" || err?.code === "EACCES") {
        // Windows file-lock fallback (e.g., when file is open in an IDE or scanned by antivirus)
        fs.copyFileSync(tempPath, filePath);
        try {
          fs.unlinkSync(tempPath);
        } catch {
          // ignore temp cleanup error
        }
      } else {
        throw renameError;
      }
    }
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup error
      }
    }
    throw error;
  }
}

export function safeReadJsonSync<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      atomicWriteJsonSync(filePath, fallback);
      return fallback;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "null") ?? fallback;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed reading ${filePath}:`, error);
    return fallback;
  }
}

