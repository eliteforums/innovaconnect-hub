import { NextResponse, type NextRequest } from "next/server";
import { getArticleSlugsFresh } from "@/lib/content";

const ADMIN_COOKIE = "ih_admin";
const PORTAL_COOKIE = "ih_portal";

/**
 * Runs before rendering:
 *  - /admin/*: visitors without a session cookie are redirected to the login
 *    page with a real 307. (The session itself is validated on the server.)
 *  - /portal/*: the same for finalist teams and moderators.
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

  if (pathname.startsWith("/portal")) {
    if (pathname !== "/portal/login" && !request.cookies.has(PORTAL_COOKIE)) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.next();
  }

  const slug = pathname.split("/")[2];
  if (!slug) return NextResponse.next();
  const articleSlugs = await getArticleSlugsFresh();
  if (!articleSlugs.includes(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/updates/:slug", "/admin", "/admin/:path*", "/portal", "/portal/:path*"],
};
