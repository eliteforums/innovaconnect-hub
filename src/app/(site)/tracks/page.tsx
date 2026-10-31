import { getSiteContent } from "@/lib/content";
import { DomainPanels } from "@/components/home/DomainPanels";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Rich, SectionHeader } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/tracks", copy.tracks.seo.title, copy.tracks.seo.description);
}

export default async function TracksPage() {
  const { copy, domains } = await getSiteContent();
  const tr = copy.tracks;
  const [ai, startup] = domains.list;
  return (
    <>
      <PageHeader
        section={tr.section}
        crumbs={[{ label: tr.section, href: "/tracks" }]}
        title={tr.title}
        deck={tr.deck}
      />
      <Container className="mt-12">
        <DomainPanels headingLevel="h2" />

        <section aria-labelledby="compare-title" className="mt-20">
          <SectionHeader number={tr.compareNumber} kicker={tr.compareKicker} id="compare-title" title={tr.compareTitle} />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">{tr.compareTitle}</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="w-1/4 py-3 pr-4 kicker text-[0.6875rem] font-medium text-muted">
                    {tr.compareHeading}
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    <span className="kicker text-violet">Domain {ai?.number}</span>
                    <span className="headline block text-2xl">{ai?.name}</span>
                  </th>
                  <th scope="col" className="py-3">
                    <span className="kicker text-burgundy">Domain {startup?.number}</span>
                    <span className="headline block text-2xl">{startup?.name}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tr.compareRows.map((r, i) => (
                  <tr key={`${r.label}-${i}`} className="border-b border-ink/30">
                    <th scope="row" className="py-4 pr-4 align-top label text-[0.75rem]">
                      {r.label}
                    </th>
                    <td className="py-4 pr-4 align-top text-charcoal">
                      <Rich text={r.ai} />
                    </td>
                    <td className="py-4 align-top text-charcoal">
                      <Rich text={r.startup} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>
    </>
  );
}
