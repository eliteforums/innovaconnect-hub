import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui";

export type LegalSection = { title: string; body: (string | string[])[] };

/** Shared layout for the privacy and terms pages. */
export function LegalPage({
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
  return (
    <>
      <PageHeader section={section} crumbs={[{ label: section, href: path }]} title={title} deck={deck} />
      <Container className="mt-12">
        <p className="max-w-3xl border-l-4 border-taxi bg-paper-white px-4 py-3 text-sm text-charcoal">
          <strong>Draft for organizer and legal review.</strong> This page describes how this website works today. It must
          be reviewed and approved before the site goes live.
        </p>
        <div className="mt-10 max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="headline border-t-2 border-ink pt-3 text-2xl uppercase">
                <span className="mr-3 kicker text-burgundy">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="prose-news mt-3 space-y-3">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="list-disc space-y-1 pl-6">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
