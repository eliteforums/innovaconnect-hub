import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, PendingNotice, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/prizes", copy.prizes.meta.title, copy.prizes.meta.description);
}

export default async function PrizesPage() {
  const c = await getSiteContent();
  const x = c.copy.prizes;
  const awards = c.event.awards;
  const kindLabels = x.kindLabels as Record<string, string>;
  return (
    <>
      <PageHeader section={x.section} crumbs={[{ label: x.section, href: "/prizes" }]} title={x.title} deck={x.deck} />
      <Container className="mt-14">
        {awards.length === 0 ? (
          <PendingNotice title={x.pendingTitle} className="max-w-3xl">
            <p>
              <Rich text={x.pendingBody} />
            </p>
            <ButtonLink href="/register#updates" className="mt-4" size="sm">
              {c.copy.global.cta.updates}
            </ButtonLink>
          </PendingNotice>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {awards.map((a, i) => (
              <li key={`${a.title}-${i}`} className="border-2 border-ink bg-paper-white p-6">
                <p className="kicker text-burgundy">{kindLabels[a.kind] ?? a.kind}</p>
                <p className="headline mt-2 text-3xl">{a.title}</p>
                <p className="mt-2 font-display text-2xl text-burgundy">{a.value}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="label text-[0.6875rem]">{x.eligibilityLabel}</dt>
                    <dd className="text-charcoal">
                      <Rich text={a.eligibility} />
                    </dd>
                  </div>
                  <div>
                    <dt className="label text-[0.6875rem]">{x.conditionsLabel}</dt>
                    <dd className="text-charcoal">
                      <Rich text={a.conditions} />
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="types-title" className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader number="01" kicker={x.typesKicker} id="types-title" title={x.typesTitle} />
            <ul className="mt-6 divide-y divide-rule border-y border-ink">
              {c.copy.home.prizes.kinds.map((k, i) => (
                <li key={`${k}-${i}`} className="flex items-center justify-between py-3">
                  <span className="font-display text-xl">{k}</span>
                  <StatusTag status="unconfirmed" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader number="02" kicker={x.commitmentsKicker} title={x.commitmentsTitle} />
            <ul className="mt-6 space-y-4">
              {x.principles.map((p, i) => (
                <li key={`${p}-${i}`} className="flex gap-3 text-lg">
                  <span aria-hidden className="mt-2 size-2.5 shrink-0 rotate-45 bg-taxi ring-1 ring-ink" />
                  <span>
                    <Rich text={p} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>
    </>
  );
}
