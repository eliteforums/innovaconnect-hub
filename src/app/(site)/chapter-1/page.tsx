import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Figure } from "@/components/media/Figure";
import { ChapterOneGallery } from "@/components/chapter1/ChapterOneGallery";
import { ButtonLink, Container, PendingNotice, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { t } from "@/lib/site";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/chapter-1", copy.chapter1Page.meta.title, copy.chapter1Page.meta.description);
}

export default async function ChapterOnePage() {
  const c = await getSiteContent();
  const { chapter1 } = c;
  const x = c.copy.chapter1Page;
  return (
    <>
      <PageHeader
        section={chapter1.label}
        crumbs={[{ label: c.navigation.primary.find((n) => n.href === "/chapter-1")?.label ?? "Chapter 1", href: "/chapter-1" }]}
        title={x.title}
        deck={x.deck}
        aside={<Figure media={x.figure} aspect="aspect-[4/3]" priority />}
      />

      <Container className="mt-16 space-y-20">
        <section aria-labelledby="metrics-title">
          <SectionHeader number="01" kicker={x.recordKicker} id="metrics-title" title={x.recordTitle} deck={x.recordDeck} />
          <ul className="mt-8 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
            {[...chapter1.metrics, ...chapter1.context].map((m, i) => (
              <li key={`${m.label}-${i}`} className="border-b border-r border-ink bg-paper-white/60 p-6">
                <StatusTag status={m.status} />
                <p className="headline mt-3 text-5xl font-black text-burgundy">{m.value}</p>
                <p className="mt-2 label text-[0.75rem]">{m.label}</p>
                <p className="mt-2 text-sm text-charcoal">
                  <Rich text={m.caption} />
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>
              <Rich text={x.reportedLegend} accent="font-semibold text-ink" />
            </p>
            <p>
              <Rich text={x.advertisedLegend} accent="font-semibold text-ink" />
            </p>
          </div>
          <p className="mt-2 text-sm text-muted">
            <Rich text={t(c, x.applicationsNote)} />
          </p>
        </section>

        <section aria-labelledby="ch1-domains-title">
          <SectionHeader
            number="02"
            kicker={x.domainsKicker}
            id="ch1-domains-title"
            title={x.domainsTitle}
            deck={chapter1.domainsNote}
          />
          <ol className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-5">
            {chapter1.domains.map((d, i) => (
              <li key={`${d.name}-${i}`} className="bg-paper-white p-5">
                <p className="kicker text-burgundy">
                  {x.trackLabel} {String(i + 1).padStart(2, "0")}
                </p>
                <p className="headline mt-2 text-xl">{d.name}</p>
                <p className="mt-2 text-sm text-charcoal">{d.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="ch1-structure-title">
          <SectionHeader
            number="03"
            kicker={x.structureKicker}
            id="ch1-structure-title"
            title={x.structureTitle}
            deck={x.structureDeck}
          />
          <ol className="mt-8 grid gap-6 md:grid-cols-5">
            {chapter1.structure.map((s, i) => (
              <li key={`${s.title}-${i}`} className="border-t-4 border-burgundy pt-4">
                <p className="kicker text-muted">
                  {x.roundLabel} {String(i + 1).padStart(2, "0")}
                </p>
                <p className="headline mt-1 text-xl uppercase">{s.title}</p>
                <p className="mt-2 text-sm text-charcoal">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="records-title">
          <SectionHeader number="04" kicker={x.recordsKicker} id="records-title" title={x.recordsTitle} deck={x.recordsDeck} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <RecordBlock
              title={x.recordTitles.winners}
              items={chapter1.winners.map((w) => [w.team, w.award, w.project].filter(Boolean).join(" — "))}
              kicker={x.pendingKicker}
              body={x.pendingBody}
            />
            <RecordBlock
              title={x.recordTitles.partners}
              items={chapter1.partners.filter((p) => p.verified).map((p) => `${p.name} · ${p.category}`)}
              kicker={x.pendingKicker}
              body={x.pendingBody}
            />
            <RecordBlock
              title={x.recordTitles.judges}
              items={chapter1.judgesAndMentors.map((j) => `${j.name} · ${j.role}`)}
              kicker={x.pendingKicker}
              body={x.pendingBody}
            />
          </div>
          <ChapterOneGallery />
          <p className="mt-4 text-sm text-muted">{x.rosterNote}</p>
        </section>

        <section aria-labelledby="forward-title">
          <SectionHeader number="05" kicker={x.forwardKicker} id="forward-title" title={x.forwardTitle} />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {chapter1.carriedForward.map((item, i) => (
              <li key={`${item.title}-${i}`} className="border-2 border-ink bg-paper-white p-6">
                <p className="headline text-2xl uppercase">{item.title}</p>
                <p className="mt-3 text-charcoal">
                  <Rich text={item.body} />
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="transition-title" className="border-2 border-ink bg-ink p-8 text-paper-white sm:p-12">
          <p className="kicker text-taxi">{x.transitionKicker}</p>
          <h2 id="transition-title" className="headline mt-4 max-w-4xl text-[clamp(2.25rem,5vw,4rem)] uppercase">
            <Rich text={x.transitionTitle} accent="text-taxi" />
          </h2>
          <p className="mt-5 max-w-2xl text-paper/85">
            <Rich text={x.transitionBody} accent="text-taxi" />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="taxi">
              {x.enterCta}
            </ButtonLink>
            {chapter1.links.map((l) => (
              <ButtonLink key={l.url} href={l.url} variant="light" external>
                {l.label}
              </ButtonLink>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

function RecordBlock({ title, items, kicker, body }: { title: string; items: string[]; kicker: string; body: string }) {
  if (items.length === 0) {
    return (
      <PendingNotice title={title} kicker={kicker}>
        <p className="text-sm">{body}</p>
      </PendingNotice>
    );
  }
  return (
    <div className="border-2 border-ink bg-paper-white p-6">
      <p className="headline text-2xl uppercase">{title}</p>
      <ul className="mt-3 space-y-1">
        {items.map((i, n) => (
          <li key={`${i}-${n}`}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
