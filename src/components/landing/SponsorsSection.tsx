import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSponsors } from "@/lib/supabase";
import type { Sponsor } from "@/lib/supabase";

<<<<<<< HEAD
type LogoTileProps = { sponsor?: Sponsor };

const LogoTile = ({ sponsor }: LogoTileProps) => {
  const isPlaceholder = !sponsor;
  const name = sponsor?.name || "SPONSOR NAME";
  const logo_url = sponsor?.logo_url;

  const tile = (
    <div className="w-40 h-40 md:w-40 md:h-40 border border-border/50 rounded-2xl overflow-hidden bg-background/40 backdrop-blur-md p-4 hover:bg-secondary/40 hover:border-editorial-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group relative flex flex-col items-center justify-between gap-2">
      <div className="absolute inset-0 bg-gradient-to-br from-editorial-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

      {/* Logo Area */}
      <div className="h-24 w-full flex items-center justify-center relative z-10">
        {logo_url ? (
          <img
            src={logo_url}
            alt={name}
            title={name}
            loading="lazy"
            className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-border/50 rounded-full flex items-center justify-center bg-black/20">
            <span className="text-[10px] text-muted-foreground font-bold">LOGO</span>
          </div>
        )}
      </div>

      {/* Name Area */}
      <div className="w-full text-center relative z-10 shrink-0 min-h-[42px] flex items-center justify-center">
        <span
          style={{
            display: 'block',
            width: '100%',
            wordBreak: 'break-word',
            color: 'white',
            fontWeight: '900',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            lineHeight: '1.2'
          }}
        >
          {name}
        </span>
      </div>
    </div>
  );

  if (isPlaceholder || !sponsor?.website_url) {
    return tile;
  }

  return (
=======
// Maps a display category label to the DB `category` values that belong to it.
const categoryMap: { label: string; match: string[] }[] = [
  { label: "TITLE SPONSOR", match: ["title"] },
  {
    label: "DOMAIN SPONSORS",
    match: [
      "domain_ai",
      "domain_fintech",
      "domain_healthtech",
      "domain_blockchain",
      "domain_startup",
      "gold",
    ],
  },
  { label: "HIRING PARTNERS", match: ["hiring"] },
  { label: "TECH PARTNERS", match: ["tech"] },
  { label: "EDUCATION PARTNERS", match: ["education"] },
  { label: "COMMUNITY PARTNERS", match: ["community"] },
  { label: "COLLEGE PARTNERS", match: ["college"] },
  { label: "INCUBATORS & INVESTORS", match: ["incubator", "investor"] },
];

type LogoTileProps = { sponsor?: Sponsor };

const LogoTile = ({ sponsor }: LogoTileProps) => {
  if (!sponsor) {
    return (
      <div className="w-20 h-20 border-2 border-dashed border-border rounded flex items-center justify-center">
        <span className="text-xs text-muted-foreground">LOGO</span>
      </div>
    );
  }
  const tile = (
    <div className="w-20 h-20 border border-border rounded flex items-center justify-center overflow-hidden bg-background p-2">
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          title={sponsor.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold text-center text-muted-foreground line-clamp-2">
          {sponsor.name}
        </span>
      )}
    </div>
  );
  return sponsor.website_url ? (
>>>>>>> 7d09f42b09d23993db77ff42eabf8e571838f247
    <a
      href={sponsor.website_url}
      target="_blank"
      rel="noopener noreferrer"
<<<<<<< HEAD
      aria-label={name}
      className="block"
    >
      {tile}
    </a>
=======
      aria-label={sponsor.name}
    >
      {tile}
    </a>
  ) : (
    tile
>>>>>>> 7d09f42b09d23993db77ff42eabf8e571838f247
  );
};

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchSponsors();
      if (!cancelled) setSponsors((data ?? []) as Sponsor[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

<<<<<<< HEAD
  let topRowSponsors = sponsors.filter(s => s.track === "upper_row");
  let bottomRowSponsors = sponsors.filter(s => s.track === "lower_row");

  const getDisplayItems = (items: Sponsor[]) => {
    const list = items.length > 0 ? items : Array.from({ length: 8 }).map(() => undefined);
    // Ensure we have at least 12 items to make the row long enough to span screen
    const repeats = Math.ceil(12 / list.length);
    let display: { keyId: string, sponsor?: Sponsor }[] = [];
    
    for (let i = 0; i < repeats; i++) {
      list.forEach((item, idx) => {
        display.push({
          keyId: (item as Sponsor)?.id ? `${(item as Sponsor).id}-${i}` : `empty-${idx}-${i}`,
          sponsor: item as Sponsor
        });
      });
    }
    return display;
  };

  const topDisplay = getDisplayItems(topRowSponsors);
  const bottomDisplay = getDisplayItems(bottomRowSponsors);

  // Calculate speed: 3.5 seconds per item (including its gap)
  const topDuration = `${topDisplay.length * 3.5}s`;
  const bottomDuration = `${bottomDisplay.length * 3.5}s`;

  return (
    <section id="sponsors" className="border-b-2 border-foreground overflow-hidden">
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
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-editorial-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {/* <span className="w-10 h-[2px] bg-editorial-blue"></span> */}
              <p className="text-xs font-black tracking-[0.4em] uppercase text-muted-foreground mb-1">
                SECTION 05
              </p>
            </div>
            <h2 className="md:text-4xl lg:text-6xl font-black uppercase tracking-tighter">
=======
  return (
    <section id="sponsors" className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SECTION 05
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
>>>>>>> 7d09f42b09d23993db77ff42eabf8e571838f247
              SPONSORS & PARTNERS
            </h2>
          </div>
          <Link
<<<<<<< HEAD
            to="/sponsors"
            className="text-xs font-bold uppercase tracking-[0.2em] text-editorial-blue hover:text-editorial-blue/80 transition-colors hidden md:block relative z-10"
          >
            View Our SPONSORS →
=======
            to="/partner"
            className="text-xs font-bold uppercase tracking-widest text-editorial-blue hover:underline hidden md:block"
          >
            BECOME A PARTNER →
>>>>>>> 7d09f42b09d23993db77ff42eabf8e571838f247
          </Link>
        </div>
      </div>

<<<<<<< HEAD
      <div className="py-12 md:py-20 flex flex-col gap-6 md:gap-20 bg-secondary/10 relative z-0">
        {/* Top Row - Scrolling Left */}
        <div className="overflow-hidden w-full relative">
          <div className="marquee-container animate-scroll-left" style={{ '--duration': topDuration } as any}>
            <div className="flex gap-20 pr-20">
              {topDisplay.map((item) => (
                <div key={`top-1-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
            <div className="flex gap-20 pr-20">
              {topDisplay.map((item) => (
                <div key={`top-2-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Scrolling Right */}
        <div className="overflow-hidden w-full relative">
          <div className="marquee-container animate-scroll-right" style={{ '--duration': bottomDuration } as any}>
            <div className="flex gap-20 pr-20">
              {bottomDisplay.map((item) => (
                <div key={`bottom-1-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
            <div className="flex gap-20 pr-20">
              {bottomDisplay.map((item) => (
                <div key={`bottom-2-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
          </div>
        </div>
=======
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categoryMap.map(({ label, match }) => {
          const matched = sponsors.filter((s) => match.includes(s.category));
          return (
            <div
              key={label}
              className="border-b border-r border-border p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px] hover:bg-secondary/30 transition-colors"
            >
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                {label}
              </p>
              {matched.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {matched.slice(0, 6).map((s) => (
                    <LogoTile key={s.id} sponsor={s} />
                  ))}
                </div>
              ) : (
                <LogoTile />
              )}
            </div>
          );
        })}
>>>>>>> 7d09f42b09d23993db77ff42eabf8e571838f247
      </div>
    </section>
  );
};

export default SponsorsSection;