"use client";

import Link from "next/link";
import { interestCategories } from "@/lib/options";
import { Checkbox, FormStatus, Honeypot, SelectField, SubmitButton, TextField } from "./fields";
import { formValues, useFormSubmit } from "./useFormSubmit";

export function UpdatesForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { state, submit } = useFormSubmit("/api/updates");
  const e = state.errors;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const { get, checked } = formValues(form);
    await submit(
      {
        name: get("name"),
        email: get("email"),
        organization: get("organization") || undefined,
        interest: get("interest") || undefined,
        consent: checked("consent"),
      },
      form,
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate={false}
      aria-label="Get event updates"
      className={`relative grid gap-4 ${tone === "dark" ? "bg-paper-white p-5 text-ink sm:p-6" : ""}`}
    >
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" name="name" required autoComplete="name" minLength={2} maxLength={120} error={e.name} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" maxLength={254} error={e.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="College or organization"
          name="organization"
          autoComplete="organization"
          maxLength={160}
          error={e.organization}
        />
        <SelectField label="I'm interested in" name="interest" options={interestCategories} error={e.interest} />
      </div>
      <Checkbox
        name="consent"
        required
        error={e.consent}
        label={
          <>
            Email me official InnovaHack Chapter 2 updates. I can unsubscribe at any time. See the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-burgundy">
              privacy notice
            </Link>
            .
          </>
        }
      />
      <FormStatus state={state} />
      <div>
        <SubmitButton state={state}>Get event updates</SubmitButton>
      </div>
    </form>
  );
}
