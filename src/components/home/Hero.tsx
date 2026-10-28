import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Layers, MapPin } from "lucide-react";
import { event } from "@/content/event";
import { sidebarFeatures, type CityFeature } from "@/content/city";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, Tag } from "@/components/ui";
import { isRegistrationOpen, registrationCopy } from "@/lib/site";
import bmc from "@/assets/cutouts/bmc.webp";
import bus from "@/assets/cutouts/bus.webp";
import gateway from "@/assets/cutouts/gateway.webp";
import skyline from "@/assets/cutouts/skyline.webp";
import splashRed from "@/assets/cutouts/splash-red.webp";
import splashYellow from "@/assets/cutouts/splash-yellow.webp";
import taxi from "@/assets/cutouts/taxi.webp";
import train from "@/assets/cutouts/train.webp";

export function Hero() {
  const [coast, ...rightFeatures] = sidebarFeatures;
  return (
    <Container className="pt-6 lg:pt-8">
      <div className="grid gap-x-8 xl:grid-cols-[200px_minmax(0,1fr)_216px]">
        {/* Left column — the coastline feature (desktop only; other sizes use the strip) */}
        <aside aria-label="City feature" className="hidden border-r border-ink pr-6 xl:block">
          <CoastFeature feature={coast} />
        </aside>

        <div className="min-w-0">
          <Masthead />
          <LeadStory />
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
        <p className="kicker text-burgundy">The city edition · Four stories</p>
        <ul className="scroll-strip -mx-4 mt-4 flex scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {sidebarFeatures.map((f) => (
            <li key={f.id} className="w-[72vw] max-w-[300px] shrink-0 md:w-auto md:max-w-none">
              <SidebarFeature feature={f} />
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

function Masthead() {
  return (
    <div className="reveal reveal-1 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6">
      <div className="@container min-w-0">
        <h1 className="headline whitespace-nowrap text-center text-[14.6cqw] font-black leading-[0.8] tracking-[-0.025em] lg:text-left">
          INNOVAHACK
          <span className="sr-only"> Chapter 2, 2027</span>
        </h1>
        <p className="mt-3 border-t border-ink pt-2 text-center kicker text-[0.625rem] lg:text-left">
          Innovation <Sep /> Ideas <Sep /> Technology <Sep /> Startups <Sep /> For a brighter India
        </p>
      </div>

      {/* Edition ticket */}
      <div className="hidden items-end gap-4 lg:flex">
        <div className="text-center">
          <div className="border-2 border-ink bg-paper-white px-4 pb-1 pt-1.5">
            <p className="font-display text-xl font-bold uppercase leading-none text-burgundy">Chapter 02</p>
            <p className="mt-1 border-t-2 border-ink pt-1 headline text-[3.25rem] leading-none">2027</p>
          </div>
          <p className="mt-1.5 kicker text-[0.5625rem] leading-snug">
            A national hackathon
            <br />
            by {event.organizer}
          </p>
        </div>
        <div className="hidden w-[112px] 2xl:block">
          <p className="kicker text-[0.5625rem] leading-relaxed">
            India&rsquo;s next generation of builders creating real impact.
          </p>
          <Image src={gateway} alt="" sizes="112px" className="mt-2 h-auto w-full opacity-80 mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="mx-1 text-burgundy">|</span>;
}

function LeadStory() {
  const status = registrationCopy[event.registration.status];
  const meta = [
    { icon: MapPin, label: "India wide" },
    { icon: Layers, label: "Hybrid format" },
    { icon: CalendarDays, label: "2027" },
    { icon: Building2, label: `By ${event.organizer}` },
  ];
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-4">
      <div className="reveal reveal-2 flex flex-col">
        <Tag className="self-start">The lead story</Tag>
        <h2 className="headline mt-4 text-[clamp(3.1rem,8.6vw,6.4rem)] font-black uppercase leading-[0.86] lg:text-[clamp(3.25rem,4.9vw,5.4rem)]">
          <span className="text-burgundy">Mumbai</span>
          <br />
          builds
          <br />
          the future.
        </h2>
        <p className="mt-5 font-display text-2xl font-bold leading-tight md:text-[1.75rem]">
          Two domains. One national stage.
        </p>
        <p className="prose-news mt-3 max-w-xl">{event.description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>a]:whitespace-nowrap">
          <ButtonLink href="/tracks">Explore the tracks</ButtonLink>
          {isRegistrationOpen() ? (
            <ButtonLink href="/register" variant="outline">
              Register now
            </ButtonLink>
          ) : (
            <ButtonLink href="/register#updates" variant="outline">
              Get event updates
            </ButtonLink>
          )}
        </div>
        <p className="mt-3 kicker text-[0.6875rem] text-muted">
          <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-taxi ring-1 ring-ink" />
          {status.badge}
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ink pt-4 sm:flex sm:flex-wrap sm:gap-x-6 lg:mt-auto">
          {meta.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 kicker text-[0.6875rem]">
              <Icon aria-hidden className="size-4 text-burgundy" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <HeroCollage />
    </div>
  );
}

const themes = ["Ideas", "People", "Culture", "Technology", "A brighter India"];

function HeroCollage() {
  // Each layer is positioned in % of the collage, so it scales as one piece.
  const layer = "pointer-events-none absolute h-auto max-w-none select-none";
  return (
    <figure className="reveal reveal-3">
      <div className="relative aspect-square overflow-hidden sm:aspect-[5/4] lg:aspect-[5/6]">
        <Image
          src={splashYellow}
          alt=""
          sizes="(min-width: 1024px) 40vw, 90vw"
          className={`${layer} right-[-12%] top-[10%] w-[112%] rotate-[-4deg]`}
        />
        <Image
          src={skyline}
          alt=""
          sizes="(min-width: 1024px) 40vw, 90vw"
          className={`${layer} bottom-[30%] left-[-4%] w-[108%] opacity-50 mix-blend-multiply`}
        />
        <Image
          src={bmc}
          alt="The Brihanmumbai Municipal Corporation headquarters, a Victorian Gothic building with a tall central dome."
          priority
          sizes="(min-width: 1024px) 30vw, 70vw"
          className={`${layer} bottom-[24%] left-[13%] w-[76%]`}
        />
        <Image
          src={splashRed}
          alt=""
          sizes="(min-width: 1024px) 22vw, 50vw"
          className={`${layer} bottom-[30%] left-[-8%] w-[52%]`}
        />
        <Image
          src={train}
          alt="A white, purple and yellow suburban local train."
          sizes="(min-width: 1024px) 28vw, 60vw"
          className={`${layer} drift-slow bottom-[11%] right-[-14%] w-[62%]`}
        />
        <Image
          src={bus}
          alt="A red BEST bus."
          sizes="(min-width: 1024px) 26vw, 55vw"
          className={`${layer} drift-slow bottom-[10%] left-[-6%] w-[52%]`}
        />
        <Image
          src={taxi}
          alt="A black-and-yellow Premier Padmini taxi."
          priority
          sizes="(min-width: 1024px) 34vw, 75vw"
          className={`${layer} drift bottom-[0%] left-[20%] w-[64%]`}
        />

        <p
          aria-hidden
          className="absolute left-[2%] top-[9%] rotate-[-14deg] font-hand text-[clamp(1.1rem,2.2vw,1.6rem)] leading-[1.05] text-ink"
        >
          Mumbai
          <br />
          More than a city
          <br />A mindset
        </p>
        <ul className="absolute right-[1%] top-[2%] hidden border-l-2 border-ink bg-paper/70 py-1 pl-3 pr-2 sm:block">
          {themes.map((t) => (
            <li key={t} className="kicker text-[0.625rem] leading-[1.9]">
              {t}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-2 kicker text-[0.625rem] text-muted">
        Collage · A taxi, a BEST bus and a suburban local train before the Brihanmumbai Municipal Corporation
        headquarters
      </figcaption>
    </figure>
  );
}

function CoastFeature({ feature }: { feature: CityFeature }) {
  return (
    <article className="group">
      <Link href={feature.href} className="block">
        <Figure media={feature.media} aspect="aspect-[3/4]" showCredit={false} sizes="200px" />
        <p className="mt-4 headline text-[2rem] uppercase leading-none tracking-wide">Mumbai</p>
        <p className="mt-1 font-sans text-lg font-medium uppercase leading-snug tracking-[0.14em] transition-colors group-hover:text-burgundy">
          {feature.title}
        </p>
        <p className="mt-3 flex items-end justify-between gap-2 border-t border-ink pt-3 kicker text-[0.6875rem] leading-relaxed">
          <span>
            Same streets.
            <br />
            Bigger dreams.
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
