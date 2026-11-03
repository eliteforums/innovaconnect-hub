"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { setTierAction } from "@/app/admin/finals-actions";
import { TIERS, type Leaderboard, type Tier } from "@/lib/finals";

type Capacity = { tier: Tier; total: number | null; offline: number | null; online: number | null };

export function ResultsTable({
  board,
  domains,
  capacity,
}: {
  board: Leaderboard;
  domains: Record<string, string>;
  capacity: Capacity[];
}) {
  const [tiers, setTiers] = useState<Record<string, Tier | null>>(() =>
    Object.fromEntries(board.entries.map((e) => [e.id, e.tier])),
  );
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function assign(id: string, tier: Tier | null) {
    const before = tiers[id];
    setTiers((t) => ({ ...t, [id]: tier }));
    startTransition(async () => {
      const res = await setTierAction(id, tier);
      setMessage({ ok: res.ok, text: res.message });
      if (!res.ok) setTiers((t) => ({ ...t, [id]: before }));
    });
  }

  const count = (tier: Tier, mode?: "offline" | "online") =>
    board.entries.filter((e) => tiers[e.id] === tier && (!mode || e.mode === mode)).length;

  if (board.entries.length === 0) {
    return <p className="mt-4 border-2 border-dashed border-ink/40 p-6 text-sm text-muted">Add finalist teams to see results here.</p>;
  }

  return (
    <>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {capacity.map((c) => {
          const n = count(c.tier);
          const over =
            (c.total !== null && n > c.total) ||
            (c.offline !== null && count(c.tier, "offline") > c.offline) ||
            (c.online !== null && count(c.tier, "online") > c.online);
          return (
            <li key={c.tier} className={`border-2 border-ink p-4 ${over ? "bg-best/10" : "bg-paper-white"}`}>
              <p className="kicker text-[0.6875rem] text-muted">Tier {c.tier}</p>
              <p className="headline mt-1 text-3xl">
                {n}
                {c.total !== null && <span className="text-lg text-muted"> / {c.total}</span>}
              </p>
              <p className="text-sm text-muted">
                Offline {count(c.tier, "offline")}
                {c.offline !== null && ` / ${c.offline}`} · Online {count(c.tier, "online")}
                {c.online !== null && ` / ${c.online}`}
              </p>
              {over && (
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-best">
                  <AlertTriangle aria-hidden className="size-4" /> More winners than places
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mt-3 border-2 p-3 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
        >
          {message.text}
        </p>
      )}
      <div className="mt-4 overflow-x-auto border-2 border-ink bg-paper-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-paper-deep">
            <tr>
              <th scope="col" className="px-3 py-2.5 kicker text-[0.625rem]">Rank</th>
              <th scope="col" className="px-3 py-2.5 kicker text-[0.625rem]">Team</th>
              <th scope="col" className="px-3 py-2.5 kicker text-[0.625rem]">Format</th>
              <th scope="col" className="px-3 py-2.5 text-right kicker text-[0.625rem]">Reviews</th>
              <th scope="col" className="px-3 py-2.5 text-right kicker text-[0.625rem]">Average / {board.maxTotal}</th>
              <th scope="col" className="px-3 py-2.5 kicker text-[0.625rem]">Moderator totals</th>
              <th scope="col" className="px-3 py-2.5 kicker text-[0.625rem]">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {board.entries.map((e) => (
              <tr key={e.id} className={tiers[e.id] ? "bg-taxi/20" : ""}>
                <td className="px-3 py-2.5 font-display text-xl">{e.rank ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <span className="block font-semibold">{e.name}</span>
                  <span className="block text-xs text-muted">
                    {domains[e.domain] ?? e.domain} · {e.title ?? "No solution"}
                  </span>
                </td>
                <td className="px-3 py-2.5 capitalize">{e.mode}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{e.reviews}</td>
                <td className="px-3 py-2.5 text-right font-display text-xl tabular-nums">{e.average ?? "—"}</td>
                <td className="px-3 py-2.5 text-xs text-muted">
                  {e.marks.map((m) => `${m.moderator}: ${m.total}`).join(" · ") || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <select
                    aria-label={`Tier for ${e.name}`}
                    value={tiers[e.id] ?? ""}
                    disabled={pending}
                    onChange={(ev) => assign(e.id, ev.target.value ? (Number(ev.target.value) as Tier) : null)}
                    className="border-2 border-ink bg-paper-white px-2 py-1 font-semibold"
                  >
                    <option value="">—</option>
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        Tier {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
