"use client";

import Link from "next/link";
import { partnerCategories, partnershipInterests } from "@/lib/options";
import { Checkbox, FormStatus, Honeypot, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { formValues, useFormSubmit } from "./useFormSubmit";

export function PartnerInquiryForm() {
  const { state, submit } = useFormSubmit("/api/partner-inquiry");
  const e = state.errors;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const { get, checked } = formValues(form);
    await submit(
      {
        organization: get("organization"),
        contactName: get("contactName"),
        contactRole: get("contactRole"),
        email: get("email"),
        category: get("category"),
        interest: get("interest"),
        contribution: get("contribution") || undefined,
        challenge: get("challenge") || undefined,
        message: get("message"),
        consent: checked("consent"),
      },
      form,
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Partnership inquiry" className="relative grid gap-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Organization name" name="organization" required autoComplete="organization" maxLength={160} error={e.organization} />
        <SelectField label="Organization category" name="category" required options={partnerCategories} error={e.category} />
        <TextField label="Your name" name="contactName" required autoComplete="name" maxLength={120} error={e.contactName} />
        <TextField label="Your role" name="contactRole" required autoComplete="organization-title" maxLength={120} error={e.contactRole} />
        <TextField
          label="Business email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          error={e.email}
          className="sm:col-span-2"
        />
        <SelectField
          label="Partnership interest"
          name="interest"
          required
          options={partnershipInterests}
          error={e.interest}
          className="sm:col-span-2"
        />
      </div>
      <TextArea
        label="Proposed contribution"
        name="contribution"
        rows={3}
        maxLength={600}
        hint="For example: a cash sponsorship, platform credits, mentors, a venue or a challenge."
        error={e.contribution}
      />
      <TextArea
        label="Challenge proposal"
        name="challenge"
        rows={3}
        maxLength={1500}
        hint="A real problem you'd like teams to work on, within either official domain."
        error={e.challenge}
      />
      <TextArea label="Message" name="message" required minLength={10} maxLength={3000} error={e.message} />
      <Checkbox
        name="consent"
        required
        error={e.consent}
        label={
          <>
            I agree that Elite Forums may contact me about this inquiry, as described in the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-burgundy">
              privacy notice
            </Link>
            .
          </>
        }
      />
      <FormStatus state={state} />
      <div>
        <SubmitButton state={state}>Send partnership inquiry</SubmitButton>
      </div>
    </form>
  );
}
