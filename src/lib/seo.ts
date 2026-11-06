import type { Metadata } from "next";

/** Keep temporary Vercel deployments out of search results. */
export const searchIndexingAllowed = process.env.VERCEL_ENV !== "preview";

/** Unique title, description, canonical URL and Open Graph data for a page. */
export function pageMeta(
  path: string,
  title: string,
  description: string,
  { absoluteTitle = false }: { absoluteTitle?: boolean } = {},
): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | InnovaHack`;
  const socialImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "InnovaHack Chapter 2 international AI and startup hackathon with a ₹50 Lakh prize pool",
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    category: "Technology",
    authors: [{ name: "Elite Forums" }],
    creator: "Elite Forums",
    publisher: "Elite Forums",
    alternates: { canonical: path },
    robots: {
      index: searchIndexingAllowed,
      follow: true,
      googleBot: {
        index: searchIndexingAllowed,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "InnovaHack",
      title: socialTitle,
      description,
      url: path,
      locale: "en_IN",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}
