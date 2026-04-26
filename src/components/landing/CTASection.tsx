import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContent } from "@/contexts/ContentContext";

const isExternalUrl = (url: string) =>
  /^(https?:|mailto:|tel:)/i.test(url.trim());

const CTASection = () => {
  const { getSection } = useContent();
  const c = getSection<{
    eyebrow: string;
    headline_line1: string;
    headline_line2: string;
    description: string;
    cta_primary: string;
    cta_primary_url?: string;
    cta_secondary: string;
    cta_secondary_url?: string;
  }>("cta");

  const primaryUrl = (c.cta_primary_url || "/register").trim();
  const secondaryUrl = (c.cta_secondary_url || "/partner").trim();

  const primaryClasses =
    "bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity";
  const secondaryClasses =
    "border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all";

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
          {c.eyebrow}
        </p>
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
          {c.headline_line1}
          <br />
          <span className="text-editorial-pink">{c.headline_line2}</span>
        </h2>
        <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
          {c.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {isExternalUrl(primaryUrl) ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={primaryClasses}
            >
              {c.cta_primary}
            </a>
          ) : (
            <Link to={primaryUrl} className={primaryClasses}>
              {c.cta_primary}
            </Link>
          )}
          {isExternalUrl(secondaryUrl) ? (
            <a
              href={secondaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryClasses}
            >
              {c.cta_secondary}
            </a>
          ) : (
            <Link to={secondaryUrl} className={secondaryClasses}>
              {c.cta_secondary}
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
