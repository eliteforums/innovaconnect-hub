"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { portalLoginAction } from "@/app/portal/actions";

const field =
  "mt-1.5 block w-full rounded-md border-2 border-ink/80 bg-paper-white px-3 py-2.5 font-mono text-base uppercase tracking-wider focus:border-burgundy focus:outline-none";

export function PortalLoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(portalLoginAction, { ok: false, message: "" });
  return (
    <form action={action} className="grid gap-4" aria-label="Finalist sign in">
      <div>
        <label htmlFor="loginId" className="label text-[0.75rem]">
          Login ID
        </label>
        <input
          id="loginId"
          name="loginId"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="TEAM-XXXXXX"
          required
          className={field}
        />
      </div>
      <div>
        <label htmlFor="pass" className="label text-[0.75rem]">
          Pass
        </label>
        <input
          id="pass"
          name="pass"
          type="password"
          autoComplete="current-password"
          placeholder="XXXX-XXXX-XXXX"
          required
          className={field}
        />
      </div>
      {state.message && (
        <p role="alert" className="border-2 border-best bg-best/5 p-3 text-sm font-medium">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-ink label text-[0.8125rem] text-paper-white hover:bg-burgundy disabled:opacity-70"
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <KeyRound aria-hidden className="size-4" />}
        Sign in
      </button>
    </form>
  );
}
