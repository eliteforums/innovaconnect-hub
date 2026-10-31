import Link from "next/link";
import type { CityFeature } from "@/content/city";
import { getSiteContent } from "@/lib/content";
import { MumbaiMap } from "@/components/map/MumbaiMap";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, Rich, SectionHeader, StatusTag, TextLink } from "@/components/ui";
import { DomainPanels } from "./DomainPanels";
import { RailwayJourney } from "@/components/timeline/RailwayJourney";

export async function DomainsSection() {
  const { copy } = await getSiteContent();
  const d = copy.home.domains;
  return (
    <section aria-labelledby="domains-title" className="mt-24" id="tracks">
      <Container>
        <SectionHeader
          number={d.number}
          kicker={d.kicker}
          id="domains-title"
          title={d.title}
          deck={d.deck}
          action={<TextLink href="/tracks">{d.action}</TextLink>}
        />
        <div className="mt-10">
          <DomainPanels />
        </div>
      </Container>
    </section>
  );
}

export async function MoreThanSection() {
  const { copy } = await getSiteContent();
  const m = copy.home.more;
  return (
    <section aria-labelledby="more-title" className="mt-24">
      <Container>
        <SectionHeader number={m.number} kicker={m.kicker} id="more-title" title={m.title} />
        <ol className="mt-10 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
          {m.benefits.map((b, i) => (
            <li
              key={`${b.title}-${i}`}
              className="in-view border-b border-r border-ink bg-paper-white/50 p-6 transition-colors hover:bg-paper-white"
            >
              <p className="kicker text-burgundy">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="headline mt-2 text-2xl">{b.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-charcoal">
                <Rich text={b.body} />
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">
          <Rich text={m.disclaimer} />
        </p>
      </Container>
    </section>
  );
}

export async function JourneySection() {
  const { copy } = await getSiteContent();
  const j = copy.home.journey;
  return (
    <section aria-labelledby="journey-title" className="mt-24">
      <Container>
        <SectionHeader
          number={j.number}
          kicker={j.kicker}
          id="journey-title"
          title={j.title}
          deck={j.deck}
          action={<TextLink href="/timeline">{j.action}</TextLink>}
        />
        <div className="mt-10">
          <RailwayJourney />
        </div>
      </Container>
    </section>
  );
}

export async function PrizesSection() {
  const c = await getSiteContent();
  const p = c.copy.home.prizes;
  const awards = c.event.awards;
  return (
    <section aria-labelledby="prizes-title" className="mt-24">
      <Container>
        <div className="grid border-2 border-ink lg:grid-cols-[1.1fr_1fr]">
          <div className="relative overflow-hidden bg-ink p-8 text-paper-white sm:p-10">
            <div className="halftone absolute inset-0 opacity-30 invert" />
            <div className="relative">
              <p className="kicker text-taxi">
                <span className="mr-3 text-paper-white">No. {p.number}</span>
                {p.kicker}
              </p>
              <h2 id="prizes-title" className="headline mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase">
                <Rich text={p.title} accent="text-taxi" />
              </h2>
              {p.summary && (
                <p className="mt-8 inline-block border-2 border-taxi px-4 py-3 headline text-2xl uppercase text-taxi md:text-3xl">
                  {p.summary}
                </p>
              )}
              <p className="mt-5 max-w-lg text-paper/80">
                <Rich text={p.body} accent="text-taxi" linkClass="underline underline-offset-2 hover:text-taxi" />
              </p>
            </div>
          </div>
          <div className="bg-paper-white p-8 sm:p-10">
            <p className="label text-[0.6875rem]">{p.howTitle}</p>
            <p className="mt-2 text-[0.9375rem] text-charcoal">
              <Rich text={p.howBody} />
            </p>
            <ul className="mt-5 divide-y divide-rule border-y border-ink">
              {awards.map((a) => (
                <li key={a.title} className="flex items-center justify-between gap-4 py-2.5">
                  <span>
                    <span className="block font-display text-lg">{a.title}</span>
                    <span className="text-xs text-muted">{a.winnerCount ? `${a.winnerCount} winning teams` : a.eligibility}</span>
                  </span>
                  <span className="shrink-0 text-right font-display text-lg text-burgundy">{a.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <TextLink href="/prizes">{p.link}</TextLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export async function PartnersSection() {
  const { copy, event } = await getSiteContent();
  const p = copy.home.partners;
  const partners = event.partners.filter((x) => x.verified);
  return (
    <section aria-labelledby="partners-title" className="mt-24">
      <Container>
        <SectionHeader
          number={p.number}
          kicker={p.kicker}
          id="partners-title"
          title={p.title}
          action={<TextLink href="/partners">{p.action}</TextLink>}
        />
        {partners.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {partners.map((x) => (
              <li key={x.name} className="border border-ink bg-paper-white p-5">
                <p className="kicker text-burgundy">{x.category}</p>
                <p className="headline mt-2 text-xl">{x.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-between gap-6 border-2 border-ink bg-taxi p-7">
              <div>
                <p className="kicker">{p.ctaKicker}</p>
                <p className="headline mt-3 text-3xl uppercase">{p.ctaTitle}</p>
                <p className="mt-3 text-ink/85">
                  <Rich text={p.ctaBody} />
                </p>
              </div>
              <ButtonLink href="/partners#inquiry" variant="ink">
                {p.ctaButton}
              </ButtonLink>
            </div>
            <ul className="grid gap-px border border-ink bg-ink sm:grid-cols-2">
              {p.options.map((o, i) => (
                <li key={`${o.title}-${i}`} className="bg-paper-white p-6">
                  <p className="kicker text-burgundy">
                    {p.optionLabel} {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="headline mt-2 text-2xl">{o.title}</h3>
                  <p className="mt-2 text-[0.9375rem] text-charcoal">
                    <Rich text={o.body} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

export async function CitySection() {
  const { copy, city } = await getSiteContent();
  const h = copy.home.city;
  const [taxi, bus, train, ...small] = city.features;
  return (
    <section aria-labelledby="city-title" className="mt-24 scroll-mt-24" id="the-city">
      <Container>
        <SectionHeader number={h.number} kicker={h.kicker} id="city-title" title={h.title} deck={h.deck} />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {taxi && (
            <article className="in-view md:col-span-2 lg:row-span-2">
              <Figure media={taxi.media} aspect="aspect-[4/3]" />
              <CityCopy feature={taxi} large />
            </article>
          )}
          {[bus, train]
            .filter((f): f is CityFeature => Boolean(f))
            .map((f) => (
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

function CityCopy({ feature, large = false }: { feature: CityFeature; large?: boolean }) {
  return (
    <div className="mt-3">
      <p className="kicker text-[0.6875rem] text-burgundy">{feature.label}</p>
      <h3 className={`headline mt-1 uppercase ${large ? "text-[clamp(2rem,3.5vw,3rem)]" : "text-2xl"}`}>
        {feature.title}
      </h3>
      <p className={`mt-2 text-charcoal ${large ? "prose-news" : "text-[0.9375rem]"}`}>
        <Rich text={feature.caption} />
      </p>
      <p className="mt-2 border-l-2 border-taxi pl-3 text-xs leading-relaxed text-muted">
        <Rich text={feature.context} />
      </p>
    </div>
  );
}

export async function NationalSection() {
  const { copy, event, map } = await getSiteContent();
  const n = copy.home.national;
  return (
    <section aria-labelledby="national-title" className="mt-24" id="map">
      <Container>
        <div className="grid gap-10 border-t-2 border-ink pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-14">
          {/* Intro */}
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="kicker text-burgundy">
              <span className="mr-3 text-ink">No. {n.number}</span>
              {n.kicker}
            </p>
            <h2 id="national-title" className="headline mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)] uppercase">
              <Rich text={n.title} />
            </h2>
            <p className="prose-news mt-5 max-w-xl">
              <Rich text={n.body} />
            </p>
          </div>

          {/* Map */}
          <figure className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
            <div className="border-2 border-ink bg-paper-white">
              <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2">
                <p className="kicker text-taxi">{n.mapTitle}</p>
                <p className="hidden kicker text-[0.625rem] text-paper/70 sm:block">{n.mapSubtitle}</p>
              </div>
              <MumbaiMap className="block h-auto w-full" map={map} />
            </div>
            <figcaption className="mt-2 space-y-1 text-[0.6875rem] leading-relaxed text-muted">
              <p>
                <Rich text={n.mapCaption} />
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
            <p className="label text-[0.6875rem]">{n.keyTitle}</p>
            <ul aria-label="Railway lines" className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink pb-3">
              {map.railLines.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden className="h-1.5 w-8" style={{ background: l.colour }} />
                  {l.name}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="h-0 w-8 border-t-[3px] border-dashed border-ink" />
                {n.seaLink}
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="size-4 border border-ink bg-[#DFD2B8]" />
                {n.cityDistrict}
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden className="size-4 border border-ink bg-paper-deep" />
                {n.suburbanDistrict}
              </li>
            </ul>
            <ol aria-label="Landmarks" className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {map.landmarks.map((l) => (
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
            <p className="label text-[0.6875rem]">{n.figuresTitle}</p>
            <table className="mt-3 w-full border-y-2 border-ink text-left">
              <caption className="sr-only">{n.figuresTitle}</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="py-2 kicker text-[0.625rem] font-medium">
                    {n.metricHeading}
                  </th>
                  <th scope="col" className="py-2 text-right kicker text-[0.625rem] font-medium">
                    {n.figureHeading}
                  </th>
                </tr>
              </thead>
              <tbody>
                {event.participation.map((m) => (
                  <tr key={m.label} className="border-b border-rule last:border-b-0">
                    <th scope="row" className="py-2.5 font-display text-lg font-normal">
                      {m.label}
                    </th>
                    <td className="py-2.5 text-right">
                      {m.value ? (
                        <span className="headline text-2xl text-burgundy">{m.value}</span>
                      ) : (
                        <span className="kicker text-[0.6875rem] text-muted">{n.notPublished}</span>
                      )}
                      {m.status === "target" && <StatusTag status="target" className="ml-2" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">
              <Rich text={n.figuresNote} />
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
