import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can participate in InnovaHack?",
    a: "Any student, working professional, or independent builder from India can apply. We welcome participants from all backgrounds — engineering, design, product, business.",
  },
  {
    q: "What is the team structure?",
    a: "You can participate solo, duo, trio, or quad (max 4 members). You can form your own team or opt for random team allocation during the hackathon.",
  },
  {
    q: "How does the selection process work?",
    a: "We review every application based on skills, experience, and potential. Only the top 1% (approximately 80–100 participants) are shortlisted for the final 30-hour hackathon.",
  },
  {
    q: "What is the ₹100 registration fee?",
    a: "The ₹100 is a non-refundable registration fee. It helps us filter serious applicants and ensures every participant in the final hackathon is genuinely committed to building something meaningful.",
  },
  {
    q: "What happens after the hackathon?",
    a: "Selected participants get exposure to hiring companies for fast-track interview opportunities, introductions to investors, and consideration for startup incubation programs.",
  },
  {
    q: "Do I need to have a startup idea?",
    a: "No. You can participate in any of the 5 domain tracks. The Startup Track is just one option — you can build solutions in Gen AI, FinTech, HealthTech, or Blockchain as well.",
  },
  {
    q: "Is food and accommodation provided?",
    a: "Details about venue, food, and accommodation will be shared with shortlisted participants. The hackathon is designed to be a premium, well-organized experience.",
  },
  {
    q: "Can I participate remotely?",
    a: "InnovaHack Chapter 1 is an in-person hackathon. We believe the best collaborations happen face-to-face. Location details will be announced soon.",
  },
];

const FAQSection = () => {
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
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
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