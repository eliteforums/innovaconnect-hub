import { Figure } from "@/components/media/Figure";
import { Container } from "@/components/ui";
import { photos } from "@/content/media";
import type { MediaSlot } from "@/content/types";

const tiles: MediaSlot[] = [
  { illustration: "train", alt: "Illustration of a suburban local train.", credit: "Local train", photo: photos.localTrain },
  { illustration: "taxi", alt: "Illustration of a black-and-yellow taxi.", credit: "Taxi", photo: photos.bmcTaxi },
  { illustration: "bus", alt: "Illustration of a red city bus.", credit: "BEST bus", photo: photos.bestBuses },
  {
    illustration: "heritage",
    alt: "Illustration of Victorian Gothic architecture.",
    credit: "Heritage",
    photo: photos.csmt,
  },
  {
    illustration: "workstation",
    alt: "Illustration of a laptop with code, a phone prototype and a glass of cutting chai.",
    credit: "Prototype",
    photo: photos.startupDomain,
  },
];

const stations = ["Movement", "Resilience", "Diversity", "Possibility"];

export function Rooted() {
  return (
    <section aria-labelledby="rooted-title" className="mt-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="in-view">
            <p className="kicker text-burgundy">
              <span className="mr-3 text-ink">No. 02</span>Mumbai inspires. India innovates.
            </p>
            <h2 id="rooted-title" className="headline mt-4 text-[clamp(2.75rem,6.5vw,5.5rem)] font-black uppercase">
              Rooted in Mumbai. <span className="text-burgundy">Built for India.</span>
            </h2>
            <p className="prose-news mt-6 max-w-xl text-lg">
              From the speed of its local trains to the ambition of its builders, Mumbai represents movement,
              resilience, diversity, and possibility. InnovaHack brings that spirit to a national platform for
              technology and entrepreneurship.
            </p>
            {/* Timetable-style metadata */}
            <ol aria-label="What Mumbai represents" className="mt-8 max-w-md border-y-2 border-ink">
              {stations.map((s, i) => (
                <li key={s} className="flex items-center justify-between border-b border-rule py-2 last:border-b-0">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="size-3 rounded-full border-2 border-ink bg-taxi" />
                    <span className="label">{s}</span>
                  </span>
                  <span className="kicker text-muted">Stop {String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">
              Chapter 2 is a pan-India event. The grand finale venue has not yet been announced.
            </p>
          </div>
          <div className="in-view grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((t, i) => (
              <div key={i} className={i === 0 ? "col-span-2 sm:col-span-4" : "col-span-1"}>
                <Figure media={t} aspect={i === 0 ? "aspect-[16/6]" : "aspect-square"} showCredit={false} />
              </div>
            ))}
            <p className="col-span-2 kicker text-[0.625rem] text-muted sm:col-span-4">
              Local train · Taxi outside the BMC headquarters · BEST buses · CSMT · A prototype taking shape
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
