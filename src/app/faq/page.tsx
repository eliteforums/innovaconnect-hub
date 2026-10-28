import { Plus } from "lucide-react";
import { faq } from "@/content/faq";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, Container } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/faq",
  "Frequently Asked Questions",
  "Answers about InnovaHack Chapter 2: the two official domains, participation, prizes, partners and registration.",
);

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHeader
        section="FAQ"
        crumbs={[{ label: "FAQ", href: "/faq" }]}
        title="Questions, answered."
        deck="Everything we can confirm today about InnovaHack Chapter 2. Where something hasn't been decided yet, we say so."
      />
      <Container className="mt-14">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <ul className="sticky top-24 space-y-2">
              {faq.map((g) => (
                <li key={g.title}>
                  <a href={`#${slug(g.title)}`} className="label text-[0.75rem] hover:text-burgundy">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14">
            {faq.map((g) => (
              <section key={g.title} aria-labelledby={slug(g.title)}>
                <h2 id={slug(g.title)} className="rule-double headline scroll-mt-24 text-3xl uppercase">
                  {g.title}
                </h2>
                <div className="mt-2 divide-y divide-ink border-b border-ink">
                  {g.items.map((item) => (
                    <details key={item.q} className="group py-1">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-display text-xl hover:text-burgundy">
                        {item.q}
                        <Plus aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="prose-news max-w-3xl pb-5">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
            <div className="flex flex-col items-start gap-4 border-2 border-ink bg-paper-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="headline text-2xl">Still have a question?</p>
              <ButtonLink href="/contact">Contact the organizers</ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
