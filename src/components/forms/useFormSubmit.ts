"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
  errors: Record<string, string>;
};

/**
 * Posts JSON to a form endpoint and reports exactly what the server said.
 * Success is only shown when the server confirms the submission was stored.
 */
export function useFormSubmit(endpoint: string) {
  const [state, setState] = useState<FormState>({ status: "idle", errors: {} });
  const renderedAt = useRef(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const submit = useCallback(
    async (payload: Record<string, unknown>, form: HTMLFormElement) => {
      setState({ status: "submitting", errors: {} });
      const honeypot = (form.elements.namedItem("hp_website") as HTMLInputElement | null)?.value ?? "";
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, website: honeypot, elapsedMs: Date.now() - renderedAt.current }),
        });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
          errors?: Record<string, string>;
        } | null;
        if (res.ok && data?.ok) {
          setState({ status: "success", message: data.message, errors: {} });
          form.reset();
          return true;
        }
        setState({
          status: "error",
          message: data?.message ?? `The server could not process this submission (error ${res.status}). Nothing was saved.`,
          errors: data?.errors ?? {},
        });
      } catch {
        setState({
          status: "error",
          message: "We couldn't reach the server, so nothing was saved. Check your connection and try again.",
          errors: {},
        });
      }
      return false;
    },
    [endpoint],
  );

  return { state, submit };
}

/** Reads trimmed string values from a form. */
export function formValues(form: HTMLFormElement) {
  const fd = new FormData(form);
  const get = (name: string) => {
    const v = fd.get(name);
    return typeof v === "string" ? v.trim() : "";
  };
  const checked = (name: string) => fd.get(name) === "on";
  return { get, checked };
}
