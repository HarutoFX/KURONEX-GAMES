import { NextRequest, NextResponse } from "next/server";
import { verifyCsrf } from "@/lib/security/csrf";

export function proxy(req: NextRequest) {
  // Only apply CSRF check to /api/* routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const csrf = verifyCsrf(req);
    if (!csrf.valid) {
      return NextResponse.json(
        { error: csrf.reason || "Cross-Site Request Forgery (CSRF) protection rejected request." },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();

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
