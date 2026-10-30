import { NextResponse, type NextRequest } from "next/server";
import { getSiteContentFresh } from "@/lib/content";

const ADMIN_COOKIE = "ih_admin";

/**
 * Runs before rendering:
 *  - /admin/*: visitors without a session cookie are redirected to the login
 *    page with a real 307. (The session itself is validated on the server.)
 *  - /updates/:slug: unknown article slugs are rewritten to a path with no
 *    route, so the not-found page is served with a real 404 status. Articles
 *    are editable in the dashboard, so slugs are read from the content store.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !request.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const slug = pathname.split("/")[2];
  if (!slug) return NextResponse.next();
  const { articles } = await getSiteContentFresh();
  if (!articles.some((a) => a.slug === slug)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/updates/:slug", "/admin", "/admin/:path*"],
};
