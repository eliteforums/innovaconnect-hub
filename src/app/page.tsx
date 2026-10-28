import { event } from "@/content/event";
import { Hero } from "@/components/home/Hero";
import { LegacyStrip } from "@/components/home/LegacyStrip";
import { Rooted } from "@/components/home/Rooted";
import {
  BuildLogSection,
  CitySection,
  DomainsSection,
  JourneySection,
  MoreThanSection,
  NationalSection,
  PartnersSection,
  PrizesSection,
} from "@/components/home/Sections";
import { UpdatesForm } from "@/components/forms/UpdatesForm";
import { Container } from "@/components/ui";
import { registrationCopy } from "@/lib/site";

export default function HomePage() {
  const status = registrationCopy[event.registration.status];
  return (
    <>
      <Hero />
      <LegacyStrip />
      <Rooted />
      <DomainsSection />
      <MoreThanSection />
      <JourneySection />
      <PrizesSection />
      <PartnersSection />
      <CitySection />
      <NationalSection />
      <BuildLogSection />

      <section aria-labelledby="updates-title" className="mt-24" id="updates">
        <Container>
          <div className="grid gap-8 border-2 border-ink bg-ink p-6 text-paper-white sm:p-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="kicker text-taxi">{status.badge}</p>
              <h2 id="updates-title" className="headline mt-3 text-[clamp(2.5rem,5vw,4rem)] uppercase">
                Be first to know.
              </h2>
              <p className="mt-4 max-w-md text-paper/85">
                {status.body} Updates are sent only when there is official news — dates, registration, domains and
                partners.
              </p>
              <p className="mt-8 font-display text-2xl italic text-taxi">{event.tagline}</p>
            </div>
            <UpdatesForm tone="dark" />
          </div>
        </Container>
      </section>
    </>
  );
}
