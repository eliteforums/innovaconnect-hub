import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
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
                CHAPTER 01 — 2025
              </p>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter">
                INNOVA
                <br />
                <span className="text-editorial-pink">HACK</span>
              </h1>
              <div className="mt-6 md:mt-8 border-t-2 border-foreground pt-4 max-w-xl">
                <p className="text-lg md:text-xl font-bold uppercase tracking-wide">
                  India's Largest Hiring & Startup Hackathon
                </p>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Hack. Get Hired. Get Funded. — A 30-hour elite hackathon where the
                  top 1% of India's builders meet hiring companies, investors, and
                  incubators.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/register"
                className="bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                REGISTER NOW →
              </Link>
              <Link
                to="/partner"
                className="border-2 border-foreground px-8 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
              >
                PARTNER WITH US
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
                {[
                  { number: "10,000+", label: "APPLICANTS" },
                  { number: "TOP 1%", label: "SELECTED" },
                  { number: "30 HRS", label: "OF HACKING" },
                  { number: "₹100", label: "REGISTRATION FEE" },
                  { number: "MUMBAI", label: "LOCATION" },
                  { number: "HYBRID", label: "IN-PERSON + ONLINE" },
                ].map((item) => (
                  <div key={item.label} className="border-b border-border pb-2">
                    <p className="text-2xl md:text-3xl font-black">{item.number}</p>
                    <p className="text-xs tracking-widest text-muted-foreground">{item.label}</p>
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
          {Array(4)
            .fill(
              "GENERATIVE AI • FINTECH • HEALTHTECH • BLOCKCHAIN • STARTUP TRACK • HACK. GET HIRED. GET FUNDED. • "
            )
            .map((text, i) => (
              <span key={i} className="text-sm font-black tracking-widest uppercase mx-4 text-background">
                {text}
              </span>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
