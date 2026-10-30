import { getSiteContent, type SiteContent } from "@/lib/content";
import { ContentImage } from "@/components/media/ContentImage";
import { StatusTag } from "@/components/ui";
import { fill, formatDate, registrationState } from "@/lib/site";

type Stage = SiteContent["event"]["journey"][number];
type RailCopy = SiteContent["copy"]["timeline"]["rail"];

/**
 * The competition journey as a Mumbai suburban line: each stage is a station
 * with an Indian Railways–style name board, joined by a railway track. A local
 * train runs along the track as the section scrolls (where supported); it is
 * decorative and does not indicate progress.
 */
export async function RailwayJourney() {
  const c = await getSiteContent();
  const stages = c.event.journey;
  const status = registrationState(c).badge;
  const r = c.copy.timeline.rail;
  const train = c.images.timelineTrain;
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-ink py-2 kicker text-[0.6875rem]">
        <span className="bg-ink px-2 py-0.5 text-taxi">{r.lineTag}</span>
        <span>
          {r.nowBoarding} <span className="text-burgundy">{status}</span>
        </span>
        <span className="text-muted">{fill(r.stationsLabel, { count: stages.length })}</span>
      </p>

      {/* Desktop: horizontal line */}
      <div className="journey-line relative mt-8 hidden lg:block">
        {/* Track lane, behind the stations */}
        <div aria-hidden className="absolute inset-x-0 top-[104px] h-[210px]">
          <OverheadWire />
          <Track />
        </div>

        <ol className="relative grid grid-cols-7 gap-3">
          {stages.map((s, i) => (
            <li key={s.id} className="flex flex-col">
              <StationBoard stage={s} index={i} r={r} />
              {/* Lane: mast and stop marker, aligned with the track */}
              <div aria-hidden className="relative h-[210px]">
                <span className="absolute left-1/2 top-[6px] h-[166px] w-[3px] -translate-x-1/2 bg-ink" />
                <span className="absolute left-1/2 top-[6px] h-[3px] w-10 -translate-x-1/2 bg-ink" />
                <span className="absolute left-1/2 top-[150px] flex size-6 -translate-x-1/2 items-center justify-center border-2 border-ink bg-taxi font-mono text-[0.625rem] font-bold">
                  {i + 1}
                </span>
              </div>
              <StageDetails stage={s} r={r} />
            </li>
          ))}
        </ol>

        {/* The local, on the near rail */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[104px] h-[210px]">
          <div className="train-run absolute inset-0">
            <div className="absolute bottom-[14px] left-[-12px] w-[270px]">
              <TrainTag label={r.trainTag} />
              <ContentImage src={train} alt="" sizes="270px" className="h-auto w-full drop-shadow-[0_6px_6px_rgba(23,23,23,0.25)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & tablet: the line runs down the page */}
      <div className="mt-8 lg:hidden">
        <div aria-hidden className="relative mb-2 ml-1 w-[230px] sm:w-[280px]">
          <TrainTag label={r.trainTag} />
          <ContentImage src={train} alt="" sizes="280px" className="h-auto w-full" />
        </div>
        <ol className="relative">
          <VerticalTrack />
          {stages.map((s, i) => (
            <li key={s.id} className="relative grid grid-cols-[64px_1fr] gap-3 pb-10 last:pb-2">
              <span
                aria-hidden
                className="relative z-10 mt-5 ml-[19px] flex size-7 items-center justify-center border-2 border-ink bg-taxi font-mono text-xs font-bold"
              >
                {i + 1}
              </span>
              <div>
                <StationBoard stage={s} index={i} r={r} compact />
                <StageDetails stage={s} r={r} align="start" />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 text-xs text-muted">
        {r.footnote}
      </p>
    </div>
  );
}

/** Yellow station name board in the Indian Railways style; the finale is the terminus. */
function StationBoard({ stage, index, r, compact = false }: { stage: Stage; index: number; r: RailCopy; compact?: boolean }) {
  const terminus = stage.id === "finale";
  return (
    <div className={compact ? "" : "flex h-[104px] flex-col items-center justify-end"}>
      <div
        className={`w-full border-[3px] border-ink px-2 py-2 text-center shadow-[3px_3px_0_0_var(--color-ink)] ${
          terminus ? "bg-burgundy text-paper-white" : "bg-taxi text-ink"
        } ${compact ? "max-w-[260px] text-left" : "max-w-[170px]"}`}
      >
        <p className={`kicker text-[0.5625rem] ${terminus ? "text-taxi" : ""}`}>
          {terminus ? `${r.terminusLabel} · ` : ""}
          {r.stopLabel} {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-0.5 font-sans text-[1.0625rem] font-extrabold uppercase leading-tight tracking-wide">
          {stage.station}
        </h3>
      </div>
      {!compact && (
        <div aria-hidden className="flex w-[120px] justify-between">
          <span className="h-3 w-[3px] bg-ink" />
          <span className="h-3 w-[3px] bg-ink" />
        </div>
      )}
    </div>
  );
}

function StageDetails({ stage, r, align = "center" }: { stage: Stage; r: RailCopy; align?: "center" | "start" }) {
  return (
    <div className={`mt-4 ${align === "center" ? "text-center" : ""}`}>
      <p className="headline text-lg uppercase leading-tight">{stage.title}</p>
      <p className="mt-2 text-sm leading-snug text-charcoal">{stage.description}</p>
      <div className={`mt-3 flex flex-wrap items-center gap-1.5 ${align === "center" ? "justify-center" : ""}`}>
        <span className="border border-ink px-1.5 py-0.5 kicker text-[0.625rem]">
          {r.platformLabel} · {stage.mode}
        </span>
        <span className="kicker text-[0.625rem] text-muted">{formatDate(stage.date) ?? r.dateTba}</span>
        <StatusTag status={stage.status} />
      </div>
    </div>
  );
}

function TrainTag({ label }: { label: string }) {
  return (
    <span className="absolute -top-2 left-[44%] z-10 whitespace-nowrap border-2 border-ink bg-ink px-2 py-0.5 font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-taxi">
      {label}
    </span>
  );
}

function OverheadWire() {
  return (
    <>
      <span className="absolute inset-x-0 top-[6px] h-[2px] bg-ink" />
      <span className="absolute inset-x-0 top-[20px] h-px bg-ink/70" />
      <span className="absolute inset-x-0 top-[6px] h-[15px] bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_1px,transparent_1px_64px)] opacity-60" />
    </>
  );
}

/** Ballast, sleepers and two steel rails, seen from the side. */
function Track() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[44px]">
      {/* Ballast */}
      <div className="absolute inset-x-0 bottom-0 h-[16px] bg-stone-400/60 bg-[radial-gradient(circle,rgba(23,23,23,0.45)_1px,transparent_1.6px)] bg-[length:6px_5px]" />
      {/* Sleepers */}
      <div className="absolute inset-x-0 bottom-[8px] h-[26px] bg-[repeating-linear-gradient(90deg,#5b4636_0_11px,transparent_11px_30px)]" />
      {/* Far rail */}
      <div className="absolute inset-x-0 bottom-[28px] h-[5px] border-y border-ink bg-[#8e8a82]" />
      {/* Near rail */}
      <div className="absolute inset-x-0 bottom-[12px] h-[7px] border-y border-ink bg-[linear-gradient(#c9c4ba,#6b675f)]" />
    </div>
  );
}

function VerticalTrack() {
  return (
    <span aria-hidden className="absolute bottom-0 left-[14px] top-0 w-[38px]">
      <span className="absolute inset-y-0 left-0 w-full bg-[repeating-linear-gradient(180deg,#5b4636_0_9px,transparent_9px_24px)]" />
      <span className="absolute inset-y-0 left-[6px] w-[5px] border-x border-ink bg-[#8e8a82]" />
      <span className="absolute inset-y-0 right-[6px] w-[5px] border-x border-ink bg-[#8e8a82]" />
    </span>
  );
}
