import Link from "next/link";
import { event } from "@/content/event";
import { domains } from "@/content/domains";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { UpdatesForm } from "@/components/forms/UpdatesForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, SectionHeader, StatusTag } from "@/components/ui";
import { formatDate, isRegistrationOpen, registrationCopy } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/register",
  "Registration & Event Updates",
  "Check InnovaHack Chapter 2 registration status and join the update list for official signup dates, rules and announcements for the planned 2027 hackathon.",
);

const steps = ["Registration status", "Team-size rules", "Participation fee", "Registration dates"];

export default function RegisterPage() {
  const status = event.registration.status;
  const copy = registrationCopy[status];
  const open = isRegistrationOpen();
  const maxTeamSize = event.teamSize.max ?? event.formTeamMemberLimit;
  const teamSizeNote = event.teamSize.max
    ? `Teams can have up to ${event.teamSize.max} members, including the lead.${event.teamSize.min ? ` Minimum ${event.teamSize.min}.` : ""}`
    : `${event.teamSize.note} The form accepts up to ${maxTeamSize} members in total.`;

  return (
    <>
      <PageHeader
        section="Registration"
        crumbs={[{ label: "Register", href: "/register" }]}
        title={copy.headline}
        deck={copy.body}
        aside={
          <div className="border-2 border-ink bg-paper-white">
            <p className="border-b-2 border-ink bg-taxi px-5 py-3 kicker">Status board</p>
            <dl className="divide-y divide-rule px-5">
              <Row label={steps[0]} value={copy.badge} status="confirmed" />
              <Row
                label={steps[1]}
                value={event.teamSize.max ? `Up to ${event.teamSize.max}` : null}
                status={event.teamSize.status}
              />
              <Row label={steps[2]} value={event.registration.fee.value} status={event.registration.fee.status} />
              <Row label={steps[3]} value={formatDate(event.registration.opensOn.value)} status={event.registration.opensOn.status} />
            </dl>
          </div>
        }
      />

      <Container className="mt-14">
        {open ? (
          <section aria-labelledby="register-title">
            <SectionHeader
              number="01"
              kicker="Team registration"
              id="register-title"
              title="Register your team"
              deck={
                <>
                  Read the <Link href="/rules" className="underline underline-offset-4">official rules</Link> before you
                  start. Fields marked * are required.
                </>
              }
            />
            <div className="mt-10 max-w-4xl">
              <RegistrationForm
                domains={domains.map((d) => ({ slug: d.slug, number: d.number, name: d.name, summary: d.summary }))}
                maxTeamSize={maxTeamSize}
                teamSizeNote={teamSizeNote}
              />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="updates-title" id="updates" className={`scroll-mt-24 ${open ? "mt-24" : ""}`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeader number={open ? "02" : "01"} kicker="Event updates" id="updates-title" title="Get event updates" />
              <p className="prose-news mt-6">
                Join the update list to hear about official news — registration opening, confirmed dates, rules,
                domains and partners. We only email when there is something official to share.
              </p>
            </div>
            <div className="border-2 border-ink bg-paper-white p-5 sm:p-8">
              <UpdatesForm />
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}

function Row({ label, value, status }: { label: string; value: string | null; status: Parameters<typeof StatusTag>[0]["status"] }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="label text-[0.6875rem] text-muted">{label}</dt>
      <dd className="flex flex-col items-end gap-1 text-right">
        {value && <span className="font-display text-lg leading-tight">{value}</span>}
        <StatusTag status={status} />
      </dd>
    </div>
  );
}
