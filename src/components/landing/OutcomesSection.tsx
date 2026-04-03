import { motion } from "framer-motion";

const outcomes = [
  {
    title: "₹3 LAKHS PRIZE POOL",
    desc: "Compete for a massive prize pool of ₹3 Lakhs including cash prizes and exciting goodies for top performers and winners.",
    accent: "border-editorial-pink",
  },
  {
    title: "ASSURED PLACEMENT ASSISTANCE",
    desc: "Top 1% selected finalists receive assured placement assistance with direct exposure to hiring companies actively looking for elite engineering talent.",
    accent: "border-editorial-blue",
  },
  {
    title: "STARTUP INCUBATION",
    desc: "Present your prototype to incubators and accelerators. Get considered for pre-seed funding and mentorship programs.",
    accent: "border-editorial-purple",
  },
  {
    title: "INVESTOR ACCESS",
    desc: "Pitch to angel investors and VCs during Demo Day. Get introductions that could change your startup journey.",
    accent: "border-editorial-green",
  },
];

const OutcomesSection = () => {
  return (
    <section className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
          SECTION 04
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          WHAT YOU GET
        </h2>
      </div>

      {/* Prize Pool Highlight Banner */}
      <motion.div
        className="bg-editorial-pink p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-background/70 mb-2">
              🏆 TOTAL PRIZE POOL
            </p>
            <p className="text-5xl md:text-7xl font-black text-background leading-none">
              ₹3 LAKHS<span className="text-background/70">+</span>
            </p>
            <p className="text-base md:text-lg font-bold uppercase tracking-wider text-background/90 mt-2">
              Including Cash Prizes, Goodies, Swag Kits & More
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["💰 Cash Prizes", "🎁 Goodies", "👕 Swag Kits", "🏅 Certificates"].map((tag) => (
              <span
                key={tag}
                className="bg-background/20 backdrop-blur-sm px-4 py-2 text-xs font-black uppercase tracking-wider text-background border border-background/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {outcomes.slice(1).map((item, i) => (
          <motion.div
            key={item.title}
            className={`border-b border-r border-border p-8 md:p-12 border-l-4 ${item.accent}`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OutcomesSection;
