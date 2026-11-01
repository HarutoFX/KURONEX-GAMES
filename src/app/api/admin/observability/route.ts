import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { getObservabilitySnapshot } from "@/lib/analytics/observability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("system:audit:read", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const snapshot = getObservabilitySnapshot();

    return NextResponse.json(snapshot, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Observability snapshot error:", error);
    return NextResponse.json({ error: "Failed to generate observability telemetry" }, { status: 500 });
  }
}
