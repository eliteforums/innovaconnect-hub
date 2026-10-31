import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/event";

export default function robots(): MetadataRoute.Robots {
  return {
    // Admin routes already send noindex metadata. Let crawlers read it instead
    // of blocking them here; keep API endpoints out of crawl discovery.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
