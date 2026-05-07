import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSponsors } from "@/lib/supabase";
import type { Sponsor } from "@/lib/supabase";

type LogoTileProps = { sponsor?: Sponsor };

const LogoTile = ({ sponsor }: LogoTileProps) => {
  const isPlaceholder = !sponsor;
  const name = sponsor?.name || "SPONSOR NAME";
  const logo_url = sponsor?.logo_url;

  const tile = (
    <div className="w-40 h-40 md:w-40 md:h-40 border border-border/50 rounded-2xl overflow-hidden bg-background/40 backdrop-blur-md p-4 hover:bg-secondary/40 hover:border-editorial-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group relative flex flex-col items-center justify-between gap-2">
      <div className="absolute inset-0 bg-gradient-to-br from-editorial-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

      {/* Logo Area */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 min-h-0">
        {logo_url ? (
          <img
            src={logo_url}
            alt={name}
            title={name}
            loading="lazy"
            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-border/50 rounded-full flex items-center justify-center bg-black/20">
            <span className="text-[10px] text-muted-foreground font-bold">LOGO</span>
          </div>
        )}
      </div>

      {/* Name Area */}
      <div className="w-full text-center relative z-10 shrink-0 mt-auto">
        <span
          style={{
            display: 'block',
            width: '100%',
            wordBreak: 'break-word',
            color: 'white',
            fontWeight: '900',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
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
    <a
      href={sponsor.website_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="block"
    >
      {tile}
    </a>
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

  let topRowSponsors = sponsors.filter(s => s.category === "upper_row");
  let bottomRowSponsors = sponsors.filter(s => s.category === "lower_row");

  const getDisplayItems = (items: Sponsor[]) => {
    if (items.length === 0) {
      return Array.from({ length: 8 }).map((_, i) => ({
        keyId: `empty-${i}`,
        sponsor: undefined
      }));
    }
    let display: { keyId: string, sponsor: Sponsor }[] = [];
    let iteration = 0;
    while (display.length < 10) {
      items.forEach(item => {
        display.push({
          keyId: `${item.id}-${iteration}`,
          sponsor: item
        });
      });
      iteration++;
    }
    return display;
  };

  const topDisplay = getDisplayItems(topRowSponsors);
  const bottomDisplay = getDisplayItems(bottomRowSponsors);

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
            animation: scroll-left 40s linear infinite;
          }
          .animate-scroll-right {
            animation: scroll-right 40s linear infinite;
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
              SPONSORS & PARTNERS
            </h2>
          </div>
          <Link
            to="/sponsors"
            className="text-xs font-bold uppercase tracking-[0.2em] text-editorial-blue hover:text-editorial-blue/80 transition-colors hidden md:block relative z-10"
          >
            View Our SPONSORS →
          </Link>
        </div>
      </div>

      <div className="py-12 md:py-20 flex flex-col gap-6 md:gap-8 bg-secondary/10 relative z-0">
        {/* Top Row - Scrolling Left */}
        <div className="overflow-hidden w-full relative">
          <div className="marquee-container animate-scroll-left">
            <div className="flex gap-4 md:gap-6 px-2 md:px-3">
              {topDisplay.map((item) => (
                <div key={`top-1-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
            <div className="flex gap-4 md:gap-6 px-2 md:px-3">
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
          <div className="marquee-container animate-scroll-right">
            <div className="flex gap-4 md:gap-6 px-2 md:px-3">
              {bottomDisplay.map((item) => (
                <div key={`bottom-1-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
            <div className="flex gap-4 md:gap-6 px-2 md:px-3">
              {bottomDisplay.map((item) => (
                <div key={`bottom-2-${item.keyId}`} className="flex-shrink-0">
                  <LogoTile sponsor={item.sponsor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;