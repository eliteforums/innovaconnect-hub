import { useEffect, useState } from "react";
import { fetchTeamMembers } from "@/lib/supabase";
import type { TeamMember } from "@/lib/supabase";

type PersonTileProps = { person?: TeamMember };

const PersonTile = ({ person }: PersonTileProps) => {
  const isPlaceholder = !person;
  const name = person?.name || "NAME";
  const role = person?.role || "POSITION";
  const email = person?.email || "";
  const instagram_url = person?.instagram_url;
  const linkedin_url = person?.linkedin_url;
  const image_url = person?.image_url;

  return (
    <div className="w-52 md:w-56 flex flex-col bg-background border border-foreground/20 rounded-[2rem] group hover:border-editorial-pink transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)] p-6 m-1 relative">
      {/* Top: Smaller Squared Image */}
      <div className="flex justify-center mb-6">
        <div className="w-28 h-28 md:w-32 md:h-32 overflow-hidden border border-foreground/10 bg-secondary/20 relative">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                TEAM
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Info & Icons */}
      <div className="flex flex-col items-center text-center flex-1">
        {/* Name with flanking themed lines */}
        <div className="flex items-center justify-center gap-3 w-full mb-1">
          <div className="h-[1px] flex-1 bg-foreground/20 group-hover:bg-editorial-pink/50 transition-colors" />
          <div className="flex items-center shrink-0">
            <h4 className="text-[13px] md:text-sm font-black uppercase tracking-tight text-foreground group-hover:text-editorial-pink transition-colors">
              {name}
            </h4>
          </div>
          <div className="h-[1px] flex-1 bg-foreground/20 group-hover:bg-editorial-pink/50 transition-colors" />
        </div>
        
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
          {role}
        </p>

        {/* Social Icons - Always Visible */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-foreground/5 w-full">
          <a 
            href={instagram_url || "#"} 
            target={instagram_url ? "_blank" : undefined}
            rel={instagram_url ? "noopener noreferrer" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 transition-all duration-300 group/social shadow-sm border border-transparent ${
              instagram_url 
                ? "hover:bg-[#E4405F]/10 text-muted-foreground hover:text-[#E4405F] hover:shadow-[#E4405F]/20 hover:border-[#E4405F]/30" 
                : "opacity-40 cursor-not-allowed text-muted-foreground/50"
            }`}
            aria-label="Instagram"
            onClick={(e) => !instagram_url && e.preventDefault()}
          >
            <svg className="w-4 h-4 fill-current transition-transform duration-300 group-hover/social:scale-110" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
          <a 
            href={linkedin_url || "#"} 
            target={linkedin_url ? "_blank" : undefined}
            rel={linkedin_url ? "noopener noreferrer" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 transition-all duration-300 group/social shadow-sm border border-transparent ${
              linkedin_url 
                ? "hover:bg-[#0077B5]/10 text-muted-foreground hover:text-[#0077B5] hover:shadow-[#0077B5]/20 hover:border-[#0077B5]/30" 
                : "opacity-40 cursor-not-allowed text-muted-foreground/50"
            }`}
            aria-label="LinkedIn"
            onClick={(e) => !linkedin_url && e.preventDefault()}
          >
            <svg className="w-3.5 h-3.5 fill-current transition-transform duration-300 group-hover/social:scale-110" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          
          <div className="relative group/email-pop">
            <button 
              onClick={(e) => {
                if (!email) return;
                navigator.clipboard.writeText(email);
                const pop = e.currentTarget.nextElementSibling;
                if (pop) {
                  pop.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-2');
                  pop.classList.add('opacity-100', 'translate-y-0');
                  setTimeout(() => {
                    pop.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
                    pop.classList.remove('opacity-100', 'translate-y-0');
                  }, 3000);
                }
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 transition-all duration-300 group/social shadow-sm border border-transparent ${
                email 
                  ? "hover:bg-editorial-pink/10 text-muted-foreground hover:text-editorial-pink hover:shadow-editorial-pink/20 hover:border-editorial-pink/30" 
                  : "opacity-40 cursor-not-allowed text-muted-foreground/50"
              }`}
              aria-label="Email"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5] transition-transform duration-300 group-hover/social:scale-110" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            
            {/* Pop-out Bubble */}
            {email && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-background/90 backdrop-blur-xl border border-editorial-pink/30 rounded-xl shadow-[0_10px_30px_rgba(236,72,153,0.2)] opacity-0 pointer-events-none -translate-y-2 transition-all duration-300 z-50 whitespace-nowrap"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-bold text-foreground selection:bg-editorial-pink/30">{email}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-editorial-pink/80">Copied to clipboard</span>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-editorial-pink/30"></div>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

const TeamMembersSection = () => {
  const [people, setPeople] = useState<TeamMember[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchTeamMembers();
      if (!cancelled) setPeople((data ?? []) as TeamMember[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getDisplayItems = (items: TeamMember[]) => {
    const list =
      items.length > 0 ? items : Array.from({ length: 8 }).map(() => undefined);
    // Ensure we have at least 12 items to make the row long enough to span screen
    const repeats = Math.ceil(12 / list.length);
    let display: { keyId: string; person?: TeamMember }[] = [];

    for (let i = 0; i < repeats; i++) {
      list.forEach((item, idx) => {
        display.push({
          keyId: (item as TeamMember)?.id
            ? `${(item as TeamMember).id}-${i}`
            : `empty-${idx}-${i}`,
          person: item as TeamMember,
        });
      });
    }
    return display;
  };

  const displayItems = getDisplayItems(people);
  const duration = `${displayItems.length * 4}s`;

  return (
    <section id="team" className="border-b-2 border-foreground overflow-hidden">
      <style>
        {`
          @keyframes team-scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .team-marquee-container {
            display: flex;
            width: max-content;
          }
          .animate-team-scroll-left {
            animation: team-scroll-left var(--duration, 40s) linear infinite;
          }
          .team-marquee-container:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="px-4 md:px-8 pt-14 pb-4 relative z-10 bg-background overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-editorial-pink/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-4 relative z-10 px-8 md:px-20 max-w-7xl mx-auto">
          {/* Left Line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/30 to-foreground/50"></div>
          
          <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.4em] text-white whitespace-nowrap">
            TEAM
          </h3>

          {/* Right Line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-foreground/30 to-foreground/50"></div>
        </div>
      </div>

      <div className="pb-8 pt-2 flex flex-col bg-secondary/5 relative z-0">
        <div className="w-full relative">
          <div className="overflow-visible w-full relative">
            <div
              className="team-marquee-container animate-team-scroll-left py-6"
              style={{ "--duration": duration } as any}
            >
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16 items-center">
                {displayItems.map((item) => (
                  <div key={`team-1-${item.keyId}`} className="flex-shrink-0">
                    <PersonTile person={item.person} />
                  </div>
                ))}
              </div>
              <div className="flex gap-12 md:gap-16 pr-12 md:pr-16">
                {displayItems.map((item) => (
                  <div key={`team-2-${item.keyId}`} className="flex-shrink-0">
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

export default TeamMembersSection;
