"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { statesAndUts } from "@/lib/options";
import { Checkbox, FormStatus, Honeypot, SelectField, SubmitButton, TextArea, TextField } from "./fields";
import { formValues, useFormSubmit } from "./useFormSubmit";

type DomainOption = { slug: string; number: string; name: string; summary: string };

export function RegistrationForm({
  domains,
  maxTeamSize,
  teamSizeNote,
}: {
  domains: DomainOption[];
  /** Total team size including the lead. */
  maxTeamSize: number;
  teamSizeNote: string;
}) {
  const { state, submit } = useFormSubmit("/api/register");
  const e = state.errors;
  const nextId = useRef(1);
  const [members, setMembers] = useState<number[]>([]);
  const canAdd = members.length + 1 < maxTeamSize;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const { get, checked } = formValues(form);
    const ok = await submit(
      {
        lead: {
          fullName: get("lead.fullName"),
          email: get("lead.email"),
          phone: get("lead.phone"),
          organization: get("lead.organization"),
          city: get("lead.city"),
          state: get("lead.state"),
        },
        team: {
          name: get("team.name"),
          members: members.map((id) => ({
            fullName: get(`member.${id}.fullName`),
            email: get(`member.${id}.email`),
          })),
        },
        domain: get("domain"),
        project: {
          title: get("project.title"),
          summary: get("project.summary"),
          repoUrl: get("project.repoUrl") || undefined,
          demoUrl: get("project.demoUrl") || undefined,
        },
        consents: {
          rules: checked("consents.rules"),
          privacy: checked("consents.privacy"),
          updates: checked("consents.updates"),
        },
      },
      form,
    );
    if (ok) setMembers([]);
  }

  return (
    <form onSubmit={onSubmit} aria-label="Team registration" className="relative grid gap-10">
      <Honeypot />

      <Fieldset number="01" legend="Team lead">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" name="lead.fullName" required autoComplete="name" maxLength={120} error={e["lead.fullName"]} />
          <TextField label="Email" name="lead.email" type="email" required autoComplete="email" maxLength={254} error={e["lead.email"]} />
          <TextField
            label="Phone"
            name="lead.phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            pattern="\+?[0-9\s\-]{8,16}"
            hint="Used only for event logistics."
            error={e["lead.phone"]}
          />
          <TextField
            label="College or organization"
            name="lead.organization"
            required
            autoComplete="organization"
            maxLength={160}
            error={e["lead.organization"]}
          />
          <TextField label="City" name="lead.city" required autoComplete="address-level2" maxLength={80} error={e["lead.city"]} />
          <SelectField
            label="State or union territory"
            name="lead.state"
            required
            options={statesAndUts}
            error={e["lead.state"]}
          />
        </div>
      </Fieldset>

      <Fieldset number="02" legend="Team">
        <TextField label="Team name" name="team.name" required maxLength={80} error={e["team.name"]} />
        <div className="mt-6">
          <p className="label text-[0.75rem]">Team members</p>
          <p className="mt-1 text-sm text-muted">{teamSizeNote}</p>
          <ul className="mt-4 grid gap-4">
            {members.map((id, i) => (
              <li key={id} className="grid gap-4 border border-ink/30 bg-paper-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <TextField label={`Member ${i + 2} · full name`} name={`member.${id}.fullName`} required maxLength={120} error={e[`team.members.${i}.fullName`]} />
                <TextField label={`Member ${i + 2} · email`} name={`member.${id}.email`} type="email" required maxLength={254} error={e[`team.members.${i}.email`]} />
                <button
                  type="button"
                  onClick={() => setMembers((m) => m.filter((x) => x !== id))}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-ink px-3 label text-[0.6875rem] hover:bg-ink hover:text-paper-white"
                >
                  <Trash2 aria-hidden className="size-4" />
                  Remove<span className="sr-only"> member {i + 2}</span>
                </button>
              </li>
            ))}
          </ul>
          {e["team.members"] && <p className="mt-2 text-sm font-medium text-best">{e["team.members"]}</p>}
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => setMembers((m) => [...m, nextId.current++])}
            className="mt-4 inline-flex min-h-11 items-center gap-2 border-2 border-dashed border-ink px-4 label text-[0.6875rem] hover:bg-paper-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus aria-hidden className="size-4" />
            Add a team member
          </button>
        </div>
      </Fieldset>

      <Fieldset number="03" legend="Official domain">
        <div role="radiogroup" aria-describedby="domain-error" className="grid gap-4 md:grid-cols-2">
          {domains.map((d) => (
            <label
              key={d.slug}
              className="relative flex cursor-pointer gap-3 border-2 border-ink bg-paper-white p-5 has-[:checked]:border-burgundy has-[:checked]:bg-rose/60 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-burgundy"
            >
              <input type="radio" name="domain" value={d.slug} required className="mt-1 size-5 accent-burgundy" />
              <span>
                <span className="kicker text-burgundy">Domain {d.number}</span>
                <span className="headline mt-1 block text-2xl">{d.name}</span>
                <span className="mt-1 block text-sm text-charcoal">{d.summary}</span>
              </span>
            </label>
          ))}
        </div>
        {e.domain && (
          <p id="domain-error" className="mt-2 text-sm font-medium text-best">
            {e.domain}
          </p>
        )}
      </Fieldset>

      <Fieldset number="04" legend="Project">
        <div className="grid gap-5">
          <TextField label="Working title" name="project.title" required maxLength={120} error={e["project.title"]} />
          <TextArea
            label="Project summary"
            name="project.summary"
            required
            minLength={40}
            maxLength={1500}
            rows={5}
            hint="The problem, who it affects and how you plan to solve it."
            error={e["project.summary"]}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Repository link" name="project.repoUrl" type="url" placeholder="https://" maxLength={500} error={e["project.repoUrl"]} />
            <TextField label="Demo link" name="project.demoUrl" type="url" placeholder="https://" maxLength={500} error={e["project.demoUrl"]} />
          </div>
        </div>
      </Fieldset>

      <Fieldset number="05" legend="Declarations">
        <div className="grid gap-4">
          <Checkbox
            name="consents.rules"
            required
            error={e["consents.rules"]}
            label={
              <>
                I have read and accept the{" "}
                <Link href="/rules" className="underline underline-offset-2">
                  official rules
                </Link>{" "}
                on behalf of my team.
              </>
            }
          />
          <Checkbox
            name="consents.privacy"
            required
            error={e["consents.privacy"]}
            label={
              <>
                I have read the{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  privacy notice
                </Link>{" "}
                and have my team members&rsquo; permission to share their names and emails.
              </>
            }
          />
          <Checkbox name="consents.updates" label="Send me event updates by email." />
        </div>
      </Fieldset>

      <FormStatus state={state} />
      <div>
        <SubmitButton state={state}>Submit registration</SubmitButton>
      </div>
    </form>
  );
}

function Fieldset({ number, legend, children }: { number: string; legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t-2 border-ink pt-5">
      <legend className="float-left mb-5 flex w-full items-baseline gap-3">
        <span className="kicker text-burgundy">{number}</span>
        <span className="headline text-3xl uppercase">{legend}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}
