import { useEffect, useState } from "react";
import { fetchJudgesMentors } from "@/lib/supabase";
import type { JudgeMentor } from "@/lib/supabase";

type PersonTileProps = { person?: JudgeMentor };

const PersonTile = ({ person }: PersonTileProps) => {
  const isPlaceholder = !person;
  const name = person?.name || "NAME";
  const role = person?.role || "POSITION / COMPANY";
  const image_url = person?.image_url;

  const tile = (
    <div className="w-44 h-60 md:w-48 md:h-64 border border-border/50 rounded-2xl overflow-hidden bg-background/40 backdrop-blur-md p-5 hover:bg-secondary/40 hover:border-editorial-pink/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] transition-all duration-500 group relative flex flex-col items-center text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-editorial-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

      {/* Image Area */}
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-4 border-2 border-border/50 group-hover:border-editorial-pink/50 transition-colors relative z-10 bg-black/20">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-black tracking-widest">
              IMAGE
            </span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="w-full relative z-10 flex-1 flex flex-col justify-center">
        <h4 className="text-xs md:text-sm font-black uppercase tracking-tight text-foreground mb-1 line-clamp-2">
          {name}
        </h4>
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground line-clamp-2 leading-relaxed">
          {role}
        </p>
      </div>

      {/* Profile Link Indicator */}
      {person?.linkedin_url && (
        <div className="mt-4 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-editorial-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Profile →
          </span>
        </div>
      )}
    </div>
  );

  if (isPlaceholder || !person?.linkedin_url) {
    return tile;
  }

  return (
    <a
      href={person.linkedin_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="block"
    >
      {tile}
    </a>
  );
};

const JudgesMentorsSection = () => {
  const [people, setPeople] = useState<JudgeMentor[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchJudgesMentors();
      if (!cancelled) setPeople((data ?? []) as JudgeMentor[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  let topRowPeople = people.filter((p) => p.track === "upper_row");
  let bottomRowPeople = people.filter((p) => p.track === "lower_row");

  const getDisplayItems = (items: JudgeMentor[]) => {
    const list =
      items.length > 0 ? items : Array.from({ length: 8 }).map(() => undefined);
    // Ensure we have at least 12 items to make the row long enough to span screen
    const repeats = Math.ceil(12 / list.length);
    let display: { keyId: string; person?: JudgeMentor }[] = [];

    for (let i = 0; i < repeats; i++) {
      list.forEach((item, idx) => {
        display.push({
          keyId: (item as JudgeMentor)?.id
            ? `${(item as JudgeMentor).id}-${i}`
            : `empty-${idx}-${i}`,
          person: item as JudgeMentor,
        });
      });
    }
    return display;
  };

  const topDisplay = getDisplayItems(topRowPeople);
  const bottomDisplay = getDisplayItems(bottomRowPeople);

  // Calculate speed: 4 seconds per item (slightly slower than sponsors for readability)
  const topDuration = `${topDisplay.length * 4}s`;
  const bottomDuration = `${bottomDisplay.length * 4}s`;

  return (
    <section id="judges" className="border-b-2 border-foreground overflow-hidden">
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-container {
            display: flex;
            width: max-content;
          }
          .animate-scroll-left {
            animation: scroll-left var(--duration, 40s) linear infinite;
          }
          .animate-scroll-right {
            animation: scroll-right var(--duration, 40s) linear infinite;
          }
          .marquee-container:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="border-b border-border px-4 md:px-8 py-10 relative z-10 bg-background overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-editorial-pink/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-black tracking-[0.4em] uppercase text-muted-foreground mb-1">
                EXPERT PANEL
              </p>
            </div>
            <h2 className="md:text-4xl lg:text-6xl font-black uppercase tracking-tighter">
              JUDGES & MENTORS
            </h2>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-12 flex flex-col gap-12 md:gap-18 bg-secondary/5 relative z-0">
        {/* Top Row - Scrolling Left */}
        <div className="w-full relative">
          <div className="flex items-center justify-center gap-6 md:gap-8 mb-8 md:mb-14 px-8 md:px-20">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/30 to-foreground/50"></div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.4em] text-white whitespace-nowrap">
              JUDGES
            </h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-foreground/30 to-foreground/50"></div>
          </div>
          <div className="overflow-hidden w-full relative">
            <div
              className="marquee-container animate-scroll-left"
              style={{ "--duration": topDuration } as any}
            >
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16">
                {topDisplay.map((item) => (
                  <div key={`top-1-${item.keyId}`} className="flex-shrink-0">
                    <PersonTile person={item.person} />
                  </div>
                ))}
              </div>
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16">
                {topDisplay.map((item) => (
                  <div key={`top-2-${item.keyId}`} className="flex-shrink-0">
                    <PersonTile person={item.person} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Scrolling Right */}
        <div className="w-full relative">
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-10 md:mb-14 px-8 md:px-20">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/30 to-foreground/50"></div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.4em] text-white whitespace-nowrap">
              MENTORS
            </h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-foreground/30 to-foreground/50"></div>
          </div>
          <div className="overflow-hidden w-full relative">
            <div
              className="marquee-container animate-scroll-right"
              style={{ "--duration": bottomDuration } as any}
            >
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16">
                {bottomDisplay.map((item) => (
                  <div key={`bottom-1-${item.keyId}`} className="flex-shrink-0">
                    <PersonTile person={item.person} />
                  </div>
                ))}
              </div>
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16">
                {bottomDisplay.map((item) => (
                  <div key={`bottom-2-${item.keyId}`} className="flex-shrink-0">
                    <PersonTile person={item.person} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JudgesMentorsSection;
