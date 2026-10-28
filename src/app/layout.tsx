import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google";
import { event, siteUrl } from "@/content/event";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InnovaHack Chapter 2 — Mumbai Builds the Future",
    template: "%s · InnovaHack Chapter 2",
  },
  description: event.description,
  applicationName: "InnovaHack",
  authors: [{ name: event.organizer }],
  openGraph: {
    type: "website",
    siteName: "InnovaHack",
    title: "InnovaHack Chapter 2 — Mumbai Builds the Future",
    description: event.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "InnovaHack Chapter 2 — Mumbai Builds the Future",
    description: event.description,
  },
};

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
      <body className="flex min-h-dvh flex-col">
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
