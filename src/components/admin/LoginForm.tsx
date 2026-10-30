"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { loginAction, type ActionResult } from "@/app/admin/actions";

const field =
  "mt-1.5 block w-full rounded-md border-2 border-ink/80 bg-paper-white px-3 py-2.5 text-base focus:border-burgundy focus:outline-none";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(loginAction, { ok: false, message: "" });
  return (
    <form action={action} className="grid gap-4" aria-label="Admin sign in">
      <div>
        <label htmlFor="username" className="label text-[0.75rem]">
          Username
        </label>
        <input id="username" name="username" autoComplete="username" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="label text-[0.75rem]">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
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
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Lock aria-hidden className="size-4" />}
        Sign in
      </button>
    </form>
  );
}
