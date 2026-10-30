import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { event, siteUrl } from "@/content/event";
import { articleBySlug, articles } from "@/content/updates";
import { Figure } from "@/components/media/Figure";
import { ArticleCard, ArticleMeta } from "@/components/updates/ArticleCard";
import { Container } from "@/components/ui";

// Every slug is prerendered by generateStaticParams and unknown slugs are
// answered with a 404 by src/proxy.ts, so param access here never blocks a
// navigation in practice.
export const instant = false;

export function generateStaticParams() {
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/updates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return { title: "Update not found" };
  const path = `/updates/${article.slug}`;
  const socialTitle = `${article.headline} | InnovaHack`;
  const socialImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation",
  };
  return {
    title: article.headline,
    description: article.summary,
    alternates: { canonical: path },
    robots: article.draft || !article.publishedOn ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      siteName: "InnovaHack Chapter 2",
      title: socialTitle,
      description: article.summary,
      url: path,
      locale: "en_IN",
      images: [socialImage],
      publishedTime: article.publishedOn ?? undefined,
      authors: article.author ? [article.author] : undefined,
      section: article.category,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: article.summary,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/updates/[slug]">) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  const jsonLd = article.draft || !article.publishedOn
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.headline,
        description: article.summary,
        datePublished: article.publishedOn,
        image: [
          article.media.photo?.approved
            ? `${siteUrl}${article.media.photo.src.src}`
            : `${siteUrl}/opengraph-image`,
        ],
        author: article.author ? { "@type": "Organization", name: article.author } : undefined,
        publisher: { "@type": "Organization", name: event.organizer },
        mainEntityOfPage: `${siteUrl}/updates/${article.slug}`,
      };

  return (
    <article>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <Container className="pt-8 lg:pt-12">
        <Link href="/updates" className="inline-flex items-center gap-2 kicker text-[0.6875rem] text-muted hover:text-burgundy">
          <ArrowLeft aria-hidden className="size-4" /> The Build Log
        </Link>
        <div className="mx-auto mt-6 max-w-3xl rule-double">
          <div className="border-b border-ink pb-3">
            <ArticleMeta article={article} />
          </div>
          <h1 className="reveal headline mt-6 text-[clamp(2.5rem,7vw,5rem)] font-black">{article.headline}</h1>
          <p className="reveal reveal-2 mt-5 font-display text-2xl italic leading-snug text-charcoal">{article.summary}</p>
        </div>
        <Figure media={article.media} aspect="aspect-[21/9]" className="mx-auto mt-10 max-w-5xl" priority sizes="(min-width: 1024px) 1024px, 100vw" />
        <div className="prose-news mx-auto mt-10 max-w-3xl space-y-5 text-lg">
          {article.body.map((b, i) => {
            switch (b.type) {
              case "h2":
                return (
                  <h2 key={i} className="headline pt-4 text-3xl uppercase text-ink">
                    {b.text}
                  </h2>
                );
              case "quote":
                return (
                  <blockquote key={i} className="border-l-4 border-taxi py-1 pl-5 font-display text-2xl italic text-ink">
                    {b.text}
                    {b.cite && <cite className="mt-2 block kicker text-xs not-italic text-muted">{b.cite}</cite>}
                  </blockquote>
                );
              case "list":
                return (
                  <ul key={i} className="space-y-2">
                    {b.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-2 shrink-0 bg-burgundy" />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              default:
                return <p key={i}>{b.text}</p>;
            }
          })}
        </div>
      </Container>

      {more.length > 0 && (
        <Container className="mt-20">
          <p className="rule-double kicker text-burgundy">More from the Build Log</p>
          <ul className="mt-6 grid gap-8 md:grid-cols-2">
            {more.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} variant="compact" />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </article>
  );
}
