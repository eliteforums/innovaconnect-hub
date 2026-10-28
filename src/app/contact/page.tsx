import Link from "next/link";
import { event } from "@/content/event";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/contact",
  "Contact",
  "Contact the InnovaHack Chapter 2 organizers for general questions and partnership inquiries.",
);

export default function ContactPage() {
  const general = event.contact.general.value;
  const partners = event.contact.partnerships.value;
  return (
    <>
      <PageHeader
        section="Contact"
        crumbs={[{ label: "Contact", href: "/contact" }]}
        title="Get in touch."
        deck="Questions about InnovaHack Chapter 2? Send a message and the organizing team will reply by email."
      />
      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <aside className="space-y-6">
            <Block title="General inquiries">
              {general ? (
                <a href={`mailto:${general}`} className="text-burgundy underline underline-offset-4">
                  {general}
                </a>
              ) : (
                <p>Use the form on this page.</p>
              )}
            </Block>
            <Block title="Partnerships & sponsorship">
              <p>
                Use the{" "}
                <Link href="/partners#inquiry" className="text-burgundy underline underline-offset-4">
                  partnership inquiry form
                </Link>
                {partners && (
                  <>
                    {" "}or write to{" "}
                    <a href={`mailto:${partners}`} className="text-burgundy underline underline-offset-4">
                      {partners}
                    </a>
                  </>
                )}
                .
              </p>
            </Block>
            <Block title="Before you write">
              <p>
                Many answers are in the <Link href="/faq" className="underline underline-offset-4">FAQ</Link>. Dates, venue
                and prizes have not been announced yet — they will appear on the site as soon as they are confirmed.
              </p>
            </Block>
            {event.social.length > 0 && (
              <Block title="Follow">
                <ul className="flex flex-wrap gap-3">
                  {event.social.map((s) => (
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
