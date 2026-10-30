"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Search, Trash2 } from "lucide-react";
import { deleteSubmissionAction } from "@/app/admin/actions";

type Row = { id: string; created_at: string; email: string; payload: Record<string, unknown> };

function getPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function display(v: unknown) {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  if (typeof v === "object") return "…";
  return String(v);
}

export function SubmissionsTable({
  collection,
  rows: initialRows,
  columns,
}: {
  collection: string;
  rows: Row[];
  columns: { label: string; path: string }[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  function remove(id: string) {
    if (!window.confirm("Delete this submission permanently? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteSubmissionAction(collection, id);
      setMessage(res.message);
      if (res.ok) setRows((r) => r.filter((x) => x.id !== id));
    });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Search submissions</span>
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, team…"
            className="w-full rounded-md border-2 border-ink/80 bg-paper-white py-2 pl-9 pr-3"
          />
        </label>
        <p className="kicker text-[0.6875rem] text-muted">
          {filtered.length} of {rows.length} submission{rows.length === 1 ? "" : "s"}
        </p>
      </div>
      {message && (
        <p role="status" className="mt-3 border-2 border-ink bg-taxi/40 px-3 py-2 text-sm font-medium">
          {message}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-6 border-2 border-dashed border-ink/40 p-8 text-center text-muted">No submissions yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border-2 border-ink bg-paper-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b-2 border-ink bg-paper">
              <tr>
                <th scope="col" className="w-10 px-3 py-2" />
                <th scope="col" className="px-3 py-2 kicker text-[0.625rem] font-medium">
                  Received
                </th>
                {columns.map((c) => (
                  <th key={c.path} scope="col" className="px-3 py-2 kicker text-[0.625rem] font-medium">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="w-12 px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const expanded = open === r.id;
                return (
                  <FragmentRow key={r.id}>
                    <tr id={r.id} className="border-b border-rule align-top hover:bg-paper/60">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-label={expanded ? "Hide details" : "Show details"}
                          onClick={() => setOpen(expanded ? null : r.id)}
                          className="rounded p-1 hover:bg-paper-deep"
                        >
                          <ChevronDown aria-hidden className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                      {columns.map((c) => (
                        <td key={c.path} className="max-w-[260px] truncate px-3 py-2">
                          {display(getPath(r.payload, c.path))}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => remove(r.id)}
                          aria-label="Delete submission"
                          className="rounded p-1 text-best hover:bg-best/10"
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b-2 border-ink bg-paper/50">
                        <td colSpan={columns.length + 3} className="px-6 py-4">
                          <p className="kicker text-[0.5625rem] text-muted">Reference {r.id}</p>
                          <Details value={r.payload} />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function humanize(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function Details({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted">None</span>;
    return (
      <ol className="mt-1 space-y-2">
        {value.map((v, i) => (
          <li key={i} className="border-l-2 border-taxi pl-3">
            <Details value={v} />
          </li>
        ))}
      </ol>
    );
  }
  if (value && typeof value === "object") {
    return (
      <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-[180px_1fr]">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="label text-[0.625rem] text-muted">{humanize(k)}</dt>
            <dd className="whitespace-pre-wrap break-words">
              {v && typeof v === "object" ? <Details value={v} /> : display(v)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span>{display(value)}</span>;
}
