import { getSiteContent } from "@/lib/content";
import { resolveImage } from "@/lib/media-library";
import { ContentImage } from "@/components/media/ContentImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container, PendingNotice, Rich } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/prizes", copy.prizes.seo.title, copy.prizes.seo.description);
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
          <>
            <ul className="grid gap-6 lg:grid-cols-3">
              {awards.map((a, i) => {
                const venue = a.venue ?? a.title;
                const image = a.image;
                const hasImage = Boolean(resolveImage(image?.src));
                const teamCount = a.winnerCount ? `${a.winnerCount} teams` : a.eligibility;
                return (
                  <li key={a.title} className="overflow-hidden border-2 border-ink bg-paper-white">
                    <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-ink">
                      {hasImage ? (
                        <ContentImage
                          src={image?.src}
                          alt={image?.alt ?? venue}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                          style={image?.position ? { objectPosition: image.position } : undefined}
                        />
                      ) : (
                        <div className="halftone absolute inset-0 opacity-30 invert" />
                      )}
                      <span className="absolute left-4 top-4 border-2 border-ink bg-taxi px-3 py-1 kicker text-ink">
                        Tier {i + 1}{teamCount ? ` · ${teamCount}` : ""}
                      </span>
                      {!hasImage && (
                        <p className="absolute inset-x-5 bottom-5 font-display text-3xl text-paper-white">{venue}</p>
                      )}
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="kicker text-burgundy">{kindLabels[a.kind] ?? a.kind}</p>
                      <h2 className="headline mt-2 text-3xl">{venue}</h2>
                      <p className="mt-3 font-display text-2xl text-burgundy">{a.value}</p>
                      {a.story && <p className="mt-4 text-sm leading-relaxed text-charcoal"><Rich text={a.story} /></p>}
                      <dl className="mt-4 space-y-3 border-t border-rule pt-3 text-sm">
                        <div>
                          <dt className="label text-[0.6875rem]">{x.eligibilityLabel}</dt>
                          <dd className="font-semibold">{a.eligibility ?? teamCount}</dd>
                        </div>
                        <div>
                          <dt className="label text-[0.6875rem]">{x.conditionsLabel}</dt>
                          <dd className="text-charcoal"><Rich text={a.conditions ?? "Cash award per winning team."} /></dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-sm text-muted">{x.awardNote}</p>
            <div className="mt-12 grid gap-8 border-t-2 border-ink pt-8 md:grid-cols-2">
              <section aria-labelledby="prize-breakdown-title">
                <h2 id="prize-breakdown-title" className="headline text-3xl">{x.breakdownTitle}</h2>
                <p className="mt-3 text-charcoal"><Rich text={x.breakdownBody} /></p>
              </section>
              <section aria-labelledby="prize-next-title">
                <h2 id="prize-next-title" className="headline text-3xl">{x.nextTitle}</h2>
                <p className="mt-3 text-charcoal"><Rich text={x.nextBody} /></p>
              </section>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
