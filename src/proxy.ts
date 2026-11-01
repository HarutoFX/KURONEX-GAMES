import { NextRequest, NextResponse } from "next/server";
import { verifyCsrf } from "@/lib/security/csrf";
import { recordRequestMetric } from "@/lib/analytics/observability";

export function proxy(req: NextRequest) {
  const startTime = performance.now();

  // Only apply CSRF check to /api/* routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const csrf = verifyCsrf(req);
    if (!csrf.valid) {
      recordRequestMetric({
        endpoint: req.nextUrl.pathname,
        method: req.method,
        status: 403,
        durationMs: Math.round(performance.now() - startTime),
      });
      return NextResponse.json(
        { error: csrf.reason || "Cross-Site Request Forgery (CSRF) protection rejected request." },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();
  const duration = Math.round(performance.now() - startTime);

  if (req.nextUrl.pathname.startsWith("/api/")) {
    recordRequestMetric({
      endpoint: req.nextUrl.pathname,
      method: req.method,
      status: response.status || 200,
      durationMs: duration,
    });
  }

  // Inject security headers for all edge responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
