import { getSiteContent } from "@/lib/content";
import { PartnerInquiryForm } from "@/components/forms/PartnerInquiryForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContentImage } from "@/components/media/ContentImage";
import { Container, PendingNotice, Rich, SectionHeader, StatusTag } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/partners", copy.partners.seo.title, copy.partners.seo.description);
}

export default async function PartnersPage() {
  const c = await getSiteContent();
  const x = c.copy.partners;
  const partners = c.event.partners.filter((p) => p.verified);
  const email = c.event.contact.partnerships.value;
  const options = c.copy.home.partners;
  return (
    <>
      <PageHeader section={x.section} crumbs={[{ label: x.section, href: "/partners" }]} title={x.title} deck={x.deck} />
      <Container className="mt-14">
        <section aria-labelledby="confirmed-title">
          <SectionHeader number="01" kicker={x.confirmedKicker} id="confirmed-title" title={x.confirmedTitle} />
          {partners.length ? (
            <ul className="mt-8 grid grid-cols-2 gap-px border border-ink bg-ink md:grid-cols-4">
              {partners.map((p) => (
                <li key={p.name} className="bg-paper-white p-6">
                  {p.logo && (
                    <ContentImage src={p.logo} alt={`${p.name} logo`} className="mb-4 h-12 w-auto object-contain" />
                  )}
                  <p className="kicker text-burgundy">{p.category}</p>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="headline mt-2 block text-2xl hover:text-burgundy">
                      {p.name}
                    </a>
                  ) : (
                    <p className="headline mt-2 text-2xl">{p.name}</p>
                  )}
                  {p.challenge && (
                    <p className="mt-2 text-sm text-charcoal">
                      <Rich text={p.challenge} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <PendingNotice title={x.pendingTitle} className="mt-8 max-w-3xl">
              <p>
                <Rich text={x.pendingBody} />
              </p>
            </PendingNotice>
          )}
        </section>

        <section aria-labelledby="ways-title" className="mt-20">
          <SectionHeader number="02" kicker={x.waysKicker} id="ways-title" title={x.waysTitle} deck={x.waysDeck} />
          <ul className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {options.options.map((o, i) => (
              <li key={`${o.title}-${i}`} className="bg-paper-white p-6">
                <p className="kicker text-burgundy">
                  {options.optionLabel} {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="headline mt-2 text-2xl">{o.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-charcoal">
                  <Rich text={o.body} />
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-2 border-ink bg-paper-white p-6">
            <StatusTag status="planned" />
            <h3 className="headline mt-3 text-2xl">{x.hiringTitle}</h3>
            <p className="mt-2 max-w-3xl text-[0.9375rem] text-charcoal">
              <Rich text={x.hiringBody} />
            </p>
          </div>
        </section>

        <section aria-labelledby="inquiry-title" id="inquiry" className="mt-20 scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <SectionHeader number="03" kicker={x.inquiryKicker} id="inquiry-title" title={x.inquiryTitle} />
              <p className="prose-news mt-6">
                <Rich text={x.inquiryBody} />
              </p>
              {email && (
                <p className="mt-4 text-charcoal">
                  {x.emailPrompt}{" "}
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
