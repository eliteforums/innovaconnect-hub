import { Check } from "lucide-react";
import { domainRules, domains, type Domain } from "@/content/domains";
import Image from "next/image";
import { ButtonLink } from "@/components/ui";
import aiArt from "@/assets/cutouts/ai.webp";
import bulbArt from "@/assets/cutouts/bulb.webp";

const accent = {
  violet: {
    bar: "bg-violet",
    text: "text-violet",
    soft: "bg-violet-soft",
    button: "violet" as const,
    bullet: "bg-violet",
  },
  burgundy: {
    bar: "bg-burgundy",
    text: "text-burgundy",
    soft: "bg-rose",
    button: "primary" as const,
    bullet: "bg-burgundy",
  },
};

export function DomainPanels({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        {domains.map((d) => (
          <DomainPanel key={d.slug} domain={d} headingLevel={headingLevel} />
        ))}
      </div>
      <DomainRule />
    </div>
  );
}

const art = {
  "artificial-intelligence": {
    src: aiArt,
    alt: "Artwork of a human profile in violet light above a city skyline.",
    note: ["Intelligence", "for a brighter", "tomorrow."],
  },
  "open-innovation": {
    src: bulbArt,
    alt: "Artwork of a glowing light bulb in front of a sketched sea bridge.",
    note: ["Ideas", "Startups", "Real impact"],
  },
} as const;

function DomainPanel({ domain: d, headingLevel: H }: { domain: Domain; headingLevel: "h2" | "h3" }) {
  const a = accent[d.accent];
  const visual = art[d.slug];
  return (
    <article className="in-view relative flex flex-col border-2 border-ink bg-paper-white">
      <div className={`h-2 ${a.bar}`} />
      <div className="p-5 sm:p-7">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:gap-4">
          <p aria-hidden className={`headline text-[4.5rem] font-black leading-[0.8] sm:text-[5.5rem] ${a.text}`}>
            {d.number}
          </p>
          <div className="min-w-0">
            <p className={`kicker ${a.text}`}>Domain {d.number}</p>
            <H className="headline mt-1 text-[clamp(1.6rem,3.2vw,2.75rem)] uppercase">{d.name}</H>
          </div>
        </div>
        <div className="mt-5 grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="font-display text-xl italic">{d.headline}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-charcoal">{d.summary}</p>
            <ButtonLink href={`/tracks/${d.slug}`} variant={a.button} size="sm" className="mt-5">
              {d.cta}
            </ButtonLink>
          </div>
          <div className="relative flex items-center justify-center">
            <Image
              src={visual.src}
              alt={visual.alt}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 90vw"
              className="h-auto w-full max-w-[360px] mix-blend-multiply"
            />
            <p aria-hidden className="absolute -bottom-2 right-0 rotate-[-6deg] font-hand text-lg leading-tight">
              {visual.note.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col border-t border-ink/30 p-5 sm:p-7">
        <p className="label text-[0.6875rem]">Potential areas</p>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {d.areas.map((area) => (
            <li key={area} className="flex items-start gap-2 text-[0.9375rem]">
              <span aria-hidden className={`mt-2 size-1.5 shrink-0 ${a.bullet}`} />
              {area}
            </li>
          ))}
        </ul>
        <p className={`mt-5 flex items-start gap-2 p-3 text-sm font-medium ${a.soft}`}>
          <Check aria-hidden className={`mt-0.5 size-4 shrink-0 ${a.text}`} />
          {d.aiPolicy}
        </p>
      </div>
    </article>
  );
}

export function DomainRule() {
  return (
    <aside aria-label="The two-domain rule" className="mt-6 grid gap-4 border-y-2 border-ink py-5 md:grid-cols-[220px_1fr]">
      <p className="headline text-2xl uppercase">The two-domain rule</p>
      <ul className="grid gap-2 md:grid-cols-2">
        {domainRules.map((r) => (
          <li key={r} className="flex gap-2 text-sm text-charcoal">
            <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 bg-taxi ring-1 ring-ink" />
            {r}
          </li>
        ))}
      </ul>
    </aside>
  );
}
