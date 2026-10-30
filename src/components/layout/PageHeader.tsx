import Link from "next/link";
import { siteUrl } from "@/content/event";
import { getSiteContent } from "@/lib/content";
import { Container, Rich } from "@/components/ui";

/** Inner-page masthead: section label, oversized headline and a deck. */
export async function PageHeader({
  section,
  title,
  deck,
  crumbs = [],
  aside,
  accent = "burgundy",
}: {
  section: string;
  /** A string is rendered with <Rich> markup; pass a node for custom markup. */
  title: React.ReactNode;
  deck?: React.ReactNode;
  crumbs?: { label: string; href: string }[];
  aside?: React.ReactNode;
  accent?: "burgundy" | "violet";
}) {
  const c = await getSiteContent();
  const breadcrumbItems = [
    { label: c.copy.global.breadcrumbHome, href: "/" },
    ...crumbs,
  ];
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, siteUrl).toString(),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c") }}
      />
      <Container className="pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb" className="kicker text-[0.6875rem] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-burgundy">
                {c.copy.global.breadcrumbHome}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link href={c.href} className="hover:text-burgundy">
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-4 rule-double">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink pb-2">
            <p className={`kicker ${accent === "violet" ? "text-violet" : "text-burgundy"}`}>{section}</p>
            <p className="kicker text-[0.6875rem] text-muted">{c.copy.global.pageHeaderEdition}</p>
          </div>
          <div className={`grid gap-8 ${aside ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end" : ""}`}>
            <div className="min-w-0">
              <h1 className="reveal headline mt-6 text-[clamp(2rem,9.6vw,6.5rem)] font-black uppercase sm:text-[clamp(2.75rem,8vw,6.5rem)]">
                {typeof title === "string" ? <Rich text={title} /> : title}
              </h1>
              {deck && (
                <div className="reveal reveal-2 prose-news mt-5 max-w-3xl text-lg md:text-xl">
                  {typeof deck === "string" ? <Rich text={deck} /> : deck}
                </div>
              )}
            </div>
            {aside && <div className="reveal reveal-3 min-w-0">{aside}</div>}
          </div>
        </div>
      </Container>
    </>
  );
}
