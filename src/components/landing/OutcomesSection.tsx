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

      <div className="grid grid-cols-1 md:grid-cols-2">
        {outcomes.map((item, i) => (
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
