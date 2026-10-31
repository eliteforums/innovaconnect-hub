import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google";
import { siteUrl } from "@/content/event";
import { getSiteContent } from "@/lib/content";
import { siteKeywords } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Handwritten editorial notes only — never for body copy. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent();
  const { title, description, imageAlt } = c.copy.global.seo;
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: imageAlt };
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s | InnovaHack" },
    description,
    keywords: siteKeywords,
    applicationName: "InnovaHack",
    authors: [{ name: c.event.organizer }],
    creator: c.event.organizer,
    publisher: c.event.organizer,
    category: "Technology",
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
    },
    alternates: { canonical: "/" },
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
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: {
      type: "website",
      siteName: "InnovaHack Chapter 2",
      title,
      description,
      locale: "en_IN",
      url: "/",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: imageAlt }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F5F0E5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${playfair.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
