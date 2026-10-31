import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArticleCard } from "@/components/updates/ArticleCard";
import { ButtonLink, Container, PendingNotice, Rich } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { copy, articles } = await getSiteContent();
  const hasPublished = articles.some((a) => !a.draft && a.publishedOn !== null);
  return {
    ...pageMeta("/updates", copy.updates.seo.title, copy.updates.seo.description),
    ...(!hasPublished ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function UpdatesPage() {
  const c = await getSiteContent();
  const x = c.copy.updates;
  const [lead, ...rest] = c.articles;
  const hasDrafts = c.articles.some((a) => a.draft);
  return (
    <>
      <PageHeader
        section={x.section}
        crumbs={[{ label: x.crumb, href: "/updates" }]}
        title={
          <>
            <Rich text={x.title} />{" "}
            <span className="block text-[0.45em] leading-tight text-burgundy">
              <Rich text={x.subtitle} />
            </span>
          </>
        }
        deck={x.deck}
      />
      <Container className="mt-12">
        {hasDrafts && (
          <p className="mb-8 border-l-4 border-taxi bg-paper-white px-4 py-3 text-sm text-charcoal">
            <Rich text={x.draftNote} accent="font-semibold text-ink" />
          </p>
        )}
        {lead ? (
          <div className="grid gap-10">
            <ArticleCard article={lead} variant="lead" heading="h2" />
            {rest.length > 0 && (
              <ul className="grid gap-8 border-t-2 border-ink pt-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <li key={a.slug}>
                    <ArticleCard article={a} heading="h2" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <PendingNotice title={x.emptyTitle} kicker={x.emptyKicker}>
            <p>
              <Rich text={x.emptyBody} />
            </p>
            <ButtonLink href="/register#updates" size="sm" className="mt-4">
              {c.copy.global.cta.updates}
            </ButtonLink>
          </PendingNotice>
        )}
      </Container>
    </>
  );
}
