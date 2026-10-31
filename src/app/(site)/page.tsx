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
import { registrationState } from "@/lib/site";

export default async function HomePage() {
  const c = await getSiteContent();
  const status = registrationState(c);
  const band = c.copy.home.updatesBand;
  return (
    <>
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
