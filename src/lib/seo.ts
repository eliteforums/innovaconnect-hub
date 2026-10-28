import type { Metadata } from "next";

/** Unique title, description, canonical URL and Open Graph data for a page. */
export function pageMeta(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · InnovaHack Chapter 2`, description, url: path },
    twitter: { title: `${title} · InnovaHack Chapter 2`, description },
  };
}
