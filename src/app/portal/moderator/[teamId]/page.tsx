import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { getSiteContentFresh } from "@/lib/content";
import { findSolution, listScoresForTeam, listTeams, readFinalsSettings } from "@/lib/server/finals-store";
import { requireModerator } from "@/lib/server/portal-auth";
import { LiveReviewButton } from "@/components/finals/LiveReviewButton";
import { PortalShell } from "@/components/finals/PortalShell";
import { ScoreForm } from "@/components/finals/ScoreForm";

// Portal pages read the session on every request and redirect when signed out.
export const instant = false;

export const metadata = { title: "Give marks" };

export default async function ModeratorTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const moderator = await requireModerator();
  const { teamId } = await params;
  const [teams, solution, scores, settings, content] = await Promise.all([
    listTeams(),
    findSolution(teamId),
    listScoresForTeam(teamId),
    readFinalsSettings(),
    getSiteContentFresh(),
  ]);
  const index = teams.findIndex((t) => t.id === teamId);
  if (index < 0) notFound();
  const team = teams[index];
  const prev = teams[index - 1];
  const next = teams[index + 1];
  const mine = scores.find((s) => s.moderator_id === moderator.id);
  const domain = content.domains.list.find((d) => d.slug === team.domain)?.name ?? team.domain;
  const links = solution
    ? [
        ["Code repository", solution.repo_url],
        ["Live demo", solution.demo_url],
        ["Demo video", solution.video_url],
        ["Pitch deck", solution.deck_url],
      ].filter(([, url]) => url)
    : [];

  return (
    <PortalShell role="moderator" name={moderator.name} loginId={moderator.login_id}>
      <nav aria-label="Teams" className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/portal/moderator" className="underline underline-offset-4 hover:text-burgundy">
          All teams
        </Link>
        <span className="flex gap-2">
          {prev && (
            <Link href={`/portal/moderator/${prev.id}`} className="inline-flex items-center gap-1 border-2 border-ink px-3 py-1.5 hover:bg-taxi">
              <ArrowLeft aria-hidden className="size-4" /> {prev.name}
            </Link>
          )}
          {next && (
            <Link href={`/portal/moderator/${next.id}`} className="inline-flex items-center gap-1 border-2 border-ink px-3 py-1.5 hover:bg-taxi">
              {next.name} <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </span>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker text-burgundy">
            {domain} · {team.mode === "offline" ? "Offline" : "Online"} · team {index + 1} of {teams.length}
          </p>
          <h1 className="headline mt-2 text-5xl">{team.name}</h1>
          {team.members && <p className="mt-2 text-charcoal">{team.members}</p>}
        </div>
        <LiveReviewButton teamId={team.id} live={settings.nowReviewing === team.id} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="solution-title" className="border-2 border-ink bg-paper-white p-5 sm:p-8">
          <h2 id="solution-title" className="label text-[0.75rem]">
            Solution
          </h2>
          {solution ? (
            <>
              <p className="headline mt-3 text-3xl">{solution.title}</p>
              <p className="mt-1 text-xs text-muted">Last updated {new Date(solution.updated_at).toLocaleString("en-IN")}</p>
              <p className="mt-5 whitespace-pre-line leading-relaxed">{solution.summary}</p>
              {solution.tech_stack && (
                <p className="mt-5 text-sm">
                  <span className="label text-[0.6875rem] text-muted">Tech stack</span> {solution.tech_stack}
                </p>
              )}
              {links.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-3">
                  {links.map(([label, url]) => (
                    <li key={label}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-2 border-2 border-ink px-3 py-2 text-sm font-semibold hover:bg-taxi"
                      >
                        {label} <ExternalLink aria-hidden className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-3 text-muted">This team hasn&apos;t submitted a solution yet. You can still give marks for the live presentation.</p>
          )}
        </section>

        <section aria-labelledby="marks-title" className="border-2 border-ink bg-paper-white p-5 sm:p-8">
          <h2 id="marks-title" className="label text-[0.75rem]">
            Your marks
          </h2>
          <p className="mt-1 text-sm text-muted">
            {scores.length} moderator{scores.length === 1 ? " has" : "s have"} marked this team. Other moderators&apos; marks
            are hidden here so every review is independent.
          </p>
          <ScoreForm
            key={team.id}
            teamId={team.id}
            criteria={settings.criteria}
            initialMarks={mine?.marks ?? {}}
            initialComment={mine?.comment ?? ""}
            savedAt={mine?.updated_at ?? null}
            nextHref={next ? `/portal/moderator/${next.id}` : null}
          />
        </section>
      </div>
    </PortalShell>
  );
}
