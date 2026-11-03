"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, Radio, Trophy } from "lucide-react";
import type { copy } from "@/content/copy";
import { TIERS, type Leaderboard, type LeaderboardEntry, type TeamMode } from "@/lib/finals";

type Labels = (typeof copy)["leaderboard"];

const POLL_LIVE_MS = 5_000;
const POLL_OFF_MS = 30_000;

const fmt = (n: number | null) => (n === null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(1));

/**
 * The public leaderboard. Starts from the server-rendered scores and polls
 * /api/leaderboard so marks appear as moderators save them. Rows whose score
 * just changed flash briefly. While the admin has the board switched off it
 * shows `offNotice` and checks back occasionally, switching on by itself.
 */
export function LiveLeaderboard({
  initial,
  labels: x,
  domains,
  offNotice,
}: {
  initial: Leaderboard | null;
  labels: Labels;
  domains: Record<string, string>;
  offNotice: React.ReactNode;
}) {
  const [board, setBoard] = useState(initial);
  const [mode, setMode] = useState<TeamMode | "all">("all");
  const [domain, setDomain] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const previous = useRef(new Map(initial?.entries.map((e) => [e.id, `${e.average}:${e.reviews}`]) ?? []));

  const enabled = board !== null;
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (!document.hidden) {
        try {
          const res = await fetch("/api/leaderboard", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { enabled: boolean; board?: Leaderboard };
            if (!stopped) {
              const next = data.enabled && data.board ? data.board : null;
              const changed = new Set<string>();
              for (const e of next?.entries ?? []) {
                const key = `${e.average}:${e.reviews}`;
                const before = previous.current.get(e.id);
                if (before !== undefined && before !== key) changed.add(e.id);
                previous.current.set(e.id, key);
              }
              setBoard(next);
              if (changed.size) {
                setFlash(changed);
                setTimeout(() => !stopped && setFlash(new Set()), 2500);
              }
            }
          }
        } catch {
          // Keep showing the last scores; the next poll will retry.
        }
      }
      if (!stopped) timer = setTimeout(poll, enabled ? POLL_LIVE_MS : POLL_OFF_MS);
    }
    timer = setTimeout(poll, enabled ? POLL_LIVE_MS : POLL_OFF_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [enabled]);

  if (!board) return <>{offNotice}</>;

  const live = board.nowReviewing ? board.entries.find((e) => e.id === board.nowReviewing) : undefined;
  const winners = board.winnersPublished ? board.entries.filter((e) => e.tier) : [];
  const shown = board.entries.filter((e) => (mode === "all" || e.mode === mode) && (domain === "all" || e.domain === domain));
  const hasMarks = board.entries.some((e) => e.marks.length);

  return (
    <div className="grid gap-12">
      <p className="flex flex-wrap items-center gap-3 text-sm" aria-live="off">
        <span className="inline-flex items-center gap-2 border-2 border-ink bg-best px-3 py-1 kicker text-paper-white">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-paper-white opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-paper-white" />
          </span>
          {x.liveLabel}
        </span>
        <span className="text-muted">
          {x.updatedLabel} {new Date(board.updatedAt).toLocaleTimeString()}
        </span>
      </p>

      {live && (
        <section aria-labelledby="live-title" className="border-2 border-ink bg-ink text-paper-white shadow-[6px_6px_0_0_var(--color-taxi)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-paper/20 px-5 py-3">
            <p className="flex items-center gap-2 kicker text-taxi">
              <Radio aria-hidden className="size-4" /> {x.nowReviewingLabel}
            </p>
            <p className="kicker text-[0.6875rem] text-paper/70">
              {domains[live.domain] ?? live.domain} · {live.mode === "offline" ? x.offlineLabel : x.onlineLabel}
            </p>
          </div>
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 id="live-title" className="headline text-[clamp(2rem,5vw,3.5rem)] uppercase text-paper-white">
                {live.name}
              </h2>
              <p className="mt-2 text-lg text-paper/80">{live.title ?? x.noSubmission}</p>
              <p className="mt-6 font-display text-6xl text-taxi" aria-live="polite">
                {fmt(live.average)}
                <span className="text-2xl text-paper/60"> / {board.maxTotal}</span>
              </p>
              <p className="mt-1 kicker text-[0.6875rem] text-paper/70">
                {x.scoreLabel} · {live.reviews} {x.reviewsLabel.toLowerCase()}
              </p>
            </div>
            {live.marks.length > 0 && (
              <ul className="grid content-start gap-2" aria-label={x.marksLabel}>
                {live.marks.map((m) => (
                  <li key={m.moderator} className="flex items-center justify-between gap-4 border border-paper/25 px-4 py-2.5">
                    <span className="font-semibold">{m.moderator}</span>
                    <span className="font-display text-2xl text-taxi">{fmt(m.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {winners.length > 0 && (
        <section aria-labelledby="winners-title">
          <h2 id="winners-title" className="headline flex items-center gap-3 text-4xl uppercase">
            <Trophy aria-hidden className="size-8 text-burgundy" /> {x.winnersTitle}
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => {
              const teams = winners.filter((w) => w.tier === tier);
              if (!teams.length) return null;
              return (
                <div key={tier} className="border-2 border-ink bg-paper-white">
                  <p className={`border-b-2 border-ink px-5 py-3 kicker ${tier === 1 ? "bg-taxi" : tier === 2 ? "bg-paper-deep" : "bg-rose"}`}>
                    {x.tierLabel} {tier}
                  </p>
                  <ol className="divide-y divide-rule">
                    {teams.map((t) => (
                      <li key={t.id} className="flex items-baseline justify-between gap-3 px-5 py-3">
                        <span>
                          <span className="block font-display text-xl leading-tight">{t.name}</span>
                          <span className="block text-xs text-muted">
                            {domains[t.domain] ?? t.domain} · {t.mode === "offline" ? x.offlineLabel : x.onlineLabel}
                          </span>
                        </span>
                        <span className="font-display text-xl">{fmt(t.average)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="standings-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="standings-title" className="headline text-4xl uppercase">
            {x.standingsTitle}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Filter
              label={x.formatLabel}
              value={mode}
              onChange={(v) => setMode(v as TeamMode | "all")}
              options={[
                ["all", x.allLabel],
                ["offline", x.offlineLabel],
                ["online", x.onlineLabel],
              ]}
            />
            <Filter
              label={x.domainLabel}
              value={domain}
              onChange={setDomain}
              options={[["all", x.allLabel], ...Object.entries(domains)]}
            />
          </div>
        </div>

        {board.entries.length === 0 ? (
          <div className="mt-6 border-2 border-dashed border-ink/50 p-6">
            <p className="headline text-2xl uppercase">{x.emptyTitle}</p>
            <p className="mt-2 text-charcoal">{x.emptyBody}</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto border-2 border-ink bg-paper-white">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="border-b-2 border-ink bg-paper-deep">
                <tr>
                  <th scope="col" className="px-4 py-3 kicker text-[0.6875rem]">{x.rankLabel}</th>
                  <th scope="col" className="min-w-56 px-4 py-3 kicker text-[0.6875rem]">{x.teamLabel}</th>
                  {board.criteria.map((c) => (
                    <th key={c.key} scope="col" className="hidden px-3 py-3 text-right kicker text-[0.625rem] xl:table-cell" title={c.label}>
                      {c.label} <span className="text-muted">/{c.max}</span>
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right kicker text-[0.6875rem]">{x.reviewsLabel}</th>
                  <th scope="col" className="px-4 py-3 text-right kicker text-[0.6875rem]">
                    {x.scoreLabel} <span className="text-muted">/{board.maxTotal}</span>
                  </th>
                  {hasMarks && <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">{x.marksLabel}</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {shown.map((e) => (
                  <Fragment key={e.id}>
                    <tr
                      className={`transition-colors duration-700 ${flash.has(e.id) ? "bg-taxi" : e.id === board.nowReviewing ? "bg-violet-soft" : ""}`}
                    >
                      <td className="px-4 py-3 font-display text-2xl">{e.rank ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{e.name}</span>
                          {e.tier && <TierBadge tier={e.tier} label={x.tierLabel} />}
                          {e.id === board.nowReviewing && (
                            <span className="border border-violet px-1.5 py-0.5 kicker text-[0.5625rem] text-violet">{x.liveLabel}</span>
                          )}
                        </span>
                        <span className="block text-sm text-charcoal">{e.title ?? x.noSubmission}</span>
                        <span className="block text-xs text-muted">
                          {domains[e.domain] ?? e.domain} · {e.mode === "offline" ? x.offlineLabel : x.onlineLabel}
                        </span>
                      </td>
                      {board.criteria.map((c) => (
                        <td key={c.key} className="hidden px-3 py-3 text-right tabular-nums xl:table-cell">
                          {e.reviews ? fmt(e.criteria[c.key] ?? 0) : "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right tabular-nums">{e.reviews}</td>
                      <td className="px-4 py-3 text-right">
                        {e.average === null ? (
                          <span className="text-sm text-muted">{x.notReviewed}</span>
                        ) : (
                          <>
                            <span className="font-display text-2xl tabular-nums">{fmt(e.average)}</span>
                            <span aria-hidden className="mt-1 ml-auto block h-1.5 w-24 bg-paper-deep">
                              <span className="block h-full bg-burgundy" style={{ width: `${Math.min(100, (e.average / board.maxTotal) * 100)}%` }} />
                            </span>
                          </>
                        )}
                      </td>
                      {hasMarks && (
                        <td className="px-2 py-3">
                          {e.marks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setOpen(open === e.id ? null : e.id)}
                              aria-expanded={open === e.id}
                              aria-label={`${x.marksLabel}: ${e.name}`}
                              className="grid size-8 place-items-center border border-ink/40 hover:bg-taxi"
                            >
                              <ChevronDown aria-hidden className={`size-4 transition-transform ${open === e.id ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    {open === e.id && <MarksRow entry={e} board={board} labels={x} />}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 max-w-3xl text-sm text-muted">{x.methodNote}</p>
      </section>
    </div>
  );
}

function MarksRow({ entry, board, labels: x }: { entry: LeaderboardEntry; board: Leaderboard; labels: Labels }) {
  return (
    <tr className="bg-paper">
      <td colSpan={board.criteria.length + 5} className="px-4 py-4">
        <p className="kicker text-[0.6875rem] text-burgundy">{x.marksLabel}</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th scope="col" className="py-1 pr-4 font-medium">{x.moderatorLabel}</th>
                {board.criteria.map((c) => (
                  <th key={c.key} scope="col" className="py-1 pr-4 text-right font-medium">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="py-1 text-right font-medium">{x.totalLabel}</th>
              </tr>
            </thead>
            <tbody>
              {entry.marks.map((m) => (
                <tr key={m.moderator} className="border-t border-rule">
                  <td className="py-1.5 pr-4 font-semibold">{m.moderator}</td>
                  {board.criteria.map((c) => (
                    <td key={c.key} className="py-1.5 pr-4 text-right tabular-nums">
                      {fmt(m.marks[c.key] ?? 0)}
                    </td>
                  ))}
                  <td className="py-1.5 text-right font-semibold tabular-nums">{fmt(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

export function TierBadge({ tier, label = "Tier" }: { tier: number; label?: string }) {
  const tone = tier === 1 ? "bg-taxi" : tier === 2 ? "bg-paper-deep" : "bg-rose";
  return <span className={`border border-ink px-1.5 py-0.5 kicker text-[0.5625rem] ${tone}`}>{label} {tier}</span>;
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="kicker text-[0.6875rem] text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-ink bg-paper-white px-2 py-1.5 text-sm font-semibold"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
