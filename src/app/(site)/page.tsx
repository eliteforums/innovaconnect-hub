import { siteUrl } from "@/content/event";
import { getSiteContent } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { Rooted } from "@/components/home/Rooted";
import {
  CitySection,
  DomainsSection,
  JourneySection,
  MoreThanSection,
  NationalSection,
  PartnersSection,
  PrizesSection,
} from "@/components/home/Sections";
import { UpdatesForm } from "@/components/forms/UpdatesForm";
import { Container, Rich } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { registrationState } from "@/lib/site";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/", copy.home.seo.title, copy.home.seo.description, { absoluteTitle: true });
}

export default async function HomePage() {
  const c = await getSiteContent();
  const status = registrationState(c);
  const band = c.copy.home.updatesBand;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: c.event.name,
    alternateName: [c.event.fullName, new URL(siteUrl).hostname],
    url: `${siteUrl}/`,
    inLanguage: "en-IN",
    publisher: { "@id": `${siteUrl}/#organizer` },
  };
  // Search engines require a real date and place, so this appears only once both are confirmed.
  const { start, end } = c.event.dates;
  const venue = c.event.venue.value;
  const eventJsonLd =
    start.value && venue
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: c.event.fullName,
          description: c.event.description,
          url: `${siteUrl}/`,
          image: [`${siteUrl}/opengraph-image`],
          startDate: start.value,
          endDate: end.value ?? undefined,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
          location: [
            { "@type": "VirtualLocation", url: `${siteUrl}/` },
            { "@type": "Place", name: venue, address: venue },
          ],
          organizer: { "@type": "Organization", name: c.event.organizer, url: siteUrl },
        }
      : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <Hero />
      <Rooted />
      <DomainsSection />
      <MoreThanSection />
      <JourneySection />
      <PrizesSection />
      <PartnersSection />
      <CitySection />
      <NationalSection />

      <section aria-labelledby="updates-title" className="mt-24" id="updates">
        <Container>
          <div className="grid gap-8 border-2 border-ink bg-ink p-6 text-paper-white sm:p-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="kicker text-taxi">{status.badge}</p>
              <h2 id="updates-title" className="headline mt-3 text-[clamp(2.5rem,5vw,4rem)] uppercase">
                <Rich text={band.title} accent="text-taxi" />
              </h2>
              <p className="mt-4 max-w-md text-paper/85">
                {status.body} <Rich text={band.body} accent="text-taxi" />
              </p>
              <p className="mt-8 font-display text-2xl italic text-taxi">{c.event.tagline}</p>
            </div>
            <UpdatesForm tone="dark" />
          </div>
        </Container>
      </section>
    </>
  );
}
