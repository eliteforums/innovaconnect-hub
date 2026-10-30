import { rules } from "@/content/rules";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/rules",
  "Hackathon Rules & Eligibility",
  "Read confirmed competition principles for InnovaHack Chapter 2, including its Artificial Intelligence and Open Innovation / Startup domains. Full rules are pending.",
);

export default function RulesPage() {
  return (
    <>
      <PageHeader
        section="Official rules"
        crumbs={[{ label: "Rules", href: "/rules" }]}
        title="The rulebook."
        deck={
          rules.published
            ? `Version ${rules.version}, effective ${rules.effectiveFrom}.`
            : "The official Chapter 2 rulebook has not been published yet. It will appear here before registration opens. Below are the principles already confirmed."
        }
      />
      <Container className="mt-14">
        <section aria-labelledby="confirmed-title">
          <SectionHeader number="01" kicker="Confirmed" id="confirmed-title" title="Already confirmed" />
          <ol className="mt-6 space-y-4">
            {rules.confirmed.map((r, i) => (
              <li key={r} className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-rule pb-4">
                <span className="headline text-3xl text-burgundy">{i + 1}.</span>
                <span className="prose-news text-lg">{r}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pending-title" className="mt-20">
          <SectionHeader
            number="02"
            kicker="To be published"
            id="pending-title"
            title="What the rulebook will cover"
            deck="These topics will be set out in the official rules. Nothing below is a rule yet."
          />
          <ul className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
            {rules.pendingTopics.map((t) => (
              <li key={t.title} className="bg-paper-white p-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="headline text-2xl">{t.title}</p>
                  <StatusTag status="unconfirmed" />
                </div>
                <p className="mt-2 text-[0.9375rem] text-charcoal">{t.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/register#updates">Get notified when rules are published</ButtonLink>
          <ButtonLink href="/faq" variant="outline">
            Read the FAQ
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
