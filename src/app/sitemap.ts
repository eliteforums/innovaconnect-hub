import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/event";
import { articles } from "@/content/updates";

const routes = [
  "",
  "/about",
  "/tracks",
  "/tracks/artificial-intelligence",
  "/tracks/open-innovation",
  "/chapter-1",
  "/timeline",
  "/prizes",
  "/partners",
  "/register",
  "/contact",
  "/faq",
  "/rules",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedArticles = articles.filter((a) => !a.draft && a.publishedOn !== null);
  const indexableRoutes = publishedArticles.length ? [...routes, "/updates"] : routes;

  return [
    ...indexableRoutes.map((r) => ({
      url: `${siteUrl}${r}`,
      changeFrequency: "weekly" as const,
      priority: r === "" ? 1 : 0.7,
    })),
    // Drafts are excluded: they are not ready for search engines.
    ...publishedArticles
      .map((a) => ({
        url: `${siteUrl}/updates/${a.slug}`,
        lastModified: a.publishedOn ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
