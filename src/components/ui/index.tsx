import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FactStatus } from "@/content/types";
import { getSiteContent } from "@/lib/content";
import { Rich } from "./Rich";

export { Rich, plain } from "./Rich";

type Variant = "primary" | "outline" | "ink" | "taxi" | "violet" | "light";

const variants: Record<Variant, string> = {
  primary: "bg-burgundy text-paper-white border-burgundy hover:bg-burgundy-deep hover:border-burgundy-deep",
  outline: "bg-transparent text-ink border-ink hover:bg-ink hover:text-paper-white",
  ink: "bg-ink text-paper-white border-ink hover:bg-charcoal",
  taxi: "bg-taxi text-ink border-ink hover:bg-ink hover:text-taxi",
  violet: "bg-violet text-paper-white border-violet hover:bg-ink hover:border-ink",
  light: "bg-paper-white text-ink border-paper-white hover:bg-taxi hover:border-taxi",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "sm" = "md") {
  return [
    "group inline-flex items-center justify-center gap-2.5 border-2 font-sans font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
    size === "md" ? "min-h-12 px-5 text-[0.8125rem]" : "min-h-10 px-4 text-xs",
    variants[variant],
  ].join(" ");
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = true,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "sm";
  arrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${buttonClass(variant, size)} ${className}`}>
        {content}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={`${buttonClass(variant, size)} ${className}`}>
      {content}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 label text-ink hover:text-burgundy ${className}`}
    >
      <span className="link-underline">{children}</span>
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/** Small red/burgundy editorial label, like "THE LEAD STORY". */
export function Tag({
  children,
  tone = "burgundy",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "burgundy" | "ink" | "taxi" | "violet" | "best" | "outline";
  className?: string;
}) {
  const tones = {
    burgundy: "bg-burgundy text-paper-white",
    ink: "bg-ink text-paper-white",
    taxi: "bg-taxi text-ink",
    violet: "bg-violet text-paper-white",
    best: "bg-best text-paper-white",
    outline: "border border-ink text-ink",
  };
  return (
    <span className={`inline-block px-2 py-1 kicker text-[0.6875rem] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

const statusTone: Record<FactStatus, string> = {
  confirmed: "bg-ink text-paper-white",
  planned: "border border-ink text-ink",
  proposed: "border border-dashed border-ink text-ink",
  target: "border border-dashed border-burgundy text-burgundy",
  advertised: "bg-taxi text-ink",
  reported: "bg-paper-deep text-ink border border-ink/30",
  unconfirmed: "border border-dashed border-muted text-muted",
};

/** Shows how certain a fact is: confirmed, planned, advertised, reported… */
export async function StatusTag({ status, className = "" }: { status: FactStatus; className?: string }) {
  const { copy } = await getSiteContent();
  return (
    <span className={`inline-block whitespace-nowrap px-1.5 py-0.5 kicker text-[0.625rem] ${statusTone[status] ?? statusTone.unconfirmed} ${className}`}>
      {copy.global.statusLabels[status] ?? status}
    </span>
  );
}

/** Numbered newspaper section header. */
export function SectionHeader({
  number,
  kicker,
  title,
  deck,
  id,
  action,
  as: As = "h2",
  className = "",
}: {
  number?: string;
  kicker: string;
  title: React.ReactNode;
  deck?: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <header className={`rule-double ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-2">
        <p className="kicker text-burgundy">
          {number && <span className="mr-3 text-ink">No. {number}</span>}
          {kicker}
        </p>
        {action}
      </div>
      <As id={id} className="headline mt-5 text-[clamp(2.25rem,6vw,4.5rem)] uppercase">
        {typeof title === "string" ? <Rich text={title} /> : title}
      </As>
      {deck && <p className="prose-news mt-4 max-w-3xl text-lg">{typeof deck === "string" ? <Rich text={deck} /> : deck}</p>}
    </header>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

/** Honest placeholder for information that is not yet confirmed. */
export async function PendingNotice({
  title,
  kicker,
  children,
  className = "",
}: {
  title: string;
  kicker?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const label = kicker ?? (await getSiteContent()).copy.global.statusLabels.unconfirmed;
  return (
    <div className={`border-2 border-dashed border-ink/50 bg-paper-white/60 p-6 ${className}`}>
      <p className="kicker text-burgundy">{label}</p>
      <p className="headline mt-2 text-2xl uppercase md:text-3xl">{title}</p>
      {children && <div className="mt-3 text-charcoal">{children}</div>}
    </div>
  );
}
