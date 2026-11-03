import { ExternalLink } from "lucide-react";
import { getSiteContentFresh } from "@/lib/content";
import { maxTotal, scoreTotal } from "@/lib/finals";
import { requireAdmin } from "@/lib/server/admin-auth";
import { loadFinals } from "@/lib/server/finals-store";
import { DeleteScoreButton } from "@/components/admin/finals/DeleteScoreButton";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function SolutionsPage() {
  await requireAdmin();
  let data: Awaited<ReturnType<typeof loadFinals>>;
  try {
    data = await loadFinals();
  } catch (err) {
    return (
      <p role="alert" className="max-w-3xl border-2 border-best bg-best/5 p-4">
        {(err as Error).message}
      </p>
    );
  }
  const { teams, moderators, solutions, scores, settings } = data;
  const content = await getSiteContentFresh();
  const domains = Object.fromEntries(content.domains.list.map((d) => [d.slug, d.name]));
  const moderatorName = new Map(moderators.map((m) => [m.id, m.name]));
  const max = maxTotal(settings.criteria);

  return (
    <div className="max-w-6xl">
      <p className="kicker text-burgundy">Live final</p>
      <h1 className="headline mt-2 text-5xl">Solutions &amp; marks</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        {solutions.length} of {teams.length} finalist teams have submitted a solution. Expand a team to read it and see
        every moderator&apos;s marks and comments. Remove marks given by mistake; the moderator can then mark again.
      </p>

      {teams.length === 0 ? (
        <p className="mt-6 border-2 border-dashed border-ink/40 p-6 text-sm text-muted">No finalist teams yet.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {teams.map((t) => {
            const solution = solutions.find((s) => s.team_id === t.id);
            const sheets = scores.filter((s) => s.team_id === t.id && moderatorName.has(s.moderator_id));
            const totals = sheets.map((s) => scoreTotal(s.marks, settings.criteria));
            const average = totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : null;
            const links = solution
              ? ([
                  ["Repository", solution.repo_url],
                  ["Demo", solution.demo_url],
                  ["Video", solution.video_url],
                  ["Deck", solution.deck_url],
                ] as const).filter(([, url]) => url)
              : [];
            return (
              <li key={t.id}>
                <details className="group border-2 border-ink bg-paper-white">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        {t.name}
                        {t.id === settings.nowReviewing && (
                          <span className="ml-2 border border-violet px-1.5 py-0.5 kicker text-[0.5625rem] text-violet">Live</span>
                        )}
                      </span>
                      <span className="block text-xs text-muted">
                        {domains[t.domain] ?? t.domain} · <span className="capitalize">{t.mode}</span> ·{" "}
                        {solution ? solution.title : "No solution submitted"}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-2xl">
                        {average ?? "—"}
                        <span className="text-sm text-muted"> / {max}</span>
                      </span>
                      <span className="block text-xs text-muted">
                        {sheets.length} of {moderators.length} moderators
                      </span>
                    </span>
                  </summary>
                  <div className="grid gap-6 border-t-2 border-ink p-5 lg:grid-cols-[1.2fr_1fr]">
                    <div>
                      {solution ? (
                        <>
                          <p className="headline text-2xl">{solution.title}</p>
                          <p className="mt-1 text-xs text-muted">
                            Submitted {new Date(solution.submitted_at).toLocaleString("en-IN")} · updated{" "}
                            {new Date(solution.updated_at).toLocaleString("en-IN")}
                          </p>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{solution.summary}</p>
                          {solution.tech_stack && <p className="mt-3 text-sm"><strong>Tech stack:</strong> {solution.tech_stack}</p>}
                          {links.length > 0 && (
                            <ul className="mt-4 flex flex-wrap gap-2">
                              {links.map(([label, url]) => (
                                <li key={label}>
                                  <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 border-2 border-ink px-2.5 py-1 text-sm font-semibold hover:bg-taxi">
                                    {label} <ExternalLink aria-hidden className="size-3.5" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted">This team hasn&apos;t submitted a solution.</p>
                      )}
                      <p className="mt-4 text-xs text-muted">
                        Login <span className="font-mono">{t.login_id}</span>
                        {t.email && ` · ${t.email}`}
                        {t.members && ` · ${t.members}`}
                      </p>
                    </div>
                    <div>
                      <p className="label text-[0.6875rem]">Marks</p>
                      {sheets.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">No marks yet.</p>
                      ) : (
                        <ul className="mt-2 grid gap-2">
                          {sheets.map((s) => (
                            <li key={s.id} className="border border-ink/40 p-3 text-sm">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold">
                                  {moderatorName.get(s.moderator_id)}{" "}
                                  <span className="font-display text-lg">{scoreTotal(s.marks, settings.criteria)}</span>
                                  <span className="text-muted"> / {max}</span>
                                </p>
                                <DeleteScoreButton id={s.id} />
                              </div>
                              <p className="mt-1 text-xs text-muted">
                                {settings.criteria.map((c) => `${c.label}: ${s.marks[c.key] ?? 0}/${c.max}`).join(" · ")}
                              </p>
                              {s.comment && <p className="mt-2 whitespace-pre-line">“{s.comment}”</p>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
