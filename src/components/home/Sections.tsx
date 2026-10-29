import Link from "next/link";
import { event } from "@/content/event";
import { landmarks, railLines } from "@/content/mumbai-map";
import { MumbaiMap } from "@/components/map/MumbaiMap";
import { cityFeatures } from "@/content/city";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, SectionHeader, StatusTag, Tag, TextLink } from "@/components/ui";
import { DomainPanels } from "./DomainPanels";
import { Journey } from "./Journey";

export function DomainsSection() {
  return (
    <section aria-labelledby="domains-title" className="mt-24" id="tracks">
      <Container>
        <SectionHeader
          number="03"
          kicker="The official domains"
          id="domains-title"
          title={
            <>
              Two domains. <span className="text-burgundy">One national stage.</span>
            </>
          }
          deck="Every team enters one of exactly two official competition domains. AI is welcome in both."
          action={<TextLink href="/tracks">Compare the tracks</TextLink>}
        />
        <div className="mt-10">
          <DomainPanels />
        </div>
      </Container>
    </section>
  );
}

const benefits = [
  { title: "Build practical projects", body: "Turn a real problem into a working solution you can demo." },
  { title: "Learn by exploring", body: "Push into new tools, models and frameworks under real constraints." },
  { title: "Work as a team", body: "Split the problem, divide the work and ship together." },
  { title: "Sharpen product thinking", body: "Practise deciding what to build — and what to leave out." },
  { title: "Explore real challenges", body: "Work on themes drawn from education, finance, climate, civic life and more." },
  { title: "Present your work", body: "Explain what you built, why it matters and how it works." },
  { title: "Meet mentors", body: "Engage with mentors where sessions are available during the event." },
  { title: "Find connections", body: "Explore industry and startup connections around the event." },
  { title: "Grow your portfolio", body: "Leave with a project that shows what you can do." },
];

export function MoreThanSection() {
  return (
    <section aria-labelledby="more-title" className="mt-24">
      <Container>
        <SectionHeader
          number="04"
          kicker="More than a hackathon"
          id="more-title"
          title="Build. Collaborate. Create impact."
        />
        <ol className="mt-10 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <li key={b.title} className="in-view border-b border-r border-ink bg-paper-white/50 p-6 transition-colors hover:bg-paper-white">
              <p className="kicker text-burgundy">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="headline mt-2 text-2xl">{b.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-charcoal">{b.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">
          Participation does not guarantee employment, funding, incubation or investment. Any partner opportunity will be
          published with its terms once it is confirmed.
        </p>
      </Container>
    </section>
  );
}

export function JourneySection() {
  return (
    <section aria-labelledby="journey-title" className="mt-24">
      <Container>
        <SectionHeader
          number="05"
          kicker="The competition journey"
          id="journey-title"
          title="From first idea to final stage."
          deck="The proposed Chapter 2 stages, subject to the organizer's final rules. Dates will be added as they are confirmed."
          action={<TextLink href="/timeline">Full timeline</TextLink>}
        />
        <div className="mt-12">
          <Journey />
        </div>
      </Container>
    </section>
  );
}

export const awardKinds = [
  "Cash prizes",
  "Sponsor-provided benefits",
  "Software or cloud credits",
  "Hardware & products",
  "Mentorship",
  "Incubation consideration",
  "Investor introductions",
];

export function PrizesSection() {
  return (
    <section aria-labelledby="prizes-title" className="mt-24">
      <Container>
        <div className="grid border-2 border-ink lg:grid-cols-[1.1fr_1fr]">
          <div className="relative overflow-hidden bg-ink p-8 text-paper-white sm:p-10">
            <div className="halftone absolute inset-0 opacity-30 invert" />
            <div className="relative">
              <p className="kicker text-taxi">
                <span className="mr-3 text-paper-white">No. 06</span>Prizes & opportunities
              </p>
              <h2 id="prizes-title" className="headline mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase">
                Build something worth recognizing.
              </h2>
              <p className="mt-8 inline-block border-2 border-taxi px-4 py-3 headline text-2xl uppercase text-taxi md:text-3xl">
                Chapter 2 prize details to be announced.
              </p>
              <p className="mt-5 max-w-lg text-paper/80">
                The Chapter 2 prize pool has not been confirmed. Chapter 1&rsquo;s advertised reward pool does not apply to
                this edition.
              </p>
            </div>
          </div>
          <div className="bg-paper-white p-8 sm:p-10">
            <p className="label text-[0.6875rem]">How awards will be published</p>
            <p className="mt-2 text-[0.9375rem] text-charcoal">
              When awards are confirmed, each type is listed separately with its eligibility and conditions — and only
              cash is ever counted as cash.
            </p>
            <ul className="mt-5 divide-y divide-rule border-y border-ink">
              {awardKinds.map((k) => (
                <li key={k} className="flex items-center justify-between py-2.5">
                  <span className="font-display text-lg">{k}</span>
                  <StatusTag status="unconfirmed" />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <TextLink href="/prizes">Prizes & awards</TextLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export const collaborationOptions = [
  { title: "Set a challenge", body: "Bring a real problem statement for teams to work on within either domain." },
  { title: "Provide tools", body: "Offer APIs, platforms or credits that help teams build." },
  { title: "Mentor & judge", body: "Share expertise with teams during the build and evaluation." },
  { title: "Reach builders", body: "Connect with India's student and early-career builder community." },
];

export function PartnersSection() {
  const partners = event.partners.filter((p) => p.verified);
  return (
    <section aria-labelledby="partners-title" className="mt-24">
      <Container>
        <SectionHeader
          number="07"
          kicker="Partners & industry"
          id="partners-title"
          title="Real problems. Real builders."
          action={<TextLink href="/partners">Partner with us</TextLink>}
        />
        {partners.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {partners.map((p) => (
              <li key={p.name} className="border border-ink bg-paper-white p-5">
                <p className="kicker text-burgundy">{p.category}</p>
                <p className="headline mt-2 text-xl">{p.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-between gap-6 border-2 border-ink bg-taxi p-7">
              <div>
                <p className="kicker">Chapter 2 partners</p>
                <p className="headline mt-3 text-3xl uppercase">Partner with InnovaHack.</p>
                <p className="mt-3 text-ink/85">
                  Chapter 2 partners have not been announced yet. Organizations interested in shaping the edition can get
                  in touch now.
                </p>
              </div>
              <ButtonLink href="/partners#inquiry" variant="ink">
                Start a partnership inquiry
              </ButtonLink>
            </div>
            <ul className="grid gap-px border border-ink bg-ink sm:grid-cols-2">
              {collaborationOptions.map((o, i) => (
                <li key={o.title} className="bg-paper-white p-6">
                  <p className="kicker text-burgundy">Option {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="headline mt-2 text-2xl">{o.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-charcoal">{o.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

export function CitySection() {
  const [taxi, bus, train, ...small] = cityFeatures;
  return (
    <section aria-labelledby="city-title" className="mt-24 scroll-mt-24" id="the-city">
      <Container>
        <SectionHeader
          number="08"
          kicker="The Mumbai edition"
          id="city-title"
          title="The city behind the inspiration."
          deck="The colours, routes and textures of this edition come from Mumbai's everyday life. These features are the inspiration for the design — not competition categories."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="in-view md:col-span-2 lg:row-span-2">
            <Figure media={taxi.media} aspect="aspect-[4/3]" priority={false} />
            <CityCopy feature={taxi} large />
          </article>
          {[bus, train].map((f) => (
            <article key={f.id} className="in-view md:col-span-1 lg:col-span-2">
              <Figure media={f.media} aspect="aspect-[16/7]" />
              <CityCopy feature={f} />
            </article>
          ))}
          {small.map((f) => (
            <article key={f.id} className="in-view">
              <Figure media={f.media} aspect="aspect-[4/3]" />
              <CityCopy feature={f} />
            </article>
          ))}
        </div>

      </Container>
    </section>
  );
}

function CityCopy({ feature, large = false }: { feature: (typeof cityFeatures)[number]; large?: boolean }) {
  return (
    <div className="mt-3">
      <p className="kicker text-[0.6875rem] text-burgundy">{feature.label}</p>
      <h3 className={`headline mt-1 uppercase ${large ? "text-[clamp(2rem,3.5vw,3rem)]" : "text-2xl"}`}>
        {feature.title}
      </h3>
      <p className={`mt-2 text-charcoal ${large ? "prose-news" : "text-[0.9375rem]"}`}>{feature.caption}</p>
      <p className="mt-2 border-l-2 border-taxi pl-3 text-xs leading-relaxed text-muted">{feature.context}</p>
    </div>
  );
}

export function NationalSection() {
  return (
    <section aria-labelledby="national-title" className="mt-24" id="map">
      <Container>
        <div className="grid gap-10 border-t-2 border-ink pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-14">
          {/* Intro */}
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="kicker text-burgundy">
              <span className="mr-3 text-ink">No. 09</span>National participation
            </p>
            <h2 id="national-title" className="headline mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase">
              Rooted in Mumbai. <span className="text-burgundy">Open to India.</span>
            </h2>
            <p className="prose-news mt-5 max-w-xl">
              The city on the map inspires this edition&rsquo;s identity — its trains, streets and shoreline. InnovaHack
              Chapter 2 itself is designed for builders from across the country, not only from Mumbai. Eligibility
              details will be published in the official rules.
            </p>
          </div>

          {/* Map */}
          <figure className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
            <div className="border-2 border-ink bg-paper-white">
              <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2">
                <p className="kicker text-taxi">The city map · Mumbai</p>
                <p className="hidden kicker text-[0.625rem] text-paper/70 sm:block">Island city &amp; suburbs</p>
              </div>
              <MumbaiMap className="block h-auto w-full" />
            </div>
            <figcaption className="mt-2 space-y-1 text-[0.6875rem] leading-relaxed text-muted">
              <p>
                Mumbai City and Mumbai Suburban districts. Rail lines are drawn station to station and positions are
                approximate. The Chapter 2 finale venue has not been announced and is not shown.
              </p>
              <p>
                Map data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-burgundy"
                >
                  OpenStreetMap contributors
                </a>
                , ODbL.
              </p>
            </figcaption>
          </figure>

          {/* Key */}
          <div className="lg:col-start-1 lg:row-start-2">
            <p className="label text-[0.6875rem]">Map key</p>
            <ul aria-label="Railway lines" className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink pb-3">
              {railLines.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden className="h-1.5 w-8" style={{ background: l.colour }} />
                  {l.name}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="h-0 w-8 border-t-[3px] border-dashed border-ink" />
                Sea link
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="size-4 border border-ink bg-[#DFD2B8]" />
                Mumbai City district
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="size-4 border border-ink bg-paper-deep" />
                Mumbai Suburban district
              </li>
            </ul>
            <ol aria-label="Landmarks" className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {landmarks.map((l) => (
                <li key={l.n} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-6 shrink-0 items-center justify-center border-2 border-ink bg-taxi font-mono text-xs font-bold"
                  >
                    {l.n}
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="sr-only">{l.n}. </span>
                    {l.href ? (
                      <Link href={l.href} className="font-semibold underline-offset-2 hover:text-burgundy hover:underline">
                        {l.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{l.name}</span>
                    )}
                    <span className="block text-[0.8125rem] text-charcoal">{l.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Participation */}
          <div className="lg:col-start-1 lg:row-start-3">
            <p className="label text-[0.6875rem]">Chapter 2 participation — live figures</p>
            <table className="mt-3 w-full border-y-2 border-ink text-left">
              <caption className="sr-only">Chapter 2 participation metrics</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="py-2 kicker text-[0.625rem] font-medium">Metric</th>
                  <th scope="col" className="py-2 text-right kicker text-[0.625rem] font-medium">Figure</th>
                </tr>
              </thead>
              <tbody>
                {event.participation.map((m) => (
                  <tr key={m.label} className="border-b border-rule last:border-b-0">
                    <th scope="row" className="py-2.5 font-display text-lg font-normal">{m.label}</th>
                    <td className="py-2.5 text-right">
                      {m.value ? (
                        <span className="headline text-2xl text-burgundy">{m.value}</span>
                      ) : (
                        <span className="kicker text-[0.6875rem] text-muted">Not yet published</span>
                      )}
                      {m.status === "target" && <StatusTag status="target" className="ml-2" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">
              Figures appear here only once they are supported by real registration data. Targets are always labelled as
              targets.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
