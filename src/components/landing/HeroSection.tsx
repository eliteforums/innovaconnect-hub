import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContent } from "@/contexts/ContentContext";

type KeyFact = { number: string; label: string; highlight?: boolean };

const HeroSection = memo(() => {
  const { getSection } = useContent();
  const c = getSection<{
    chapter: string;
    title_line1: string;
    title_line2: string;
    tagline: string;
    description: string;
    prize_pool: string;
    prize_label: string;
    placement_text: string;
    ticker_text: string;
    key_facts: KeyFact[];
    cta_primary: string;
    cta_secondary: string;
  }>("hero");

  return (
    <section className="relative overflow-hidden border-b-2 border-foreground">
      {/* Main hero */}
      <div className="px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {c.chapter}
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter">
                {c.title_line1}
                <br />
                <span className="text-editorial-pink">{c.title_line2}</span>
              </h1>
              <div className="mt-6 md:mt-8 border-t-2 border-foreground pt-4 max-w-xl">
                <p className="text-lg md:text-xl font-bold uppercase tracking-wide">
                  {c.tagline}
                </p>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  {c.description}
                </p>
                <style>{`
                  .prize-tile {
                    background: linear-gradient(to bottom, hsl(330,90%,55%) 0%, hsl(330,90%,40%) 40%, hsl(330,90%,12%) 80%, hsl(330,90%,5%) 100%);
                    border: 1px solid hsl(330,90%,60%,0.4);
                    box-shadow: 0 0 0 1px hsla(330,90%,60%,0.15), 0 0 24px 0 hsla(330,90%,60%,0.25), inset 0 1px 0 0 rgba(255,255,255,0.15);
                  }
                  @media (min-width: 640px) {
                    .prize-tile {
                      background: linear-gradient(to right, hsl(330,90%,60%) 0%, hsl(330,90%,45%) 35%, hsl(330,90%,15%) 70%, hsl(330,90%,4%) 100%);
                    }
                  }
                `}</style>
                <motion.div
                  className="mt-6 relative overflow-hidden rounded-xl prize-tile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* Subtle top shine */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-center sm:justify-between px-4 sm:px-5 py-5 sm:py-4 relative z-10 gap-4 sm:gap-0">
                    {/* Left: Trophy + Prize Info */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-4xl sm:text-5xl leading-none drop-shadow-lg shrink-0">🏆</span>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase text-black/80 leading-none">
                          TOTAL PRIZE POOL
                        </p>
                        <p className="text-[28px] sm:text-[36px] font-black text-black leading-none tracking-tighter">
                          {c.prize_pool}
                        </p>
                        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-white/90 sm:text-white/80 leading-none">
                          {c.prize_label}
                        </p>
                      </div>
                    </div>

                    {/* Right: Powered By + Unstop */}
                    <div className="flex items-center justify-center w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6 sm:ml-4 shrink-0">
                      <div className="flex flex-col justify-center items-center sm:items-start gap-2">
                        <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase text-white/70 leading-none">
                          POWERED BY
                        </p>
                        {/* Unstop logo: circle + stop */}
                        <div className="flex items-center leading-none">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                            <span
                              className="font-black lowercase leading-none text-[22px] sm:text-[28px]"
                              style={{ color: "hsla(0, 0%, 0%, 1.00)" }}
                            >
                              un
                            </span>
                          </div>
                          <span
                            className="font-black text-white lowercase leading-none text-[22px] sm:text-[28px]"
                            style={{ marginLeft: "2px", letterSpacing: "-0.03em", lineHeight: 1 }}
                          >
                            stop
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="mt-3 border-2 border-editorial-blue px-4 py-3 flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <span className="text-editorial-blue text-lg">🎯</span>
                  <span className="text-sm font-black uppercase tracking-wider text-editorial-blue">
                    {c.placement_text}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a
                href="https://luma.com/iq9zu3qe"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                {c.cta_primary}
              </a>
              <Link
                to="/partner"
                className="border-2 border-foreground px-8 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
              >
                {c.cta_secondary}
              </Link>
            </motion.div>
          </div>

          {/* Right column — editorial info block */}
          <motion.div
            className="md:col-span-4 border-2 border-foreground p-6 flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-3">
                KEY FACTS
              </p>
              <div className="space-y-4">
                {(c.key_facts ?? []).map((item) => (
                  <div
                    key={item.label}
                    className={`border-b pb-2 ${
                      item.highlight
                        ? "border-editorial-pink bg-editorial-pink/10 -mx-2 px-2 py-2 rounded"
                        : "border-border"
                    }`}
                  >
                    <p
                      className={`text-2xl md:text-3xl font-black ${
                        item.highlight ? "text-editorial-pink" : ""
                      }`}
                    >
                      {item.number}
                    </p>
                    <p
                      className={`text-xs tracking-widest ${
                        item.highlight
                          ? "text-editorial-pink/80 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6 tracking-wide uppercase">
              Organized by Elite Forums
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="border-t-2 border-foreground bg-editorial-pink overflow-hidden py-2">
        <div className="animate-marquee whitespace-nowrap flex">
          {/* Only 2 copies needed for seamless CSS marquee loop */}
          {[0, 1].map((i) => (
            <span
              key={i}
              className="text-sm font-black tracking-widest uppercase mx-4 text-background"
            >
              {c.ticker_text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
});
HeroSection.displayName = "HeroSection";

export default HeroSection;
