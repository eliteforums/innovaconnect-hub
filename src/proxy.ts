import { NextResponse, type NextRequest } from "next/server";
import { articles } from "@/content/updates";

/**
 * Articles are static content, so the set of valid slugs is known up front.
 * Unknown slugs are rewritten to a path with no route, which renders the
 * not-found page with a real 404 status (a streamed not-found would be 200).
 */
const slugs = new Set(articles.map((a) => a.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !slugs.has(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/updates/:slug",
};
