"use client";

import Link from "next/link";
import { contactTopics } from "@/lib/options";
import { Checkbox, FormStatus, Honeypot, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { formValues, useFormSubmit } from "./useFormSubmit";

export function ContactForm() {
  const { state, submit } = useFormSubmit("/api/contact");
  const e = state.errors;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const { get, checked } = formValues(form);
    await submit(
      {
        name: get("name"),
        email: get("email"),
        topic: get("topic"),
        message: get("message"),
        consent: checked("consent"),
      },
      form,
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Contact the organizers" className="relative grid gap-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" required autoComplete="name" maxLength={120} error={e.name} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" maxLength={254} error={e.email} />
      </div>
      <SelectField label="Topic" name="topic" required options={contactTopics} error={e.topic} />
      <TextArea label="Message" name="message" required minLength={10} maxLength={3000} rows={6} error={e.message} />
      <Checkbox
        name="consent"
        required
        error={e.consent}
        label={
          <>
            I agree that my details may be used to reply to this message, as described in the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-burgundy">
              privacy notice
            </Link>
            .
          </>
        }
      />
      <FormStatus state={state} />
      <div>
        <SubmitButton state={state}>Send message</SubmitButton>
      </div>
    </form>
  );
}
