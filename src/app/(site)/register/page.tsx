import { getSiteContent } from "@/lib/content";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { UpdatesForm } from "@/components/forms/UpdatesForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { fill, formatDate, isRegistrationOpen, registrationState } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/register", copy.register.seo.title, copy.register.seo.description);
}

export default async function RegisterPage() {
  const c = await getSiteContent();
  const { event } = c;
  const x = c.copy.register;
  const state = registrationState(c);
  const open = isRegistrationOpen(c);
  const maxTeamSize = event.teamSize.max ?? event.formTeamMemberLimit;
  const teamSizeNote = event.teamSize.max
    ? [fill(x.teamSizeNoteFixed, { max: event.teamSize.max }), event.teamSize.min ? fill(x.teamSizeNoteMin, { min: event.teamSize.min }) : ""]
        .filter(Boolean)
        .join(" ")
    : fill(x.teamSizeNoteOpen, { note: event.teamSize.note, max: maxTeamSize });

  return (
    <>
      <PageHeader
        section={x.section}
        crumbs={[{ label: c.navigation.primary.find((n) => n.href === "/register")?.label ?? x.section, href: "/register" }]}
        title={state.headline}
        deck={state.body}
        aside={
          <div className="border-2 border-ink bg-paper-white">
            <p className="border-b-2 border-ink bg-taxi px-5 py-3 kicker">{x.statusBoard}</p>
            <dl className="divide-y divide-rule px-5">
              <Row label={x.rows.status} value={state.badge} status="confirmed" />
              <Row
                label={x.rows.teamSize}
                value={event.teamSize.max ? fill(x.teamSizeValue, { max: event.teamSize.max }) : null}
                status={event.teamSize.status}
              />
              <Row label={x.rows.fee} value={event.registration.fee.value} status={event.registration.fee.status} />
              <Row
                label={x.rows.dates}
                value={formatDate(event.registration.opensOn.value)}
                status={event.registration.opensOn.status}
              />
            </dl>
          </div>
        }
      />

      <Container className="mt-14">
        {open ? (
          <section aria-labelledby="register-title">
            <SectionHeader number="01" kicker={x.registerKicker} id="register-title" title={x.registerTitle} deck={x.registerDeck} />
            <div className="mt-10 max-w-4xl">
              <RegistrationForm
                domains={c.domains.list.map((d) => ({ slug: d.slug, number: d.number, name: d.name, summary: d.summary }))}
                maxTeamSize={maxTeamSize}
                teamSizeNote={teamSizeNote}
              />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="updates-title" id="updates" className={`scroll-mt-24 ${open ? "mt-24" : ""}`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeader number={open ? "02" : "01"} kicker={x.updatesKicker} id="updates-title" title={x.updatesTitle} />
              <p className="prose-news mt-6">
                <Rich text={x.updatesBody} />
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

function Row({
  label,
  value,
  status,
}: {
  label: string;
  value: string | null;
  status: Parameters<typeof StatusTag>[0]["status"];
}) {
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
