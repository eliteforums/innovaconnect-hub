import { motion } from "framer-motion";
import { useContent } from "@/contexts/ContentContext";

type Step = {
  num: string;
  title: string;
  desc: string;
};

const ProcessSection = () => {
  const { getSection } = useContent();
  const c = getSection<{ steps: Step[] }>("process");
  const steps = c.steps ?? [];

  return (
    <section className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
          SECTION 03
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          THE PROCESS
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className="border-b md:border-b-0 md:border-r border-border p-6 md:p-8 last:border-r-0 last:border-b-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <span className="text-5xl md:text-6xl font-black text-muted-foreground/20">
              {step.num}
            </span>
            <h3 className="text-lg font-black uppercase tracking-wide mt-2 mb-3">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.desc}
            </p>
            {i < steps.length - 1 && (
              <div className="mt-4 text-editorial-pink font-black text-lg">
                →
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ProcessSection;
