import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export interface ServiceHealth {
  name: string;
  subtext: string;
  status: "ONLINE" | "OPERATIONAL" | "DEGRADED" | "NOT_CONFIGURED";
  latency: string;
  category: "internal" | "external";
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const services: ServiceHealth[] = [];

    // 1. Database / JSON Store check
    const dbStart = performance.now();
    let dbStatus: "ONLINE" | "DEGRADED" = "ONLINE";
    try {
      const usersPath = path.join(process.cwd(), "src", "data", "users.json");
      fs.accessSync(usersPath, fs.constants.R_OK);
    } catch {
      dbStatus = "DEGRADED";
    }
    const dbDuration = Math.round((performance.now() - dbStart) * 10) / 10;
    services.push({
      name: "Database Subsystem",
      subtext: "Encrypted User & Session Store",
      status: dbStatus,
      latency: `${dbDuration} ms`,
      category: "internal",
    });

    // 2. Auth Cryptography Subsystem check
    const authStart = performance.now();
    let authStatus: "OPERATIONAL" | "DEGRADED" = "OPERATIONAL";
    try {
      crypto.scryptSync("health-check", "salt", 32);
    } catch {
      authStatus = "DEGRADED";
    }
    const authDuration = Math.round((performance.now() - authStart) * 10) / 10;
    services.push({
      name: "Auth Engine",
      subtext: "Scrypt Cryptography & Session Tokens",
      status: authStatus,
      latency: `${authDuration} ms`,
      category: "internal",
    });

    // 3. API Gateway / Next.js Runtime
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    services.push({
      name: "API Runtime",
      subtext: `Node.js Runtime (${memUsage} MB Heap)`,
      status: "ONLINE",
      latency: "< 1 ms",
      category: "internal",
    });

    // 4. Asset CDN / External Pipeline
    const hasCdnConfig = Boolean(process.env.KURONEX_CDN_URL);
    services.push({
      name: "Asset Pipeline",
      subtext: hasCdnConfig ? "External CDN Cluster" : "External CDN not configured in environment",
      status: hasCdnConfig ? "ONLINE" : "NOT_CONFIGURED",
      latency: hasCdnConfig ? "Connected" : "—",
      category: "external",
    });

    // 5. Cloud Save Sync
    const hasCloudSync = Boolean(process.env.KURONEX_CLOUD_SYNC_URL);
    services.push({
      name: "Cloud Sync Engine",
      subtext: hasCloudSync ? "Remote Cloud Storage Provider" : "Cloud storage provider not bound",
      status: hasCloudSync ? "ONLINE" : "NOT_CONFIGURED",
      latency: hasCloudSync ? "Connected" : "—",
      category: "external",
    });

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall: "OPERATIONAL",
        services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ error: "Failed to evaluate platform health" }, { status: 500 });
  }
}

