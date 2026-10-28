import type { Metadata } from "next";

export const siteKeywords = [
  "InnovaHack",
  "InnovaHack Chapter 2",
  "hackathon India 2027",
  "national hackathon India",
  "pan-India hackathon",
  "AI hackathon India",
  "startup hackathon India",
  "artificial intelligence competition",
  "startup innovation challenge",
  "hybrid hackathon India",
];

/** Unique title, description, canonical URL and Open Graph data for a page. */
export function pageMeta(path: string, title: string, description: string): Metadata {
  const socialTitle = `${title} | InnovaHack`;
  const socialImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation",
  };

  return {
    title,
    description,
    keywords: siteKeywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "InnovaHack Chapter 2",
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
