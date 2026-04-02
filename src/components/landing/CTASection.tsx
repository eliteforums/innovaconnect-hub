import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="border-b-2 border-foreground">
      <motion.div
        className="px-4 md:px-8 py-16 md:py-24 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-4">
          LIMITED SEATS • TOP 1% ONLY
        </p>
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
          READY TO
          <br />
          BUILD?
        </h2>
        <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
          10,000 will apply. 100 will be chosen. Don't just watch from the
          sidelines — this is your shot at getting hired, getting funded, and
          getting noticed.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            to="/register"
            className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            APPLY NOW →
          </Link>
          <a
            href="#sponsors"
            className="border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
          >
            PARTNER WITH US
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
