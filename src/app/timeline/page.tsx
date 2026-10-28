import { event } from "@/content/event";
import { Journey } from "@/components/home/Journey";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, SectionHeader, StatusTag } from "@/components/ui";
import { formatDate, primaryCta, registrationCopy } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/timeline",
  "Timeline — From First Idea to Final Stage",
  "The proposed InnovaHack Chapter 2 competition journey. Official dates will be published here once confirmed.",
);

export default function TimelinePage() {
  const cta = primaryCta();
  const keyDates = [
    { label: "Registration opens", fact: event.registration.opensOn },
    { label: "Registration closes", fact: event.registration.closesOn },
    ...event.journey.map((s) => ({ label: s.title, fact: { value: s.date, status: s.date ? ("confirmed" as const) : ("unconfirmed" as const) } })),
  ];
  return (
    <>
      <PageHeader
        section="Timeline"
        crumbs={[{ label: "Timeline", href: "/timeline" }]}
        title="From first idea to final stage."
        deck="These are the proposed Chapter 2 stages, subject to the organizer's final rules. No dates have been confirmed yet — each will be added here when it is."
        aside={
          <div className="border-2 border-ink bg-paper-white p-6">
            <p className="kicker text-burgundy">Current status</p>
            <p className="headline mt-2 text-3xl uppercase">{registrationCopy[event.registration.status].badge}</p>
            <p className="mt-2 text-sm text-charcoal">{registrationCopy[event.registration.status].body}</p>
            <ButtonLink href={cta.href} className="mt-5" size="sm">
              {cta.label}
            </ButtonLink>
          </div>
        }
      />
      <Container className="mt-16">
        <SectionHeader number="01" kicker="The route" title="The competition journey" />
        <div className="mt-12">
          <Journey />
        </div>

        <section aria-labelledby="dates-title" className="mt-20">
          <SectionHeader number="02" kicker="Official dates" id="dates-title" title="Key dates" />
          <table className="mt-6 w-full border-y-2 border-ink text-left">
            <caption className="sr-only">Key dates for InnovaHack Chapter 2</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="py-2 kicker text-[0.625rem] font-medium">Milestone</th>
                <th scope="col" className="py-2 text-right kicker text-[0.625rem] font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {keyDates.map((d) => (
                <tr key={d.label} className="border-b border-rule last:border-0">
                  <th scope="row" className="py-3 pr-4 font-display text-lg font-normal">{d.label}</th>
                  <td className="py-3 text-right">
                    {d.fact.value ? (
                      <span className="font-mono">{formatDate(d.fact.value)}</span>
                    ) : (
                      <StatusTag status="unconfirmed" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">Times will be listed in Indian Standard Time (IST) once confirmed.</p>
        </section>
      </Container>
    </>
  );
}
