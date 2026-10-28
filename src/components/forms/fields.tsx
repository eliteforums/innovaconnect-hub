"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { FormState } from "./useFormSubmit";

const control =
  "mt-1.5 block w-full rounded-md border-2 border-ink/80 bg-paper-white px-3 py-2.5 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-burgundy focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy aria-[invalid=true]:border-best";

type Base = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

function useFieldIds(name: string) {
  const id = useId();
  return { inputId: `${name}-${id}`, hintId: `${name}-${id}-hint`, errorId: `${name}-${id}-error` };
}

function describedBy(ids: ReturnType<typeof useFieldIds>, hint?: string, error?: string) {
  return [hint && ids.hintId, error && ids.errorId].filter(Boolean).join(" ") || undefined;
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="label text-[0.75rem] text-ink">
      {label}
      {required ? (
        <span aria-hidden className="ml-1 text-burgundy">*</span>
      ) : (
        <span className="ml-2 font-normal normal-case tracking-normal text-muted">(optional)</span>
      )}
    </label>
  );
}

function Messages({ ids, hint, error }: { ids: ReturnType<typeof useFieldIds>; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={ids.hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} className="mt-1 flex items-center gap-1 text-sm font-medium text-best">
          <AlertTriangle aria-hidden className="size-3.5" />
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  ...props
}: Base & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const ids = useFieldIds(name);
  return (
    <div className={className}>
      <Label htmlFor={ids.inputId} label={label} required={required} />
      <input
        id={ids.inputId}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={control}
        {...props}
      />
      <Messages ids={ids} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  ...props
}: Base & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const ids = useFieldIds(name);
  return (
    <div className={className}>
      <Label htmlFor={ids.inputId} label={label} required={required} />
      <textarea
        id={ids.inputId}
        name={name}
        required={required}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={control}
        {...props}
      />
      <Messages ids={ids} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  options,
  placeholder = "Choose…",
  ...props
}: Base & { options: readonly string[] | readonly { value: string; label: string }[]; placeholder?: string } & Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "name"
  >) {
  const ids = useFieldIds(name);
  return (
    <div className={className}>
      <Label htmlFor={ids.inputId} label={label} required={required} />
      <select
        id={ids.inputId}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={`${control} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='8'%3E%3Cpath%20d='M1%201l5%205%205-5'%20stroke='%23171717'%20stroke-width='2'%20fill='none'/%3E%3C/svg%3E")] bg-[length:12px_8px] bg-[right_0.9rem_center] bg-no-repeat pr-10`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <Messages ids={ids} hint={hint} error={error} />
    </div>
  );
}

export function Checkbox({
  label,
  name,
  error,
  required,
  className = "",
}: {
  label: React.ReactNode;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  const ids = useFieldIds(name);
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={ids.inputId}
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.errorId : undefined}
          className="mt-0.5 size-5 shrink-0 rounded border-2 border-ink accent-burgundy"
        />
        <label htmlFor={ids.inputId} className="text-sm text-charcoal">
          {label}
          {required && <span aria-hidden className="ml-1 text-burgundy">*</span>}
        </label>
      </div>
      <Messages ids={ids} error={error} />
    </div>
  );
}

/** Off-screen honeypot. Real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="hp_website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function SubmitButton({ state, children }: { state: FormState; children: React.ReactNode }) {
  const busy = state.status === "submitting";
  return (
    <button
      type="submit"
      disabled={busy}
      aria-disabled={busy}
      className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-burgundy bg-burgundy px-6 label text-[0.8125rem] text-paper-white transition-colors hover:border-burgundy-deep hover:bg-burgundy-deep disabled:cursor-wait disabled:opacity-70"
    >
      {busy && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {busy ? "Sending…" : children}
    </button>
  );
}

/** Announces form results to assistive tech and moves focus to them. */
export function FormStatus({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "success" || state.status === "error") ref.current?.focus();
  }, [state.status]);

  if (state.status !== "success" && state.status !== "error") {
    return <div aria-live="polite" className="sr-only" />;
  }
  const success = state.status === "success";
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 border-2 p-4 focus:outline-none ${success ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
    >
      {success ? (
        <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-best" />
      )}
      <p className="text-[0.9375rem] font-medium">{state.message}</p>
    </div>
  );
}
