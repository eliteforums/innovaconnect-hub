"use client";

import { useMemo, useState, useTransition } from "react";
import { KeyRound, Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import {
  createTeamsAction,
  deleteTeamAction,
  resetTeamPassAction,
  updateTeamAction,
  type IssuedPass,
} from "@/app/admin/finals-actions";
import type { TeamInfo, TeamMode } from "@/lib/finals";
import { IssuedPasses } from "./IssuedPasses";

export type RegistrationOption = { id: string; name: string; domain: string; email: string; members: string };
type Draft = { name: string; domain: string; mode: TeamMode; email: string; members: string };

const input = "block w-full border-2 border-ink/70 bg-paper-white px-2.5 py-2 text-sm focus:border-burgundy focus:outline-none";
const button = "inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 text-sm font-semibold disabled:opacity-50";

export function TeamsManager({
  teams: initialTeams,
  submitted,
  registrations,
  domains,
}: {
  teams: TeamInfo[];
  submitted: string[];
  registrations: RegistrationOption[];
  domains: { slug: string; name: string }[];
}) {
  const blank: Draft = { name: "", domain: domains[0]?.slug ?? "", mode: "offline", email: "", members: "" };
  const [teams, setTeams] = useState(initialTeams);
  const [passes, setPasses] = useState<IssuedPass[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [editing, setEditing] = useState<{ id: string; draft: Draft } | null>(null);
  const [picked, setPicked] = useState<Record<string, TeamMode>>({});
  const [showImport, setShowImport] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const domainName = (slug: string) => domains.find((d) => d.slug === slug)?.name ?? slug;
  const imported = new Set(teams.map((t) => t.registration_id));
  const candidates = registrations.filter((r) => !imported.has(r.id));
  const done = new Set(submitted);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? teams.filter((t) => `${t.name} ${t.login_id} ${t.email} ${t.members}`.toLowerCase().includes(q)) : teams;
  }, [teams, query]);

  function run<T>(action: () => Promise<{ ok: boolean; message: string; data?: T }>, then?: (data: T) => void) {
    startTransition(async () => {
      const res = await action();
      setMessage({ ok: res.ok, text: res.message });
      // A partly failed import still returns the logins it created.
      if (res.ok || res.data !== undefined) then?.(res.data as T);
    });
  }

  function created(data: { teams: TeamInfo[]; passes: IssuedPass[] }) {
    setTeams((t) => [...t, ...data.teams]);
    setPasses((p) => [...data.passes, ...p]);
  }

  function addOne(e: React.FormEvent) {
    e.preventDefault();
    run(() => createTeamsAction([draft]), (data) => {
      created(data);
      setDraft(blank);
    });
  }

  function importPicked() {
    const list = candidates
      .filter((r) => picked[r.id])
      .map((r) => ({
        name: r.name,
        domain: r.domain,
        mode: picked[r.id],
        email: r.email,
        members: r.members,
        registrationId: r.id,
      }));
    run(() => createTeamsAction(list), (data) => {
      created(data);
      setPicked({});
    });
  }

  return (
    <div className="mt-8 grid gap-8">
      <IssuedPasses passes={passes} onDismiss={() => setPasses([])} />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addOne} className="border-2 border-ink bg-paper-white p-5" aria-labelledby="add-team-title">
          <h2 id="add-team-title" className="flex items-center gap-2 font-semibold">
            <UserPlus aria-hidden className="size-4" /> Add a finalist team
          </h2>
          <DraftFields draft={draft} setDraft={setDraft} domains={domains} idPrefix="new" />
          <button type="submit" disabled={pending} className={`${button} mt-4 bg-ink text-paper-white hover:bg-burgundy`}>
            <Plus aria-hidden className="size-4" /> Create login
          </button>
        </form>

        <div className="border-2 border-ink bg-paper-white p-5">
          <h2 className="font-semibold">Import from registrations</h2>
          <p className="mt-1 text-sm text-muted">
            {candidates.length
              ? `${candidates.length} registered team${candidates.length === 1 ? "" : "s"} not yet added as finalists. Pick the finalists and whether each competes offline or online.`
              : "Every registered team has been added (or there are no registrations yet)."}
          </p>
          {candidates.length > 0 && (
            <button type="button" onClick={() => setShowImport((v) => !v)} aria-expanded={showImport} className={`${button} mt-3 hover:bg-taxi`}>
              {showImport ? "Hide registrations" : "Choose finalists"}
            </button>
          )}
          {showImport && candidates.length > 0 && (
            <>
              <ul className="mt-3 max-h-80 divide-y divide-rule overflow-auto border border-ink/40">
                {candidates.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                    <input
                      type="checkbox"
                      id={`pick-${r.id}`}
                      checked={Boolean(picked[r.id])}
                      onChange={(e) =>
                        setPicked((p) => {
                          const next = { ...p };
                          if (e.target.checked) next[r.id] = "offline";
                          else delete next[r.id];
                          return next;
                        })
                      }
                      className="size-4 accent-burgundy"
                    />
                    <label htmlFor={`pick-${r.id}`} className="min-w-0 flex-1 text-sm">
                      <span className="block truncate font-semibold">{r.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {domainName(r.domain)} · {r.email}
                      </span>
                    </label>
                    {picked[r.id] && (
                      <select
                        aria-label={`Format for ${r.name}`}
                        value={picked[r.id]}
                        onChange={(e) => setPicked((p) => ({ ...p, [r.id]: e.target.value as TeamMode }))}
                        className="border border-ink px-1.5 py-1 text-sm"
                      >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                      </select>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={pending || !Object.keys(picked).length}
                onClick={importPicked}
                className={`${button} mt-3 bg-ink text-paper-white hover:bg-burgundy`}
              >
                Create {Object.keys(picked).length || ""} login{Object.keys(picked).length === 1 ? "" : "s"}
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`border-2 p-3 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
        >
          {message.text}
        </p>
      )}

      <section aria-labelledby="teams-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="teams-title" className="headline text-3xl">
            {teams.length} finalist team{teams.length === 1 ? "" : "s"}
          </h2>
          <label className="relative block w-full max-w-xs">
            <span className="sr-only">Search teams</span>
            <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teams" className={`${input} pl-9`} />
          </label>
        </div>
        {teams.length === 0 ? (
          <p className="mt-4 border-2 border-dashed border-ink/40 p-6 text-sm text-muted">No finalist teams yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-rule border-2 border-ink bg-paper-white">
            {shown.map((t) =>
              editing?.id === t.id ? (
                <li key={t.id} className="bg-paper p-4">
                  <DraftFields
                    draft={editing.draft}
                    setDraft={(d) => setEditing({ id: t.id, draft: typeof d === "function" ? d(editing.draft) : d })}
                    domains={domains}
                    idPrefix={t.id}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(() => updateTeamAction(t.id, editing.draft), (team) => {
                          setTeams((list) => list.map((x) => (x.id === t.id ? team : x)));
                          setEditing(null);
                        })
                      }
                      className={`${button} bg-ink text-paper-white hover:bg-burgundy`}
                    >
                      Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className={`${button} hover:bg-taxi`}>
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {t.name}{" "}
                      <span className="ml-1 font-mono text-xs font-normal text-burgundy">{t.login_id}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {domainName(t.domain)} · <span className="capitalize">{t.mode}</span>
                      {t.email && ` · ${t.email}`} ·{" "}
                      <span className={done.has(t.id) ? "font-semibold text-ink" : ""}>
                        {done.has(t.id) ? "Solution submitted" : "No solution yet"}
                      </span>
                    </p>
                    {t.members && <p className="text-xs text-muted">{t.members}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ id: t.id, draft: { name: t.name, domain: t.domain, mode: t.mode, email: t.email, members: t.members } })}
                      className={`${button} hover:bg-taxi`}
                    >
                      <Pencil aria-hidden className="size-4" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!window.confirm(`Issue a new pass for ${t.name}? Their current pass stops working.`)) return;
                        run(() => resetTeamPassAction(t.id), (pass) => setPasses((p) => [pass, ...p]));
                      }}
                      className={`${button} hover:bg-taxi`}
                    >
                      <KeyRound aria-hidden className="size-4" /> New pass
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={`Delete ${t.name}`}
                      onClick={() => {
                        if (!window.confirm(`Delete ${t.name}, its solution and all its marks? This cannot be undone.`)) return;
                        run(() => deleteTeamAction(t.id), () => setTeams((list) => list.filter((x) => x.id !== t.id)));
                      }}
                      className={`${button} hover:bg-best hover:text-paper-white`}
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function DraftFields({
  draft,
  setDraft,
  domains,
  idPrefix,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  domains: { slug: string; name: string }[];
  idPrefix: string;
}) {
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));
  const id = (k: string) => `${idPrefix}-${k}`;
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={id("name")} className="label text-[0.6875rem]">
          Team name
        </label>
        <input id={id("name")} required minLength={2} maxLength={80} value={draft.name} onChange={set("name")} className={input} />
      </div>
      <div>
        <label htmlFor={id("domain")} className="label text-[0.6875rem]">
          Domain
        </label>
        <select id={id("domain")} value={draft.domain} onChange={set("domain")} className={input}>
          {domains.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id("mode")} className="label text-[0.6875rem]">
          Final round
        </label>
        <select id={id("mode")} value={draft.mode} onChange={set("mode")} className={input}>
          <option value="offline">Offline (on site)</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div>
        <label htmlFor={id("email")} className="label text-[0.6875rem]">
          Contact email
        </label>
        <input id={id("email")} type="email" value={draft.email} onChange={set("email")} className={input} />
      </div>
      <div>
        <label htmlFor={id("members")} className="label text-[0.6875rem]">
          Members
        </label>
        <input id={id("members")} maxLength={500} value={draft.members} onChange={set("members")} placeholder="Names, comma separated" className={input} />
      </div>
    </div>
  );
}
