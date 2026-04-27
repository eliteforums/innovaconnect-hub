import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSponsors } from "@/lib/supabase";
import type { Sponsor } from "@/lib/supabase";

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
    <a
      href={sponsor.website_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={sponsor.name}
    >
      {tile}
    </a>
  ) : (
    tile
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

  return (
    <section id="sponsors" className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SECTION 05
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              SPONSORS & PARTNERS
            </h2>
          </div>
          <Link
            to="/partner"
            className="text-xs font-bold uppercase tracking-widest text-editorial-blue hover:underline hidden md:block"
          >
            BECOME A PARTNER →
          </Link>
        </div>
      </div>

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
      </div>
    </section>
  );
};

export default SponsorsSection;