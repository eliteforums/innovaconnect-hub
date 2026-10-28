import Link from "next/link";
import { event } from "@/content/event";
import { collaborationOptions } from "@/components/home/Sections";
import { PartnerInquiryForm } from "@/components/forms/PartnerInquiryForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, PendingNotice, SectionHeader } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/partners",
  "Partners — Real Problems. Real Builders.",
  "Partner with InnovaHack Chapter 2: set a challenge, provide tools, mentor teams and reach builders across India.",
);

export default function PartnersPage() {
  const partners = event.partners.filter((p) => p.verified);
  const email = event.contact.partnerships.value;
  return (
    <>
      <PageHeader
        section="Partners & industry"
        crumbs={[{ label: "Partners", href: "/partners" }]}
        title={
          <>
            Real problems. <span className="text-burgundy">Real builders.</span>
          </>
        }
        deck="InnovaHack works with organizations that bring real challenges, tools and expertise to India's builders."
      />
      <Container className="mt-14">
        <section aria-labelledby="confirmed-title">
          <SectionHeader number="01" kicker="Chapter 2 partners" id="confirmed-title" title="Confirmed partners" />
          {partners.length ? (
            <ul className="mt-8 grid grid-cols-2 gap-px border border-ink bg-ink md:grid-cols-4">
              {partners.map((p) => (
                <li key={p.name} className="bg-paper-white p-6">
                  <p className="kicker text-burgundy">{p.category}</p>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="headline mt-2 block text-2xl hover:text-burgundy">
                      {p.name}
                    </a>
                  ) : (
                    <p className="headline mt-2 text-2xl">{p.name}</p>
                  )}
                  {p.challenge && <p className="mt-2 text-sm text-charcoal">{p.challenge}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <PendingNotice title="Chapter 2 partners will be announced here." className="mt-8 max-w-3xl">
              <p>
                No Chapter 2 partners have been announced yet. Partners from the first edition are part of the{" "}
                <Link href="/chapter-1" className="underline underline-offset-2">
                  Chapter 1 archive
                </Link>{" "}
                and are not assumed to be part of this edition.
              </p>
            </PendingNotice>
          )}
        </section>

        <section aria-labelledby="ways-title" className="mt-20">
          <SectionHeader number="02" kicker="Ways to collaborate" id="ways-title" title="Shape the edition" deck="Partnership options are discussed individually with each organization." />
          <ul className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {collaborationOptions.map((o, i) => (
              <li key={o.title} className="bg-paper-white p-6">
                <p className="kicker text-burgundy">Option {String(i + 1).padStart(2, "0")}</p>
                <h3 className="headline mt-2 text-2xl">{o.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-charcoal">{o.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="inquiry-title" id="inquiry" className="mt-20 scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <SectionHeader number="03" kicker="Partnership inquiry" id="inquiry-title" title="Partner with InnovaHack" />
              <p className="prose-news mt-6">
                Tell us about your organization and what you&rsquo;d like to bring to Chapter 2. Inquiries are private
                and are only seen by the organizing team.
              </p>
              {email && (
                <p className="mt-4 text-charcoal">
                  Prefer email?{" "}
                  <a href={`mailto:${email}`} className="font-semibold text-burgundy underline underline-offset-4">
                    {email}
                  </a>
                </p>
              )}
            </div>
            <div className="border-2 border-ink bg-paper-white p-5 sm:p-8">
              <PartnerInquiryForm />
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
