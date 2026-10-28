import { event } from "@/content/event";
import { StatusTag } from "@/components/ui";
import { formatDate } from "@/lib/site";

/**
 * The competition journey drawn as a suburban railway line — each stage is a
 * station; the grand finale is the interchange.
 */
export function Journey() {
  const stages = event.journey;
  return (
    <div>
      {/* Desktop: horizontal line */}
      <ol className="relative hidden grid-cols-7 gap-4 lg:grid">
        <span aria-hidden className="absolute left-[7%] right-[7%] top-[22px] h-[6px] bg-burgundy" />
        {stages.map((s, i) => (
          <li key={s.id} className="relative flex flex-col items-center text-center">
            <StationDot finale={s.id === "finale"} />
            <p className="mt-4 kicker text-burgundy">Stop {String(i + 1).padStart(2, "0")}</p>
            <h3 className="headline mt-1 text-lg uppercase leading-tight">{s.title}</h3>
            <p className="mt-2 text-sm leading-snug text-charcoal">{s.description}</p>
            <StageMeta mode={s.mode} date={s.date} status={s.status} />
          </li>
        ))}
      </ol>

      {/* Mobile & tablet: vertical line */}
      <ol className="relative space-y-8 lg:hidden">
        <span aria-hidden className="absolute bottom-4 left-[19px] top-4 w-[6px] bg-burgundy" />
        {stages.map((s, i) => (
          <li key={s.id} className="relative grid grid-cols-[44px_1fr] gap-4">
            <StationDot finale={s.id === "finale"} />
            <div>
              <p className="kicker text-burgundy">Stop {String(i + 1).padStart(2, "0")}</p>
              <h3 className="headline mt-1 text-xl uppercase">{s.title}</h3>
              <p className="mt-1 text-[0.9375rem] text-charcoal">{s.description}</p>
              <StageMeta mode={s.mode} date={s.date} status={s.status} align="start" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StationDot({ finale }: { finale: boolean }) {
  return finale ? (
    <span aria-hidden className="relative z-10 flex size-11 items-center justify-center rounded-full border-[3px] border-ink bg-taxi">
      <span className="size-4 rounded-full border-[3px] border-ink bg-paper-white" />
    </span>
  ) : (
    <span aria-hidden className="relative z-10 mx-auto mt-1 size-9 rounded-full border-[3px] border-ink bg-paper-white lg:mt-1" />
  );
}

function StageMeta({
  mode,
  date,
  status,
  align = "center",
}: {
  mode: string;
  date: string | null;
  status: "proposed";
  align?: "center" | "start";
}) {
  return (
    <div className={`mt-3 flex flex-wrap items-center gap-1.5 ${align === "center" ? "justify-center" : ""}`}>
      <span className="border border-ink px-1.5 py-0.5 kicker text-[0.625rem]">{mode}</span>
      <span className="kicker text-[0.625rem] text-muted">{formatDate(date) ?? "Date TBA"}</span>
      <StatusTag status={status} />
    </div>
  );
}
