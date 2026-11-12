import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "degraded" | "failed"> = {};
  let isReady = true;

  // 1. Database Connectivity & Readability Check
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    await prisma.user.count();
    checks.database_read = "ok";
    checks.storage_read = "ok";
  } catch {
    checks.database_read = "failed";
    checks.storage_read = "failed";
    isReady = false;
  }

  // 2. Database Write Readiness Check (Transactional non-mutating check)
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRawUnsafe("SELECT 1");
    });
    checks.database_write = "ok";
    checks.storage_write = "ok";
  } catch {
    checks.database_write = "failed";
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
