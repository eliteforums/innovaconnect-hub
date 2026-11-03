import Link from "next/link";
import { CheckCircle2, Circle, Radio } from "lucide-react";
import { getSiteContentFresh } from "@/lib/content";
import { scoreTotal, maxTotal } from "@/lib/finals";
import { loadFinals } from "@/lib/server/finals-store";
import { requireModerator } from "@/lib/server/portal-auth";
import { EndLiveButton } from "@/components/finals/LiveReviewButton";
import { PortalShell } from "@/components/finals/PortalShell";

// Portal pages read the session on every request and redirect when signed out.
export const instant = false;

export const metadata = { title: "Review solutions" };

export default async function ModeratorPortalPage() {
  const moderator = await requireModerator();
  const [{ teams, solutions, scores, settings }, content] = await Promise.all([loadFinals(), getSiteContentFresh()]);
  const domains = Object.fromEntries(content.domains.list.map((d) => [d.slug, d.name]));
  const submitted = new Set(solutions.map((s) => s.team_id));
  const mine = new Map(scores.filter((s) => s.moderator_id === moderator.id).map((s) => [s.team_id, s]));
  const live = teams.find((t) => t.id === settings.nowReviewing);
  const max = maxTotal(settings.criteria);

  return (
    <PortalShell role="moderator" name={moderator.name} loginId={moderator.login_id}>
      <p className="kicker text-burgundy">Moderator</p>
      <h1 className="headline mt-2 text-5xl">Review solutions</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        Open a team to read its solution and give marks. Your marks are saved straight to the leaderboard
        {settings.leaderboardEnabled ? ", which is live now" : " (it is switched off until the admin opens it)"}. You have
        reviewed {mine.size} of {teams.length} teams.
      </p>

      {live && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-2 border-ink bg-violet-soft px-5 py-4">
          <p className="flex items-center gap-2 font-semibold">
            <Radio aria-hidden className="size-4 text-violet" /> Live on the leaderboard:{" "}
            <Link href={`/portal/moderator/${live.id}`} className="underline underline-offset-4">
              {live.name}
            </Link>
          </p>
          <EndLiveButton />
        </div>
      )}

      {teams.length === 0 ? (
        <p className="mt-8 border-2 border-dashed border-ink/40 p-6 text-muted">No finalist teams have been added yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-rule border-2 border-ink bg-paper-white">
          {teams.map((t) => {
            const score = mine.get(t.id);
            return (
              <li key={t.id}>
                <Link
                  href={`/portal/moderator/${t.id}`}
                  className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-paper ${t.id === settings.nowReviewing ? "bg-violet-soft" : ""}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {score ? (
                      <CheckCircle2 aria-label="Reviewed" className="size-5 shrink-0 text-burgundy" />
                    ) : (
                      <Circle aria-label="Not reviewed" className="size-5 shrink-0 text-muted" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{t.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {domains[t.domain] ?? t.domain} · {t.mode} ·{" "}
                        {submitted.has(t.id) ? solutions.find((s) => s.team_id === t.id)!.title : "No solution submitted"}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {score ? (
                      <span className="font-display text-2xl">
                        {scoreTotal(score.marks, settings.criteria)}
                        <span className="text-sm text-muted"> / {max}</span>
                      </span>
                    ) : (
                      <span className="kicker text-[0.625rem] text-burgundy">Give marks →</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PortalShell>
  );
}
