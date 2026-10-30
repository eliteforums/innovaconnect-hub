import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";
import { fill } from "@/lib/site";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/rules", copy.rules.meta.title, copy.rules.meta.description);
}

export default async function RulesPage() {
  const { rules, copy } = await getSiteContent();
  const x = copy.rules;
  return (
    <>
      <PageHeader
        section={x.section}
        crumbs={[{ label: x.section, href: "/rules" }]}
        title={x.title}
        deck={rules.published ? fill(x.deckPublished, { version: rules.version, effectiveFrom: rules.effectiveFrom }) : x.deckPending}
      />
      <Container className="mt-14">
        <section aria-labelledby="confirmed-title">
          <SectionHeader number="01" kicker={x.confirmedKicker} id="confirmed-title" title={x.confirmedTitle} />
          <ol className="mt-6 space-y-4">
            {rules.confirmed.map((r, i) => (
              <li key={r} className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-rule pb-4">
                <span className="headline text-3xl text-burgundy">{i + 1}.</span>
                <span className="prose-news text-lg">
                  <Rich text={r} />
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pending-title" className="mt-20">
          <SectionHeader
            number="02"
            kicker={x.pendingKicker}
            id="pending-title"
            title={x.pendingTitle}
            deck={x.pendingDeck}
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
          <ButtonLink href="/register#updates">{x.notifyCta}</ButtonLink>
          <ButtonLink href="/faq" variant="outline">
            {x.faqCta}
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
