import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import {
  analyticsEventBus,
  calculateAnalyticsSummary,
} from "@/lib/analytics/event-tracker";
import { PlatformEvent } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("analytics:read", req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      // 1. Send initial analytics snapshot
      try {
        const initialSummary = await calculateAnalyticsSummary("7D");
        if (!closed) {
          controller.enqueue(
            encoder.encode(`event: snapshot\ndata: ${JSON.stringify(initialSummary)}\n\n`)
          );
        }
      } catch {
        // Ignore initial snapshot error if closed
      }

      // 2. Listener for live platform events
      const onEvent = async (event: PlatformEvent) => {
        if (closed) return;
        try {
          const freshSummary = await calculateAnalyticsSummary("7D");
          if (closed) return;
          const payload = {
            event,
            freshSummary,
          };
          controller.enqueue(
            encoder.encode(`event: update\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Stream might be closed
        }
      };

      analyticsEventBus.on("event", onEvent);

      // 3. Heartbeat ping to prevent connection timeout
      const pingInterval = setInterval(() => {
        if (closed) {
          clearInterval(pingInterval);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(pingInterval);
        analyticsEventBus.off("event", onEvent);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
