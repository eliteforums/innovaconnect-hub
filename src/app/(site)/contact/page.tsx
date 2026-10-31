import { getSiteContent } from "@/lib/content";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Rich } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/contact", copy.contact.seo.title, copy.contact.seo.description);
}

const linkClass = "text-burgundy underline underline-offset-4";

export default async function ContactPage() {
  const c = await getSiteContent();
  const x = c.copy.contact;
  const general = c.event.contact.general.value;
  const partners = c.event.contact.partnerships.value;
  return (
    <>
      <PageHeader section={x.section} crumbs={[{ label: x.section, href: "/contact" }]} title={x.title} deck={x.deck} />
      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <aside className="space-y-6">
            <Block title={x.generalTitle}>
              {general ? (
                <a href={`mailto:${general}`} className={linkClass}>
                  {general}
                </a>
              ) : (
                <p>
                  <Rich text={x.generalFallback} linkClass={linkClass} />
                </p>
              )}
            </Block>
            <Block title={x.partnershipsTitle}>
              <p>
                <Rich text={x.partnershipsBody} linkClass={linkClass} />
                {partners && (
                  <>
                    {" "}
                    {x.partnershipsEmail}{" "}
                    <a href={`mailto:${partners}`} className={linkClass}>
                      {partners}
                    </a>
                  </>
                )}
                .
              </p>
            </Block>
            <Block title={x.beforeTitle}>
              <p>
                <Rich text={x.beforeBody} linkClass="underline underline-offset-4" />
              </p>
            </Block>
            {c.event.social.length > 0 && (
              <Block title={x.followTitle}>
                <ul className="flex flex-wrap gap-3">
                  {c.event.social.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </aside>
          <div className="border-2 border-ink bg-paper-white p-5 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-ink pt-4">
      <p className="kicker text-burgundy">{title}</p>
      <div className="mt-2 text-charcoal">{children}</div>
    </div>
  );
}
