import { NextRequest, NextResponse } from "next/server";
import { getSessionPayloadFromCookies } from "@/lib/auth/edge";

/**
 * Edge Middleware for route protection.
 *
 * This runs before every matched request to protect /live and /admin.
 * It does a lightweight cookie check only (no Admin SDK call — that
 * happens in the Route Handlers for actual data mutations).
 *
 * The Admin SDK performs the authoritative session verification
 * in each protected route handler.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const session = getSessionPayloadFromCookies(cookieHeader);

  // ── /live routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/live") && !pathname.startsWith("/live/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/live/login", request.url));
    }
    // Both organizer and admin can access /live
    if (session.role !== "organizer" && session.role !== "admin") {
      return NextResponse.redirect(new URL("/live/login", request.url));
    }
  }

  // ── /admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Only admin role can access /admin
    if (session.role !== "admin") {
      // Organizer trying to access admin — redirect them to live
      return NextResponse.redirect(new URL("/live", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/live/:path*",
    "/admin/:path*",
  ],
};
