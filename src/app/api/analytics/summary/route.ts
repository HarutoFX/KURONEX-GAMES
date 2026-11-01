import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { calculateAnalyticsSummary } from "@/lib/analytics/event-tracker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("analytics:read", req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range")?.toUpperCase();
    const timeRange = rangeParam === "24H" || rangeParam === "7D" || rangeParam === "30D" || rangeParam === "ALL"
      ? rangeParam
      : "7D";

    const summary = calculateAnalyticsSummary(timeRange);

    return NextResponse.json(summary, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json({ error: "Failed to calculate analytics summary" }, { status: 500 });
  }
}
