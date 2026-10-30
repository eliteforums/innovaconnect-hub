import type { ArticleBlock } from "@/content/types";
import { Rich } from "@/components/ui";

/** Renders editable rich-text blocks: paragraphs, headings, quotes and lists. */
export function ArticleBody({ blocks, className = "" }: { blocks: ArticleBlock[]; className?: string }) {
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="headline pt-4 text-3xl uppercase text-ink">
                <Rich text={b.text} />
              </h2>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-taxi py-1 pl-5 font-display text-2xl italic text-ink">
                <Rich text={b.text} />
                {b.cite && <cite className="mt-2 block kicker text-xs not-italic text-muted">{b.cite}</cite>}
              </blockquote>
            );
          case "list":
            return (
              <ul key={i} className="space-y-2">
                {(b.items ?? []).map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-2 shrink-0 bg-burgundy" />
                    <span>
                      <Rich text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i}>
                <Rich text={"text" in b ? b.text : ""} />
              </p>
            );
        }
      })}
    </div>
  );
}
