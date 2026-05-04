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
                <motion.div
                  className="mt-6 bg-editorial-pink p-5 md:p-6 relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-background/70 mb-1">
                    🏆 TOTAL PRIZE POOL
                  </p>
                  <p className="text-4xl md:text-5xl font-black text-background leading-tight">
                    {c.prize_pool}
                  </p>
                  <p className="text-sm md:text-base font-bold uppercase tracking-wider text-background/90 mt-1">
                    {c.prize_label}
                  </p>
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
