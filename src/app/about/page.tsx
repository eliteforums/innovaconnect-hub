import { photos } from "@/content/media";
import { event } from "@/content/event";
import { chapter1 } from "@/content/chapter1";
import { PageHeader } from "@/components/layout/PageHeader";
import { Figure } from "@/components/media/Figure";
import { ButtonLink, Container, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/about",
  "The Story — About InnovaHack & Elite Forums",
  "InnovaHack is a national hackathon organized by Elite Forums. Chapter 2 is planned for 2027 as a pan-India hybrid event.",
);

const facts = [
  { label: "Edition", value: event.chapterLabel, status: "confirmed" as const },
  { label: "Year", value: String(event.year.value), status: event.year.status },
  { label: "Scope", value: event.scope.value, status: event.scope.status },
  { label: "Format", value: event.format.value, status: event.format.status },
  { label: "Official domains", value: "Two", status: "confirmed" as const },
  { label: "Finale venue", value: event.venue.value, status: event.venue.status },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        section="The Story"
        crumbs={[{ label: "The Story", href: "/about" }]}
        title={
          <>
            India&rsquo;s next generation of builders. <span className="text-burgundy">One national stage.</span>
          </>
        }
        deck={event.description}
      />

      <Container className="mt-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <article className="prose-news space-y-5 text-lg [&_h2]:text-ink">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-burgundy">
              InnovaHack is a national hackathon organized by {event.organizer}. Its first edition took place in{" "}
              {chapter1.year}. The second edition — Chapter 2 — is planned for {event.year.value} as a larger national
              platform for technology innovation, AI development, original products, startup ideas and practical
              problem-solving.
            </p>
            <p>
              Chapter 2 combines nationwide online participation and selection with an offline national grand finale.
              It focuses on exactly two official competition domains: Artificial Intelligence, and Open Innovation /
              Startup Track.
            </p>
            <h2 className="headline pt-4 text-3xl uppercase">Why Mumbai?</h2>
            <p>
              This edition&rsquo;s visual identity is inspired by Mumbai — its black-and-yellow taxis, red BEST buses,
              local trains, heritage architecture, coastline, street food and creative culture. Mumbai was named in the
              original Chapter 1 event materials, and its energy shapes how this edition looks and feels.
            </p>
            <p>
              The event itself is pan-India. Builders from across the country are welcome, and the grand finale venue
              has not yet been announced.
            </p>
            <h2 className="headline pt-4 text-3xl uppercase">About the design</h2>
            <p>
              &ldquo;The Innovation Times&rdquo; is the design concept behind this website: a special newspaper edition
              about India&rsquo;s innovators. It is not a separate news publication, and the illustrations are original
              artwork inspired by the city.
            </p>
          </article>

          <aside className="space-y-8">
            <div className="border-2 border-ink bg-paper-white">
              <p className="border-b-2 border-ink bg-ink px-5 py-3 kicker text-taxi">Edition facts</p>
              <dl className="divide-y divide-rule px-5">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="label text-[0.6875rem] text-muted">{f.label}</dt>
                    <dd className="flex flex-col items-end gap-1 text-right">
                      {f.value && <span className="font-display text-lg leading-tight">{f.value}</span>}
                      <StatusTag status={f.status} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <Figure
              media={{
                illustration: "station",
                alt: "Illustration of Victorian Gothic architecture.",
                credit: "Illustration inspired by Victorian Gothic architecture",
                photo: photos.bmcTaxi,
              }}
              aspect="aspect-[4/3]"
            />
          </aside>
        </div>

        <section aria-labelledby="organizer-title" className="mt-20">
          <SectionHeader number="02" kicker="The organizer" id="organizer-title" title={event.organizer} />
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <p className="prose-news text-lg">
              {event.organizer} is a community-driven organization that connects builders with opportunities through tech
              meetups, hackathons and industry events. InnovaHack is its national hackathon.
            </p>
            <div className="flex flex-col items-start gap-4 border-l-4 border-taxi pl-6">
              <p className="font-display text-2xl italic">&ldquo;{event.tagline}&rdquo;</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/chapter-1" variant="outline">
                  The Chapter 1 archive
                </ButtonLink>
                <ButtonLink href="/contact">Contact us</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
