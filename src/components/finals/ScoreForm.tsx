"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveScoreAction } from "@/app/portal/actions";
import { maxTotal, scoreTotal, type Criterion } from "@/lib/finals";

export function ScoreForm({
  teamId,
  criteria,
  initialMarks,
  initialComment,
  savedAt: initialSavedAt,
  nextHref,
}: {
  teamId: string;
  criteria: Criterion[];
  initialMarks: Record<string, number>;
  initialComment: string;
  savedAt: string | null;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, string>>(() =>
    Object.fromEntries(criteria.map((c) => [c.key, initialMarks[c.key] === undefined ? "" : String(initialMarks[c.key])])),
  );
  const [comment, setComment] = useState(initialComment);
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const numbers = Object.fromEntries(criteria.map((c) => [c.key, Number(marks[c.key] || 0)]));
  const complete = criteria.every((c) => marks[c.key] !== "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveScoreAction(teamId, numbers, comment);
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok && res.data) {
        setSavedAt(res.data.updatedAt);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-5" aria-label="Marks">
      {criteria.map((c) => (
        <div key={c.key}>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`mark-${c.key}`} className="font-semibold">
              {c.label}
            </label>
            <span className="text-sm text-muted">out of {c.max}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={c.max}
              step={0.5}
              value={marks[c.key] || 0}
              onChange={(e) => setMarks((m) => ({ ...m, [c.key]: e.target.value }))}
              aria-hidden
              tabIndex={-1}
              className="flex-1 accent-burgundy"
            />
            <input
              id={`mark-${c.key}`}
              type="number"
              inputMode="decimal"
              min={0}
              max={c.max}
              step={0.5}
              required
              value={marks[c.key]}
              onChange={(e) => setMarks((m) => ({ ...m, [c.key]: e.target.value }))}
              className="w-20 rounded-md border-2 border-ink/80 bg-paper-white px-2 py-1.5 text-right font-display text-xl focus:border-burgundy focus:outline-none"
            />
          </div>
        </div>
      ))}

      <div>
        <label htmlFor="comment" className="font-semibold">
          Comment <span className="font-normal text-muted">(optional, seen only by organizers)</span>
        </label>
        <textarea
          id="comment"
          rows={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1.5 block w-full rounded-md border-2 border-ink/80 bg-paper-white px-3 py-2 focus:border-burgundy focus:outline-none"
        />
      </div>

      <p className="flex items-baseline justify-between border-t-2 border-ink pt-4">
        <span className="label text-[0.75rem]">Total</span>
        <span className="font-display text-4xl">
          {scoreTotal(numbers, criteria)}
          <span className="text-lg text-muted"> / {maxTotal(criteria)}</span>
        </span>
      </p>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`border-2 p-3 text-sm font-medium ${message.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !complete}
          className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-burgundy px-6 label text-[0.8125rem] text-paper-white hover:bg-burgundy-deep disabled:opacity-60"
        >
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
          {savedAt ? "Update marks" : "Save marks"}
        </button>
        {savedAt && nextHref && (
          <Link href={nextHref} className="text-sm font-semibold underline underline-offset-4 hover:text-burgundy">
            Next team →
          </Link>
        )}
      </div>
      {savedAt && <p className="text-xs text-muted">Last saved {new Date(savedAt).toLocaleString("en-IN")}</p>}
    </form>
  );
}
