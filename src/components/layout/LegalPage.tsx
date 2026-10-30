import type { ArticleBlock } from "@/content/types";
import { getSiteContent } from "@/lib/content";
import { t } from "@/lib/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArticleBody } from "@/components/updates/ArticleBody";
import { Container, Rich } from "@/components/ui";

export type LegalSection = { title: string; body: ArticleBlock[] };

/** Shared layout for the privacy and terms pages. */
export async function LegalPage({
  section,
  path,
  title,
  deck,
  sections,
}: {
  section: string;
  path: string;
  title: string;
  deck: string;
  sections: LegalSection[];
}) {
  const c = await getSiteContent();
  const note = c.copy.global.legalDraftNote;
  const withVars = (blocks: ArticleBlock[]) =>
    blocks.map((b) =>
      b.type === "list" ? { ...b, items: (b.items ?? []).map((i) => t(c, i)) } : { ...b, text: t(c, b.text) },
    ) as ArticleBlock[];
  return (
    <>
      <PageHeader section={section} crumbs={[{ label: section, href: path }]} title={title} deck={t(c, deck)} />
      <Container className="mt-12">
        {note && (
          <p className="max-w-3xl border-l-4 border-taxi bg-paper-white px-4 py-3 text-sm text-charcoal">
            <Rich text={note} accent="font-semibold text-ink" />
          </p>
        )}
        <div className="mt-10 max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={`${s.title}-${i}`} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="headline border-t-2 border-ink pt-3 text-2xl uppercase">
                <span className="mr-3 kicker text-burgundy">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <ArticleBody
                blocks={withVars(s.body)}
                className="prose-news mt-3 space-y-3 [&_ul]:list-disc [&_ul]:pl-6"
              />
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
