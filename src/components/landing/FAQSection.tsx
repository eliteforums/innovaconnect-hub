import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/contexts/ContentContext";

type FAQ = {
  q: string;
  a: string;
};

const FAQSection = () => {
  const { getSection } = useContent();
  const c = getSection<{ faqs: FAQ[] }>("faq");
  const faqs = c.faqs ?? [];

  return (
    <section id="faq" className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
          SECTION 07
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          FAQ
        </h2>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="text-left text-sm font-bold uppercase tracking-wide hover:no-underline hover:text-editorial-blue">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
