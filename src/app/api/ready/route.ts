import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "failed"> = {};
  let isReady = true;

  // 1. Storage Readability Check
  try {
    const usersFile = path.join(process.cwd(), "src", "data", "users.json");
    fs.accessSync(usersFile, fs.constants.R_OK);
    checks.storage_read = "ok";
  } catch {
    checks.storage_read = "failed";
    isReady = false;
  }

  // 2. Storage Directory Writability Check
  try {
    const dataDir = path.join(process.cwd(), "src", "data");
    fs.accessSync(dataDir, fs.constants.W_OK);
    checks.storage_write = "ok";
  } catch {
    checks.storage_write = "failed";
    isReady = false;
  }

  // 3. Process Memory Budget Check
  const mem = process.memoryUsage();
  const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);
  const heapRatio = mem.heapUsed / (mem.heapTotal || 1);

  if (heapRatio > 0.95 && heapUsedMb > 1024) {
    checks.memory = "degraded";
  } else {
    checks.memory = "ok";
  }

  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? "ready" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        heapUsedMb,
        heapTotalMb,
      },
      checks,
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
