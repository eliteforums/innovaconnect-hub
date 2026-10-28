import { event } from "@/content/event";
import { awardKinds } from "@/components/home/Sections";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, PendingNotice, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/prizes",
  "Prizes & Opportunities",
  "Chapter 2 prize details are to be announced. Every award will be listed with its type, eligibility and conditions.",
);

const kindLabels: Record<(typeof event.awards)[number]["kind"], string> = {
  cash: "Cash prize",
  "sponsor-benefit": "Sponsor-provided benefit",
  credits: "Software or cloud credits",
  hardware: "Hardware & products",
  mentorship: "Mentorship",
  "incubation-consideration": "Incubation consideration",
  "investor-introduction": "Investor introduction",
};

const principles = [
  "Cash prizes are listed separately from every other benefit.",
  "Sponsor benefits, credits and hardware are never counted as cash.",
  "Investor introductions are introductions — not confirmed investments.",
  "Incubation is listed as consideration, not a guaranteed place.",
  "Every award states its eligibility and conditions.",
];

export default function PrizesPage() {
  const awards = event.awards;
  return (
    <>
      <PageHeader
        section="Prizes & opportunities"
        crumbs={[{ label: "Prizes", href: "/prizes" }]}
        title="Build something worth recognizing."
        deck="The Chapter 2 prize pool has not been confirmed. Chapter 1's advertised reward pool does not apply to this edition."
      />
      <Container className="mt-14">
        {awards.length === 0 ? (
          <PendingNotice title="Chapter 2 prize details to be announced." className="max-w-3xl">
            <p>
              Awards will be published here once they are officially confirmed. Join the update list to hear when they
              are.
            </p>
            <ButtonLink href="/register#updates" className="mt-4" size="sm">
              Get event updates
            </ButtonLink>
          </PendingNotice>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {awards.map((a) => (
              <li key={a.title} className="border-2 border-ink bg-paper-white p-6">
                <p className="kicker text-burgundy">{kindLabels[a.kind]}</p>
                <p className="headline mt-2 text-3xl">{a.title}</p>
                <p className="mt-2 font-display text-2xl text-burgundy">{a.value}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="label text-[0.6875rem]">Eligibility</dt>
                    <dd className="text-charcoal">{a.eligibility}</dd>
                  </div>
                  <div>
                    <dt className="label text-[0.6875rem]">Conditions</dt>
                    <dd className="text-charcoal">{a.conditions}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="types-title" className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader number="01" kicker="Award types" id="types-title" title="How awards are listed" />
            <ul className="mt-6 divide-y divide-rule border-y border-ink">
              {awardKinds.map((k) => (
                <li key={k} className="flex items-center justify-between py-3">
                  <span className="font-display text-xl">{k}</span>
                  <StatusTag status="unconfirmed" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader number="02" kicker="Our commitments" title="Plain-language prizes" />
            <ul className="mt-6 space-y-4">
              {principles.map((p) => (
                <li key={p} className="flex gap-3 text-lg">
                  <span aria-hidden className="mt-2 size-2.5 shrink-0 rotate-45 bg-taxi ring-1 ring-ink" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>
    </>
  );
}
