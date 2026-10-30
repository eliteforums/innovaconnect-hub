import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google";
import { event, siteUrl } from "@/content/event";
import { siteKeywords } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { primaryCta } from "@/lib/site";
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

const seoDescription =
  "Explore InnovaHack Chapter 2, a pan-India AI and startup hackathon planned for 2027 by Elite Forums. See tracks, timeline, prizes and registration updates.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InnovaHack 2027 | AI & Startup Hackathon in India",
    template: "%s | InnovaHack",
  },
  description: seoDescription,
  keywords: siteKeywords,
  applicationName: "InnovaHack",
  authors: [{ name: event.organizer }],
  creator: event.organizer,
  publisher: event.organizer,
  category: "Technology",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
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
    title: "InnovaHack 2027 | AI & Startup Hackathon in India",
    description: seoDescription,
    locale: "en_IN",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InnovaHack 2027 | AI & Startup Hackathon in India",
    description: seoDescription,
    images: [
      {
        url: "/opengraph-image",
        alt: "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "InnovaHack Chapter 2",
        alternateName: "InnovaHack",
        description: seoDescription,
        inLanguage: "en-IN",
        publisher: { "@id": `${siteUrl}/#organizer` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organizer`,
        name: event.organizer,
        description: "Organizer of InnovaHack, a national hackathon in India.",
      },
    ],
  };

  return (
    <html
      lang="en-IN"
      className={`${playfair.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main"
          className="sr-only z-[60] bg-ink px-4 py-3 text-paper-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <div className="border-b border-ink/70">
          <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between gap-4 px-4 kicker text-[0.625rem] sm:px-6 lg:px-10">
            <p className="truncate">{event.announcement.join(" · ")}</p>
            <p className="hidden text-burgundy sm:block">{event.format.value}</p>
          </div>
        </div>
        <SiteHeader cta={primaryCta()} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
