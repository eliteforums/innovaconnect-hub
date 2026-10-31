import { siteUrl } from "@/content/event";
import { getSiteContent } from "@/lib/content";
import { primaryCta } from "@/lib/site";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Public-site frame: skip link, announcement strip, header, footer. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "InnovaHack Chapter 2",
        alternateName: "InnovaHack",
        description: c.copy.global.seo.description,
        inLanguage: "en-IN",
        publisher: { "@id": `${siteUrl}/#organizer` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organizer`,
        name: c.event.organizer,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        description: c.copy.about.organizerBody.replace(/\n/g, " "),
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        foundingLocation: {
          "@type": "Place",
          name: "Mumbai, India",
        },
        knowsAbout: [
          "Entrepreneurship",
          "Innovation",
          "Technology",
          "Hackathons",
          "Startup ecosystems",
        ],
      },
    ],
  };
  return (
    <>
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
          <p className="truncate">{c.event.announcement.join(" · ")}</p>
          <p className="hidden text-burgundy sm:block">{c.event.format.value}</p>
        </div>
      </div>
      <SiteHeader cta={primaryCta(c)} nav={c.navigation.primary} labels={c.copy.global.header} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
