import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Article } from "@/content/types";
import { readContentDocs } from "@/lib/server/admin-store";
import { sanitize } from "./sanitize";
import { sectionDefaults, sectionKeys, type SectionKey } from "./sections";

export const CONTENT_TAG = "site-content";

type Defaults = typeof sectionDefaults;

export type SiteContent = {
  event: Defaults["event"];
  domains: Defaults["domains"];
  chapter1: Defaults["chapter1"];
  /** Articles visible on the site (drafts hidden when event.showDraftArticles is off). */
  articles: Article[];
  faq: Defaults["faq"];
  rules: Defaults["rules"];
  city: Defaults["city"];
  map: Defaults["map"];
  images: Defaults["images"];
  navigation: Defaults["navigation"];
  copy: {
    [K in SectionKey as K extends `copy.${infer P}` ? P : never]: Defaults[K];
  };
};

/** Saved sections merged over the built-in defaults. */
export function buildContent(docs: Record<string, { value: unknown }>): SiteContent {
  const merged = {} as Record<SectionKey, unknown>;
  for (const key of sectionKeys) {
    const saved = docs[key];
    merged[key] = saved ? sanitize(sectionDefaults[key], saved.value, key) : sectionDefaults[key];
  }
  const copy = Object.fromEntries(
    sectionKeys.filter((k) => k.startsWith("copy.")).map((k) => [k.slice(5), merged[k]]),
  ) as SiteContent["copy"];
  const event = merged.event as Defaults["event"];
  const articles = (merged.articles as Article[]).filter((a) => !a.draft || event.showDraftArticles);
  return {
    event,
    domains: merged.domains as Defaults["domains"],
    chapter1: merged.chapter1 as Defaults["chapter1"],
    articles,
    faq: merged.faq as Defaults["faq"],
    rules: merged.rules as Defaults["rules"],
    city: merged.city as Defaults["city"],
    map: merged.map as Defaults["map"],
    images: merged.images as Defaults["images"],
    navigation: merged.navigation as Defaults["navigation"],
    copy,
  };
}

/**
 * The site's content, cached until an admin saves a change (which calls
 * updateTag(CONTENT_TAG)). Pages stay static and fast between edits.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return buildContent(await readContentDocs());
}

/** Uncached read, for the proxy and the admin dashboard. */
export async function getSiteContentFresh(): Promise<SiteContent> {
  return buildContent(await readContentDocs());
}

export { sectionDefaults, sectionInfo, sectionKeys, isSectionKey, type SectionKey } from "./sections";
