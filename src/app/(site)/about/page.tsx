import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Figure } from "@/components/media/Figure";
import { ArticleBody } from "@/components/updates/ArticleBody";
import { ButtonLink, Container, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { t } from "@/lib/site";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/about", copy.about.seo.title, copy.about.seo.description);
}

export default async function AboutPage() {
  const c = await getSiteContent();
  const { event } = c;
  const a = c.copy.about;
  const facts = [
    { label: a.factLabels.edition, value: event.chapterLabel, status: "confirmed" as const },
    { label: a.factLabels.year, value: String(event.year.value ?? ""), status: event.year.status },
    { label: a.factLabels.scope, value: event.scope.value, status: event.scope.status },
    { label: a.factLabels.format, value: event.format.value, status: event.format.status },
    { label: a.factLabels.domains, value: a.factLabels.domainsValue, status: "confirmed" as const },
    { label: a.factLabels.venue, value: event.venue.value, status: event.venue.status },
  ];
  return (
    <>
      <PageHeader section={a.section} crumbs={[{ label: a.section, href: "/about" }]} title={a.title} deck={event.description} />

      <Container className="mt-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <ArticleBody
            blocks={a.article.map((b) => ("text" in b ? { ...b, text: t(c, b.text) } : b))}
            className="prose-news space-y-5 text-lg [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-3 [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:text-7xl [&>p:first-child]:first-letter:font-black [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-burgundy"
          />

          <aside className="space-y-8">
            <div className="border-2 border-ink bg-paper-white">
              <p className="border-b-2 border-ink bg-ink px-5 py-3 kicker text-taxi">{a.factsTitle}</p>
              <dl className="divide-y divide-rule px-5">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="label text-[0.6875rem] text-muted">{f.label}</dt>
                    <dd className="flex flex-col items-end gap-1 text-right">
                      {f.value && <span className="font-display text-lg leading-tight">{f.value}</span>}
                      <StatusTag status={f.status} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <Figure media={a.figure} aspect="aspect-[4/3]" />
          </aside>
        </div>

        <section aria-labelledby="organizer-title" className="mt-20">
          <SectionHeader number={a.organizerNumber} kicker={a.organizerKicker} id="organizer-title" title={event.organizer} />
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <p className="prose-news text-lg">
              <Rich text={t(c, a.organizerBody)} />
            </p>
            <div className="flex flex-col items-start gap-4 border-l-4 border-taxi pl-6">
              <p className="font-display text-2xl italic">&ldquo;{event.tagline}&rdquo;</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/chapter-1" variant="outline">
                  {a.archiveCta}
                </ButtonLink>
                <ButtonLink href="/contact">{a.contactCta}</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
