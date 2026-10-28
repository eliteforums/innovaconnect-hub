import { photos } from "@/content/media";
import { chapter1 } from "@/content/chapter1";
import { PageHeader } from "@/components/layout/PageHeader";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, PendingNotice, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/chapter-1",
  "Chapter 1 — The First Edition, 2026",
  "The historical archive of InnovaHack Chapter 1 (2026): reported and advertised figures, original domains and competition structure.",
);

export default function ChapterOnePage() {
  return (
    <>
      <PageHeader
        section={chapter1.label}
        crumbs={[{ label: "Chapter 1", href: "/chapter-1" }]}
        title={
          <>
            InnovaHack Chapter 1 <span className="block text-burgundy">The first edition, 2026</span>
          </>
        }
        deck={
          <p>
            The inaugural InnovaHack laid the foundation for everything Chapter 2 is building on. This archive records
            what was reported after the event and what was advertised before it — and labels each clearly.
          </p>
        }
        aside={
          <Figure
            media={{
              illustration: "station",
              alt: "Illustration of Victorian Gothic architecture.",
              credit: "Illustration inspired by Victorian Gothic architecture",
              photo: photos.csmt,
            }}
            aspect="aspect-[4/3]"
            priority
          />
        }
      />

      <Container className="mt-16 space-y-20">
        {/* 2. Metrics */}
        <section aria-labelledby="metrics-title">
          <SectionHeader number="01" kicker="The record" id="metrics-title" title="By the numbers" />
          <ul className="mt-8 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
            {[...chapter1.metrics, ...chapter1.context].map((m) => (
              <li key={m.label} className="border-b border-r border-ink bg-paper-white/60 p-6">
                <StatusTag status={m.status} />
                <p className="headline mt-3 text-5xl font-black text-burgundy">{m.value}</p>
                <p className="mt-2 label text-[0.75rem]">{m.label}</p>
                <p className="mt-2 text-sm text-charcoal">{m.caption}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <div>
              <dt className="inline font-semibold text-ink">Reported: </dt>
              <dd className="inline">figures reported after the event, including the post-event recap.</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-ink">As advertised: </dt>
              <dd className="inline">
                figures promoted before the event. They are not records of cash paid out or funding invested.
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-muted">
            Applications are not the same as individual participants or attendees. Location: {chapter1.location}
          </p>
        </section>

        {/* 3. Domains */}
        <section aria-labelledby="ch1-domains-title">
          <SectionHeader
            number="02"
            kicker="Original competition domains"
            id="ch1-domains-title"
            title="Five tracks in the first edition"
            deck={chapter1.domainsNote}
          />
          <ol className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-5">
            {chapter1.domains.map((d, i) => (
              <li key={d.name} className="bg-paper-white p-5">
                <p className="kicker text-burgundy">Track {String(i + 1).padStart(2, "0")}</p>
                <p className="headline mt-2 text-xl">{d.name}</p>
                <p className="mt-2 text-sm text-charcoal">{d.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Structure */}
        <section aria-labelledby="ch1-structure-title">
          <SectionHeader
            number="03"
            kicker="Original competition structure"
            id="ch1-structure-title"
            title="How Chapter 1 ran"
            deck="As advertised on the Chapter 1 website."
          />
          <ol className="mt-8 grid gap-6 md:grid-cols-5">
            {chapter1.structure.map((s, i) => (
              <li key={s.title} className="border-t-4 border-burgundy pt-4">
                <p className="kicker text-muted">Round {String(i + 1).padStart(2, "0")}</p>
                <p className="headline mt-1 text-xl uppercase">{s.title}</p>
                <p className="mt-2 text-sm text-charcoal">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5–8. Verified records */}
        <section aria-labelledby="records-title">
          <SectionHeader
            number="04"
            kicker="Results, partners, people & gallery"
            id="records-title"
            title="The verified record"
            deck="Only verified, organizer-approved names, results and photographs are published in this archive."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <RecordBlock title="Results & winners" items={chapter1.winners.map((w) => `${w.team} — ${w.award}`)} />
            <RecordBlock title="Historical partners" items={chapter1.partners.filter((p) => p.verified).map((p) => `${p.name} · ${p.category}`)} />
            <RecordBlock title="Judges & mentors" items={chapter1.judgesAndMentors.map((j) => `${j.name} · ${j.role}`)} />
            <RecordBlock title="Event gallery" items={chapter1.gallery.map((g) => g.alt)} />
          </div>
          <p className="mt-4 text-sm text-muted">
            The Chapter 1 partner roster is a historical record. It is not the Chapter 2 partner lineup.
          </p>
        </section>

        {/* 9. Lessons */}
        <section aria-labelledby="forward-title">
          <SectionHeader number="05" kicker="Carried into Chapter 2" id="forward-title" title="What changes next" />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {chapter1.carriedForward.map((c) => (
              <li key={c.title} className="border-2 border-ink bg-paper-white p-6">
                <p className="headline text-2xl uppercase">{c.title}</p>
                <p className="mt-3 text-charcoal">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 10. Transition */}
        <section aria-labelledby="transition-title" className="border-2 border-ink bg-ink p-8 text-paper-white sm:p-12">
          <p className="kicker text-taxi">Chapter 01 → Chapter 02</p>
          <h2 id="transition-title" className="headline mt-4 max-w-4xl text-[clamp(2.25rem,5vw,4rem)] uppercase">
            The first chapter built the foundation. <span className="text-taxi">The next chapter builds what comes next.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-paper/85">
            Chapter 2 brings a sharper focus — two official domains, Artificial Intelligence and Open Innovation / Startup
            — on a pan-India hybrid stage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="taxi">
              Enter Chapter 2
            </ButtonLink>
            {chapter1.links.map((l) => (
              <ButtonLink key={l.url} href={l.url} variant="light" external>
                {l.label}
              </ButtonLink>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

function RecordBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <PendingNotice title={title} kicker="Awaiting verification">
        <p className="text-sm">Records for this section are awaiting verification and will be published once approved.</p>
      </PendingNotice>
    );
  }
  return (
    <div className="border-2 border-ink bg-paper-white p-6">
      <p className="headline text-2xl uppercase">{title}</p>
      <ul className="mt-3 space-y-1">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
