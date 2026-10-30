import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Domain } from "@/content/domains";
import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { fill, primaryCta } from "@/lib/site";

export async function DomainDetail({ domain: d }: { domain: Domain }) {
  const c = await getSiteContent();
  const x = c.copy.domainDetail;
  const tracksLabel = c.copy.tracks.section;
  const other = c.domains.list.find((o) => o.slug !== d.slug);
  const violet = d.accent === "violet";
  const cta = primaryCta(c);
  return (
    <>
      <PageHeader
        section={`Domain ${d.number} · ${x.sectionSuffix}`}
        accent={violet ? "violet" : "burgundy"}
        crumbs={[
          { label: tracksLabel, href: "/tracks" },
          { label: d.shortName, href: `/tracks/${d.slug}` },
        ]}
        title={
          <>
            <span className={violet ? "text-violet" : "text-burgundy"}>{d.number}</span> {d.name}
          </>
        }
        deck={
          <>
            <p className="font-display text-2xl italic text-ink">{d.headline}</p>
            <p className="mt-3">
              <Rich text={d.description} />
            </p>
          </>
        }
        aside={<Figure media={d.media} aspect="aspect-video" priority />}
      />

      <Container className="mt-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <section aria-labelledby="areas-title">
            <SectionHeader number="01" kicker={x.areasKicker} id="areas-title" title={x.areasTitle} />
            <ul className="mt-6 grid border-l border-t border-ink sm:grid-cols-2">
              {d.areas.map((a, i) => (
                <li key={a} className="flex items-baseline gap-3 border-b border-r border-ink bg-paper-white/60 p-4">
                  <span className={`kicker ${violet ? "text-violet" : "text-burgundy"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-xl">{a}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="choose-title" className={`border-2 border-ink p-6 sm:p-8 ${violet ? "bg-violet-soft" : "bg-rose"}`}>
            <p className={`kicker ${violet ? "text-violet" : "text-burgundy"}`}>{x.chooseKicker}</p>
            <h2 id="choose-title" className="headline mt-2 text-3xl uppercase">
              {fill(x.chooseTitle, { shortName: d.shortName })}
            </h2>
            <ul className="mt-5 space-y-3">
              {d.chooseIf.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden className={`mt-2 size-2 shrink-0 ${violet ? "bg-violet" : "bg-burgundy"}`} />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-ink pt-4 font-semibold">{d.aiPolicy}</p>
          </section>
        </div>

        <section aria-labelledby="themes-title" className="mt-20">
          <SectionHeader
            number="02"
            kicker={x.themesKicker}
            id="themes-title"
            title={x.themesTitle}
            deck={x.themesDeck}
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {d.challengeThemes.map((t) => (
              <li key={t} className="border-2 border-ink bg-paper-white px-3 py-1.5 label text-[0.75rem]">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="prompts-title" className="mt-20">
          <SectionHeader
            number="03"
            kicker={x.promptsKicker}
            id="prompts-title"
            title={x.promptsTitle}
            deck={x.promptsDeck}
          />
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {d.prompts.map((p, i) => (
              <li key={p} className="border-t-4 border-ink pt-4">
                <p className={`headline text-5xl ${violet ? "text-violet" : "text-burgundy"}`}>Q{i + 1}</p>
                <p className="mt-2 font-display text-xl leading-snug">{p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="eval-title" className="mt-20 grid gap-8 lg:grid-cols-2">
          <div className="border-2 border-dashed border-ink/60 p-6">
            <p className="kicker text-burgundy">{x.evalKicker}</p>
            <h2 id="eval-title" className="headline mt-2 text-3xl uppercase">
              {x.evalTitle}
            </h2>
            <p className="mt-3 text-charcoal">
              <Rich text={x.evalBody} />
            </p>
            <StatusTag status="unconfirmed" className="mt-4" />
          </div>
          <div className="border-2 border-ink bg-paper-white p-6">
            <p className="kicker text-burgundy">{x.ruleTitle}</p>
            <ul className="mt-3 space-y-2 text-sm text-charcoal">
              {c.domains.rules.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 bg-taxi ring-1 ring-ink" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-16 flex flex-col gap-4 border-y-2 border-ink py-6 sm:flex-row sm:items-center sm:justify-between">
          {other ? (
            <Link href={`/tracks/${other.slug}`} className="group flex items-center gap-3">
              <ArrowLeft aria-hidden className="size-5 transition-transform group-hover:-translate-x-1" />
              <span>
                <span className="block kicker text-muted">{x.otherLabel}</span>
                <span className="headline text-2xl">
                  {other.number} · {other.name}
                </span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          <ButtonLink href={cta.href} variant={violet ? "violet" : "primary"}>
            {cta.label}
          </ButtonLink>
        </div>
        <p className="mt-4">
          <Link href="/tracks" className="inline-flex items-center gap-2 label text-[0.75rem] hover:text-burgundy">
            {x.compareLink} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </p>
      </Container>
    </>
  );
}
