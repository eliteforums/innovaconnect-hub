"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateFinalsSettingsAction } from "@/app/admin/finals-actions";
import type { Criterion, FinalsSettings } from "@/lib/finals";

type Toggle =
  | "leaderboardEnabled"
  | "homepageLeaderboardEnabled"
  | "submissionsOpen"
  | "winnersPublished"
  | "showModeratorMarks";

const toggles: { key: Toggle; label: string; on: string; off: string }[] = [
  {
    key: "leaderboardEnabled",
    label: "Public leaderboard page",
    on: "Live at /leaderboard — scores update as moderators save them.",
    off: "Hidden. Visitors see “opens with the live final”. Turn on when the offline round starts.",
  },
  {
    key: "homepageLeaderboardEnabled",
    label: "Show leaderboard on homepage",
    on: "A live top-five preview appears while the public leaderboard page is on.",
    off: "The homepage preview is hidden. The full /leaderboard page is controlled separately.",
  },
  {
    key: "submissionsOpen",
    label: "Solution submissions",
    on: "Finalist teams can submit and edit their solution.",
    off: "Closed. Teams can read their solution but not change it.",
  },
  {
    key: "winnersPublished",
    label: "Publish winners",
    on: "Tier 1, 2 and 3 winners are shown on the leaderboard.",
    off: "Tiers are private to the admin until you publish them.",
  },
  {
    key: "showModeratorMarks",
    label: "Show each moderator's marks",
    on: "Visitors can expand a team to see every moderator's marks.",
    off: "Only averages are public.",
  },
];

export function FinalsControls({ settings: initial, teams }: { settings: FinalsSettings; teams: { id: string; name: string }[] }) {
  const [settings, setSettings] = useState(initial);
  const [criteria, setCriteria] = useState<Criterion[]>(initial.criteria);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save(patch: Partial<FinalsSettings>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await updateFinalsSettingsAction(patch);
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok && res.data) {
        setSettings(res.data);
        if (patch.criteria) setCriteria(res.data.criteria);
      }
    });
  }

  const criteriaChanged = JSON.stringify(criteria) !== JSON.stringify(settings.criteria);

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="controls-title">
        <h2 id="controls-title" className="headline text-3xl">
          Controls
        </h2>
        <ul className="mt-4 divide-y divide-rule border-2 border-ink bg-paper-white">
          {toggles.map((t) => {
            const on = settings[t.key];
            return (
              <li key={t.key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold">{t.label}</p>
                  <p className="text-sm text-muted">{on ? t.on : t.off}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={t.label}
                  disabled={pending}
                  onClick={() =>
                    save(
                      { [t.key]: !on },
                      t.key === "winnersPublished" && !on ? "Publish the winners on the public leaderboard now?" : undefined,
                    )
                  }
                  className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-ink transition-colors disabled:opacity-60 ${on ? "bg-burgundy" : "bg-paper-deep"}`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 size-6 rounded-full border-2 border-ink bg-paper-white transition-all ${on ? "left-6" : "left-0.5"}`}
                  />
                </button>
              </li>
            );
          })}
          <li className="px-5 py-4">
            <label htmlFor="now-reviewing" className="font-semibold">
              Now under review
            </label>
            <p className="text-sm text-muted">Highlighted at the top of the leaderboard. Moderators can set this too.</p>
            <select
              id="now-reviewing"
              value={settings.nowReviewing ?? ""}
              disabled={pending}
              onChange={(e) => save({ nowReviewing: e.target.value || null })}
              className="mt-2 w-full border-2 border-ink bg-paper-white px-3 py-2"
            >
              <option value="">— No team on stage —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </li>
        </ul>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`mt-3 border-2 p-3 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
          >
            {message.text}
          </p>
        )}
      </section>

      <section aria-labelledby="criteria-title">
        <h2 id="criteria-title" className="headline text-3xl">
          Scoring criteria
        </h2>
        <p className="mt-1 text-sm text-muted">
          Totals are recalculated from these. Marks already given for a removed criterion stop counting.
        </p>
        <ul className="mt-4 grid gap-2">
          {criteria.map((c, i) => (
            <li key={i} className="flex items-center gap-2 border-2 border-ink bg-paper-white p-2">
              <input
                aria-label="Criterion"
                value={c.label}
                onChange={(e) =>
                  setCriteria((list) =>
                    list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
                className="min-w-0 flex-1 border border-ink/40 px-2 py-1.5"
              />
              <label className="flex items-center gap-1 text-sm text-muted">
                max
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={c.max}
                  onChange={(e) => setCriteria((list) => list.map((x, j) => (j === i ? { ...x, max: Number(e.target.value) } : x)))}
                  className="w-16 border border-ink/40 px-2 py-1.5 text-right text-ink"
                />
              </label>
              <button
                type="button"
                aria-label={`Remove ${c.label}`}
                onClick={() => setCriteria((list) => list.filter((_, j) => j !== i))}
                className="grid size-8 place-items-center hover:bg-best/10"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCriteria((list) => [...list, { key: `criterion-${Date.now().toString(36)}`, label: "New criterion", max: 10 }])}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-white px-3 py-1.5 text-sm font-semibold hover:bg-taxi"
          >
            <Plus aria-hidden className="size-4" /> Add criterion
          </button>
          <button
            type="button"
            disabled={!criteriaChanged || pending}
            onClick={() => save({ criteria }, "Change the scoring criteria? Every team's total is recalculated.")}
            className="border-2 border-ink bg-ink px-4 py-1.5 text-sm font-semibold text-paper-white hover:bg-burgundy disabled:opacity-50"
          >
            Save criteria
          </button>
          {criteriaChanged && (
            <button type="button" onClick={() => setCriteria(settings.criteria)} className="text-sm underline underline-offset-4">
              Discard changes
            </button>
          )}
        </div>
        <p className="mt-3 text-sm">
          Maximum total: <strong>{criteria.reduce((s, c) => s + (Number(c.max) || 0), 0)}</strong>
        </p>
      </section>
    </div>
  );
}
