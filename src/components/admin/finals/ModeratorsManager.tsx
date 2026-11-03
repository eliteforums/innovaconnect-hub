"use client";

import { useState, useTransition } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import {
  createModeratorAction,
  deleteModeratorAction,
  resetModeratorPassAction,
  type IssuedPass,
} from "@/app/admin/finals-actions";
import type { ModeratorInfo } from "@/lib/finals";
import { IssuedPasses } from "./IssuedPasses";

const input = "block w-full border-2 border-ink/70 bg-paper-white px-2.5 py-2 text-sm focus:border-burgundy focus:outline-none";
const button = "inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 text-sm font-semibold disabled:opacity-50";

export function ModeratorsManager({
  moderators: initial,
  reviewed,
  teamCount,
}: {
  moderators: ModeratorInfo[];
  reviewed: Record<string, number>;
  teamCount: number;
}) {
  const [moderators, setModerators] = useState(initial);
  const [passes, setPasses] = useState<IssuedPass[]>([]);
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function run<T>(action: () => Promise<{ ok: boolean; message: string; data?: T }>, then?: (data: T) => void) {
    startTransition(async () => {
      const res = await action();
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok) then?.(res.data as T);
    });
  }

  return (
    <div className="mt-8 grid gap-6">
      <IssuedPasses passes={passes} onDismiss={() => setPasses([])} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createModeratorAction({ name, affiliation }), (data) => {
            setModerators((m) => [...m, data.moderator]);
            setPasses((p) => [data.pass, ...p]);
            setName("");
            setAffiliation("");
          });
        }}
        className="grid gap-3 border-2 border-ink bg-paper-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="mod-name" className="label text-[0.6875rem]">
            Name (shown publicly)
          </label>
          <input id="mod-name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="mod-affiliation" className="label text-[0.6875rem]">
            Organization or role
          </label>
          <input id="mod-affiliation" maxLength={160} value={affiliation} onChange={(e) => setAffiliation(e.target.value)} className={input} />
        </div>
        <button type="submit" disabled={pending} className={`${button} justify-center bg-ink py-2 text-paper-white hover:bg-burgundy`}>
          <Plus aria-hidden className="size-4" /> Add moderator
        </button>
      </form>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`border-2 p-3 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
        >
          {message.text}
        </p>
      )}

      {moderators.length === 0 ? (
        <p className="border-2 border-dashed border-ink/40 p-6 text-sm text-muted">No moderators yet.</p>
      ) : (
        <ul className="divide-y divide-rule border-2 border-ink bg-paper-white">
          {moderators.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-semibold">
                  {m.name} <span className="ml-1 font-mono text-xs font-normal text-burgundy">{m.login_id}</span>
                </p>
                <p className="text-xs text-muted">
                  {m.affiliation && `${m.affiliation} · `}Reviewed {reviewed[m.id] ?? 0} of {teamCount} teams
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm(`Issue a new pass for ${m.name}? Their current pass stops working.`)) return;
                    run(() => resetModeratorPassAction(m.id), (pass) => setPasses((p) => [pass, ...p]));
                  }}
                  className={`${button} hover:bg-taxi`}
                >
                  <KeyRound aria-hidden className="size-4" /> New pass
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Remove ${m.name}`}
                  onClick={() => {
                    if (!window.confirm(`Remove ${m.name} and every mark they gave? This cannot be undone.`)) return;
                    run(() => deleteModeratorAction(m.id), () => setModerators((list) => list.filter((x) => x.id !== m.id)));
                  }}
                  className={`${button} hover:bg-best hover:text-paper-white`}
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
