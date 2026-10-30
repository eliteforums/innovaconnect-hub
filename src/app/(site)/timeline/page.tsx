import { getSiteContent } from "@/lib/content";
import { RailwayJourney } from "@/components/timeline/RailwayJourney";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, SectionHeader, StatusTag } from "@/components/ui";
import { formatDate, primaryCta, registrationState } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/timeline", copy.timeline.meta.title, copy.timeline.meta.description);
}

export default async function TimelinePage() {
  const c = await getSiteContent();
  const x = c.copy.timeline;
  const cta = primaryCta(c);
  const status = registrationState(c);
  const keyDates = [
    { label: x.opensLabel, value: c.event.registration.opensOn.value },
    { label: x.closesLabel, value: c.event.registration.closesOn.value },
    ...c.event.journey.map((s) => ({ label: s.title, value: s.date })),
  ];
  return (
    <>
      <PageHeader
        section={x.section}
        crumbs={[{ label: x.section, href: "/timeline" }]}
        title={x.title}
        deck={x.deck}
        aside={
          <div className="border-2 border-ink bg-paper-white p-6">
            <p className="kicker text-burgundy">{x.statusKicker}</p>
            <p className="headline mt-2 text-3xl uppercase">{status.badge}</p>
            <p className="mt-2 text-sm text-charcoal">{status.body}</p>
            <ButtonLink href={cta.href} className="mt-5" size="sm">
              {cta.label}
            </ButtonLink>
          </div>
        }
      />
      <Container className="mt-16">
        <SectionHeader number="01" kicker={x.routeKicker} title={x.routeTitle} />
        <div className="mt-10">
          <RailwayJourney />
        </div>

        <section aria-labelledby="dates-title" className="mt-20">
          <SectionHeader number="02" kicker={x.datesKicker} id="dates-title" title={x.datesTitle} />
          <table className="mt-6 w-full border-y-2 border-ink text-left">
            <caption className="sr-only">{x.datesTitle}</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="py-2 kicker text-[0.625rem] font-medium">
                  {x.milestoneHeading}
                </th>
                <th scope="col" className="py-2 text-right kicker text-[0.625rem] font-medium">
                  {x.dateHeading}
                </th>
              </tr>
            </thead>
            <tbody>
              {keyDates.map((d, i) => (
                <tr key={`${d.label}-${i}`} className="border-b border-rule last:border-0">
                  <th scope="row" className="py-3 pr-4 font-display text-lg font-normal">
                    {d.label}
                  </th>
                  <td className="py-3 text-right">
                    {d.value ? <span className="font-mono">{formatDate(d.value)}</span> : <StatusTag status="unconfirmed" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">{x.istNote}</p>
        </section>
      </Container>
    </>
  );
}
