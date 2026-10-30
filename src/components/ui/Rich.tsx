import Link from "next/link";
import { Fragment } from "react";

/**
 * Renders editable copy with a tiny markup:
 *   *text*         accent colour
 *   [text](href)   link (internal paths use next/link)
 *   new line       line break
 */
export function Rich({
  text,
  accent = "text-burgundy",
  linkClass = "underline underline-offset-2 hover:text-burgundy",
}: {
  text: string | null | undefined;
  accent?: string;
  linkClass?: string;
}) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {inline(line, accent, linkClass)}
        </Fragment>
      ))}
    </>
  );
}

const TOKEN = /\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function inline(line: string, accent: string, linkClass: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of line.matchAll(TOKEN)) {
    if (m.index! > last) out.push(line.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <span key={key++} className={accent}>
          {m[1]}
        </span>,
      );
    } else {
      const href = m[3];
      const safe = /^(\/|#|https?:\/\/|mailto:)/.test(href) ? href : "#";
      out.push(
        safe.startsWith("/") || safe.startsWith("#") ? (
          <Link key={key++} href={safe} className={linkClass}>
            {m[2]}
          </Link>
        ) : (
          <a key={key++} href={safe} className={linkClass} target="_blank" rel="noopener noreferrer">
            {m[2]}
          </a>
        ),
      );
    }
    last = m.index! + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** Plain-text version (markup stripped), for metadata and alt text. */
export function plain(text: string | null | undefined) {
  if (!text) return "";
  return text
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n/g, " ");
}
