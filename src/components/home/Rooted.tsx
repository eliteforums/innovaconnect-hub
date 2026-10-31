import { getSiteContent } from "@/lib/content";
import { Figure } from "@/components/media/Figure";
import { Container, Rich } from "@/components/ui";

export async function Rooted() {
  const { copy } = await getSiteContent();
  const r = copy.home.rooted;
  return (
    <section aria-labelledby="rooted-title" className="mt-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="in-view">
            <p className="kicker text-burgundy">
              <span className="mr-3 text-ink">No. {r.number}</span>
              {r.kicker}
            </p>
            <h2 id="rooted-title" className="headline mt-4 text-[clamp(2.75rem,6.5vw,5.5rem)] font-black uppercase">
              <Rich text={r.title} />
            </h2>
            <p className="prose-news mt-6 max-w-xl text-lg">
              <Rich text={r.body} />
            </p>
            {/* Timetable-style metadata */}
            <ol aria-label="What Mumbai represents" className="mt-8 max-w-md border-y-2 border-ink">
              {r.stops.map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-center justify-between border-b border-rule py-2 last:border-b-0">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="size-3 rounded-full border-2 border-ink bg-taxi" />
                    <span className="label">{s}</span>
                  </span>
                  <span className="kicker text-muted">
                    {r.stopLabel} {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">
              {r.venueNote}
            </p>
          </div>
          <div className="in-view grid grid-cols-2 gap-3 sm:grid-cols-4">
            {r.tiles.map((t, i) => (
              <div key={i} className={i === 0 ? "col-span-2 sm:col-span-4" : "col-span-1"}>
                <Figure media={t} aspect={i === 0 ? "aspect-[16/6]" : "aspect-square"} showCredit={false} />
              </div>
            ))}
            <p className="col-span-2 kicker text-[0.625rem] text-muted sm:col-span-4">
              {r.tilesCaption}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
