"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { saveSolutionAction, type SolutionFormState } from "@/app/portal/actions";

type Values = {
  title: string;
  summary: string;
  techStack: string;
  repoUrl: string;
  demoUrl: string;
  videoUrl: string;
  deckUrl: string;
};

const field =
  "mt-1.5 block w-full rounded-md border-2 border-ink/80 bg-paper-white px-3 py-2.5 text-base focus:border-burgundy focus:outline-none disabled:bg-paper disabled:text-charcoal aria-[invalid=true]:border-best";

export function SolutionForm({ initial, open }: { initial: Values; open: boolean }) {
  const [state, action, pending] = useActionState<SolutionFormState, FormData>(saveSolutionAction, { ok: false, message: "" });
  const errors = state.data?.errors ?? {};
  const values = { ...initial, ...state.data?.values } as Values;
  const saved = Boolean(initial.title) || state.ok;

  const input = (name: keyof Values, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <div>
      <label htmlFor={name} className="label text-[0.75rem]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={values[name]}
        disabled={!open}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={field}
        {...props}
      />
      {errors[name] ? (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-best">
          {errors[name]}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="mt-1 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );

  return (
    <form action={action} className="grid gap-5" aria-label="Solution">
      {input("title", "Project title", { required: true, minLength: 3, maxLength: 120 })}
      <div>
        <label htmlFor="summary" className="label text-[0.75rem]">
          What did you build?
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={8}
          required
          minLength={40}
          maxLength={3000}
          defaultValue={values.summary}
          disabled={!open}
          aria-invalid={errors.summary ? true : undefined}
          aria-describedby="summary-hint"
          className={field}
        />
        <p id="summary-hint" className={`mt-1 text-sm ${errors.summary ? "font-medium text-best" : "text-muted"}`}>
          {errors.summary ?? "The problem, your solution, who it helps and what works today. 40 to 3,000 characters."}
        </p>
      </div>
      {input("techStack", "Tech stack", { maxLength: 300, placeholder: "e.g. Next.js, Python, OpenAI API, Supabase" })}
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 label text-[0.75rem]">Links (at least one)</legend>
        {input("repoUrl", "Code repository", { type: "url", placeholder: "https://github.com/…" })}
        {input("demoUrl", "Live demo", { type: "url", placeholder: "https://…" })}
        {input("videoUrl", "Demo video", { type: "url", placeholder: "https://youtu.be/…" })}
        {input("deckUrl", "Pitch deck / slides", { type: "url", placeholder: "https://…" })}
      </fieldset>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`border-2 p-3 text-sm font-medium ${state.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
        >
          {state.message}
        </p>
      )}
      {open && (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 justify-self-start border-2 border-ink bg-burgundy px-6 label text-[0.8125rem] text-paper-white hover:bg-burgundy-deep disabled:opacity-70"
        >
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
          {saved ? "Save changes" : "Submit solution"}
        </button>
      )}
    </form>
  );
}
