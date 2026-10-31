import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Layers, MapPin } from "lucide-react";
import type { CityFeature } from "@/content/city";
import { getSiteContent, type SiteContent } from "@/lib/content";
import { isRegistrationOpen, registrationState, t } from "@/lib/site";
import { ContentImage } from "@/components/media/ContentImage";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, Rich, Tag } from "@/components/ui";

export async function Hero() {
  const c = await getSiteContent();
  const [coast, ...rightFeatures] = c.city.sidebar;
  return (
    <Container className="pt-6 lg:pt-8">
      <div className="grid gap-x-8 xl:grid-cols-[200px_minmax(0,1fr)_216px]">
        {/* Left column — the coastline feature (desktop only; other sizes use the strip) */}
        <aside aria-label="City feature" className="hidden border-r border-ink pr-6 xl:block">
          {coast && <CoastFeature feature={coast} c={c} />}
        </aside>

        <div className="min-w-0">
          <Masthead c={c} />
          <LeadStory c={c} />
        </div>

        <aside aria-label="City features" className="hidden border-l border-ink pl-6 xl:block">
          <div className="divide-y divide-ink">
            {rightFeatures.map((f) => (
              <div key={f.id} className="py-4 first:pt-0">
                <SidebarFeature feature={f} />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Sidebar strip for tablet and mobile */}
      <div className="mt-10 border-t-2 border-ink pt-4 xl:hidden">
        <p className="kicker text-burgundy">{c.copy.home.stripLabel}</p>
        <ul className="scroll-strip -mx-4 mt-4 flex scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {c.city.sidebar.map((f) => (
            <li key={f.id} className="w-[72vw] max-w-[300px] shrink-0 md:w-auto md:max-w-none">
              <SidebarFeature feature={f} />
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

function Masthead({ c }: { c: SiteContent }) {
  const m = c.copy.home.masthead;
  return (
    <div className="reveal reveal-1 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6">
      <div className="@container min-w-0">
        <h1 className="headline whitespace-nowrap text-center text-[14.6cqw] font-black leading-[0.8] tracking-[-0.025em] lg:text-left">
          {m.wordmark}
          <span className="sr-only"> {m.headingSuffix}</span>
        </h1>
        <p className="mt-3 border-t border-ink pt-2 text-center kicker text-[0.625rem] lg:text-left">
          {m.themes.map((theme, i) => (
            <span key={`${theme}-${i}`}>
              {i > 0 && (
                <>
                  {" "}
                  <span className="mx-1 text-burgundy">|</span>{" "}
                </>
              )}
              {theme}
            </span>
          ))}
        </p>
      </div>

      {/* Edition ticket */}
      <div className="hidden items-end gap-4 lg:flex">
        <div className="text-center">
          <div className="border-2 border-ink bg-paper-white px-4 pb-1 pt-1.5">
            <p className="font-display text-xl font-bold uppercase leading-none text-burgundy">{m.ticketTop}</p>
            <p className="mt-1 border-t-2 border-ink pt-1 headline text-[3.25rem] leading-none">{m.ticketMain}</p>
          </div>
          <p className="mt-1.5 kicker text-[0.5625rem] leading-snug">
            <Rich text={t(c, m.ticketBottom)} />
          </p>
        </div>
        <div className="hidden w-[112px] 2xl:block">
          <p className="kicker text-[0.5625rem] leading-relaxed">{m.sideNote}</p>
          <ContentImage
            src={c.images.mastheadSketch}
            alt=""
            sizes="112px"
            className="mt-2 h-auto w-full opacity-80 mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}

const metaIcons = [MapPin, Layers, CalendarDays, Building2];

function LeadStory({ c }: { c: SiteContent }) {
  const lead = c.copy.home.lead;
  const status = registrationState(c);
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-4">
      <div className="reveal reveal-2 flex flex-col">
        <Tag className="self-start">{lead.tag}</Tag>
        <h2 className="headline mt-4 text-[clamp(3.1rem,8.6vw,6.4rem)] font-black uppercase leading-[0.86] lg:text-[clamp(3.25rem,4.9vw,5.4rem)]">
          <Rich text={lead.headline} />
        </h2>
        <p className="mt-5 font-display text-2xl font-bold leading-tight md:text-[1.75rem]">
          <Rich text={lead.subhead} />
        </p>
        <p className="prose-news mt-3 max-w-xl">{c.event.description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>a]:whitespace-nowrap">
          <ButtonLink href="/tracks">{lead.primaryCta}</ButtonLink>
          {isRegistrationOpen(c) ? (
            <ButtonLink href="/register" variant="outline">
              {c.copy.global.cta.register}
            </ButtonLink>
          ) : (
            <ButtonLink href="/register#updates" variant="outline">
              {c.copy.global.cta.updates}
            </ButtonLink>
          )}
        </div>
        <p className="mt-3 kicker text-[0.6875rem] text-muted">
          <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-taxi ring-1 ring-ink" />
          {status.badge}
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ink pt-4 sm:flex sm:flex-wrap sm:gap-x-6 lg:mt-auto">
          {lead.meta.map((label, i) => {
            const Icon = metaIcons[i % metaIcons.length];
            return (
              <li key={`${label}-${i}`} className="flex items-center gap-2 kicker text-[0.6875rem]">
                <Icon aria-hidden className="size-4 text-burgundy" />
                {t(c, label)}
              </li>
            );
          })}
        </ul>
      </div>

      <HeroCollage c={c} />
    </div>
  );
}

function HeroCollage({ c }: { c: SiteContent }) {
  const col = c.copy.home.collage;
  const img = c.images;
  // Each layer is positioned in % of the collage, so it scales as one piece.
  const layer = "pointer-events-none absolute h-auto max-w-none select-none";
  return (
    <figure className="reveal reveal-3">
      <div className="relative aspect-square overflow-hidden sm:aspect-[5/4] lg:aspect-[5/6]">
        <ContentImage
          src={img.heroSplashYellow}
          alt=""
          sizes="(min-width: 1024px) 40vw, 90vw"
          className={`${layer} right-[-12%] top-[10%] w-[112%] rotate-[-4deg]`}
        />
        <ContentImage
          src={img.heroSkyline}
          alt=""
          sizes="(min-width: 1024px) 40vw, 90vw"
          className={`${layer} bottom-[30%] left-[-4%] w-[108%] opacity-50 mix-blend-multiply`}
        />
        <ContentImage
          src={img.heroBuilding}
          alt={col.buildingAlt}
          priority
          sizes="(min-width: 1024px) 30vw, 70vw"
          className={`${layer} bottom-[24%] left-[13%] w-[76%]`}
        />
        <ContentImage
          src={img.heroSplashRed}
          alt=""
          sizes="(min-width: 1024px) 22vw, 50vw"
          className={`${layer} bottom-[30%] left-[-8%] w-[52%]`}
        />
        <ContentImage
          src={img.heroTrain}
          alt={col.trainAlt}
          sizes="(min-width: 1024px) 28vw, 60vw"
          className={`${layer} drift-slow bottom-[11%] right-[-14%] w-[62%]`}
        />
        <ContentImage
          src={img.heroBus}
          alt={col.busAlt}
          sizes="(min-width: 1024px) 26vw, 55vw"
          className={`${layer} drift-slow bottom-[10%] left-[-6%] w-[52%]`}
        />
        <ContentImage
          src={img.heroTaxi}
          alt={col.taxiAlt}
          priority
          sizes="(min-width: 1024px) 34vw, 75vw"
          className={`${layer} drift bottom-[0%] left-[20%] w-[64%]`}
        />

        <p
          aria-hidden
          className="absolute left-[2%] top-[9%] rotate-[-14deg] font-hand text-[clamp(1.1rem,2.2vw,1.6rem)] leading-[1.05] text-ink"
        >
          <Rich text={col.note} accent="text-burgundy" />
        </p>
        <ul className="absolute right-[1%] top-[2%] hidden border-l-2 border-ink bg-paper/70 py-1 pl-3 pr-2 sm:block">
          {col.themes.map((theme, i) => (
            <li key={`${theme}-${i}`} className="kicker text-[0.625rem] leading-[1.9]">
              {theme}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-2 kicker text-[0.625rem] text-muted">{col.caption}</figcaption>
    </figure>
  );
}

function CoastFeature({ feature, c }: { feature: CityFeature; c: SiteContent }) {
  const coast = c.copy.home.coast;
  return (
    <article className="group">
      <Link href={feature.href} className="block">
        <Figure media={feature.media} aspect="aspect-[3/4]" showCredit={false} sizes="200px" />
        <p className="mt-4 headline text-[2rem] uppercase leading-none tracking-wide">{coast.heading}</p>
        <p className="mt-1 font-sans text-lg font-medium uppercase leading-snug tracking-[0.14em] transition-colors group-hover:text-burgundy">
          {feature.title}
        </p>
        <p className="mt-3 flex items-end justify-between gap-2 border-t border-ink pt-3 kicker text-[0.6875rem] leading-relaxed">
          <span>
            <Rich text={coast.footer} />
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
      <p className="mt-4 text-xs leading-relaxed text-muted">{feature.context}</p>
    </article>
  );
}

function SidebarFeature({ feature }: { feature: CityFeature }) {
  return (
    <article className="group">
      <Link href={feature.href} className="block">
        <Figure media={feature.media} aspect="aspect-[4/3]" showCredit={false} sizes="(min-width: 1280px) 220px, 72vw" />
        <p className="mt-3 kicker text-[0.625rem] text-burgundy">{feature.label}</p>
        <h3 className="headline mt-1 text-xl uppercase transition-colors group-hover:text-burgundy">{feature.title}</h3>
        <p className="mt-2 flex items-start justify-between gap-2 text-sm text-charcoal">
          <span className="italic">{feature.caption}</span>
          <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
    </article>
  );
}
