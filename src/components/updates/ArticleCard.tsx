import Link from "next/link";
import type { Article } from "@/content/types";
import { Figure } from "@/components/media/Figure";
import { Tag } from "@/components/ui";
import { formatDate } from "@/lib/site";

export function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="flex flex-wrap items-center gap-2 kicker text-[0.6875rem] text-muted">
      <Tag tone={article.draft ? "outline" : "burgundy"}>{article.category}</Tag>
      {article.draft ? (
        <span className="bg-taxi px-1.5 py-0.5 text-ink">Draft · pending approval</span>
      ) : (
        <time dateTime={article.publishedOn ?? undefined}>{formatDate(article.publishedOn)}</time>
      )}
      {article.author && <span>By {article.author}</span>}
    </p>
  );
}

export function ArticleCard({
  article,
  variant = "standard",
}: {
  article: Article;
  variant?: "lead" | "standard" | "compact";
}) {
  const href = `/updates/${article.slug}`;
  if (variant === "compact") {
    return (
      <article className="group grid grid-cols-[1fr_120px] gap-4 sm:grid-cols-[1fr_160px]">
        <div>
          <ArticleMeta article={article} />
          <h3 className="headline mt-2 text-2xl group-hover:text-burgundy">
            <Link href={href} className="after:absolute after:inset-0 relative">
              {article.headline}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-charcoal">{article.summary}</p>
        </div>
        <Figure media={article.media} aspect="aspect-square" showCredit={false} sizes="160px" />
      </article>
    );
  }
  return (
    <article className="group relative">
      <Figure
        media={article.media}
        aspect={variant === "lead" ? "aspect-[16/9]" : "aspect-[4/3]"}
        showCredit={false}
      />
      <div className="mt-4">
        <ArticleMeta article={article} />
        <h3
          className={`headline mt-3 group-hover:text-burgundy ${variant === "lead" ? "text-[clamp(2rem,4vw,3.25rem)]" : "text-2xl"}`}
        >
          <Link href={href} className="after:absolute after:inset-0">
            {article.headline}
          </Link>
        </h3>
        <p className={`mt-3 text-charcoal ${variant === "lead" ? "prose-news" : "text-sm"}`}>{article.summary}</p>
      </div>
    </article>
  );
}
