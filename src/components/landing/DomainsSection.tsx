import { motion } from "framer-motion";
import { useContent } from "@/contexts/ContentContext";

type Domain = {
  name: string;
  description: string;
  tag: string;
  color: string;
  accent: string;
};

const DomainsSection = () => {
  const { getSection } = useContent();
  const c = getSection<{ domains: Domain[] }>("domains");
  const domains = c.domains ?? [];

  return (
    <section id="domains" className="border-b-2 border-foreground">
      {/* Section header */}
      <div className="border-b border-border px-4 md:px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SECTION 02
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              DOMAINS
            </h2>
          </div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground hidden md:block">
            {domains.length} TRACKS • CHOOSE YOUR ARENA
          </p>
        </div>
      </div>

      {/* Domain tags row */}
      <div className="border-b border-border px-4 md:px-8 py-3 flex flex-wrap gap-2">
        {domains.map((d) => (
          <span
            key={d.tag}
            className={`border-2 ${d.color} px-3 py-1 text-xs font-bold tracking-widest uppercase`}
          >
            {d.tag}
          </span>
        ))}
      </div>

      {/* Domain cards — editorial grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain, i) => (
          <motion.div
            key={domain.name}
            className="border-b border-r border-border p-6 md:p-8 hover:bg-secondary/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div
              className={`w-8 h-1 mb-4 ${domain.color.replace("border-", "bg-")}`}
            />
            <p
              className={`text-xs font-bold tracking-[0.3em] uppercase mb-2 ${domain.accent}`}
            >
              {domain.tag}
            </p>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">
              {domain.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {domain.description}
            </p>
          </motion.div>
        ))}
        {/* Filler cell for grid balance */}
        <div className="hidden lg:flex border-b border-r border-border p-8 items-center justify-center">
          <p className="text-4xl font-black text-muted-foreground/20 uppercase tracking-tighter">
            WHICH
            <br />
            TRACK
            <br />
            IS
            <br />
            YOURS?
          </p>
        </div>
      </div>
    </section>
  );
};

export default DomainsSection;
