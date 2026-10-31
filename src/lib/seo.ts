import type { Metadata } from "next";

export const siteKeywords = [
  "InnovaHack",
  "InnovaHack Chapter 2",
  "Elite Forums",
  "Elite Forums India",
  "hackathon India 2027",
  "national hackathon India",
  "pan-India hackathon",
  "AI hackathon India",
  "startup hackathon India",
  "student hackathon India",
  "college hackathon India",
  "entrepreneurship India",
  "startup ecosystem India",
  "innovation ecosystem India",
  "hackathon Mumbai",
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
    category: "Technology",
    authors: [{ name: "Elite Forums" }],
    creator: "Elite Forums",
    publisher: "Elite Forums",
    alternates: { canonical: path },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
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
