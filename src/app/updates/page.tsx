import { articles } from "@/content/updates";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArticleCard } from "@/components/updates/ArticleCard";
import { ButtonLink, Container, PendingNotice } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/updates",
  "The Build Log — Updates & Announcements",
  "News, announcements and stories from InnovaHack Chapter 2.",
);

export default function UpdatesPage() {
  const [lead, ...rest] = articles;
  const hasDrafts = articles.some((a) => a.draft);
  return (
    <>
      <PageHeader
        section="Updates & announcements"
        crumbs={[{ label: "Build Log", href: "/updates" }]}
        title={
          <>
            The Build Log <span className="block text-[0.45em] leading-tight text-burgundy">Stories from the innovation frontline.</span>
          </>
        }
        deck="Official milestones, announcements and stories from InnovaHack. Nothing here is press coverage or a media endorsement."
      />
      <Container className="mt-12">
        {hasDrafts && (
          <p className="mb-8 border-l-4 border-taxi bg-paper-white px-4 py-3 text-sm text-charcoal">
            Entries marked <strong>Draft</strong> are internal drafts awaiting organizer approval. They contain only approved
            event information and have no publication date yet.
          </p>
        )}
        {lead ? (
          <div className="grid gap-10">
            <ArticleCard article={lead} variant="lead" />
            {rest.length > 0 && (
              <ul className="grid gap-8 border-t-2 border-ink pt-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <li key={a.slug}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <PendingNotice title="No updates have been published yet." kicker="The Build Log">
            <p>Join the update list to hear when the first announcement goes live.</p>
            <ButtonLink href="/register#updates" size="sm" className="mt-4">
              Get event updates
            </ButtonLink>
          </PendingNotice>
        )}
      </Container>
    </>
  );
}
