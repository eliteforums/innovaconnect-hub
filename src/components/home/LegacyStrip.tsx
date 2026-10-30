import Link from "next/link";
import { ArrowRight, Clock3, Gift, Trophy, Users } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { Container, StatusTag } from "@/components/ui";

const icons = [Users, Trophy, Gift, Clock3];

export async function LegacyStrip() {
  const { chapter1, copy } = await getSiteContent();
  const l = copy.home.legacy;
  return (
    <section aria-labelledby="legacy-title" className="mt-12">
      <Container>
        <div className="rule-double">
          <div className="grid border-b-2 border-ink sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]">
            <div className="flex flex-col items-start gap-4 border-b border-ink py-5 pr-6 sm:col-span-2 lg:col-span-4 xl:col-span-1 xl:border-b-0 xl:border-r">
              <div>
                <p className="kicker text-burgundy">{chapter1.label}</p>
                <h2 id="legacy-title" className="headline mt-2 text-[clamp(1.75rem,3vw,2.25rem)] uppercase">
                  {l.title}
                </h2>
              </div>
              <Link
                href="/chapter-1"
                className="group inline-flex min-h-11 items-center gap-2 border-2 border-burgundy px-4 label text-[0.75rem] text-burgundy transition-colors hover:bg-burgundy hover:text-paper-white"
              >
                {l.cta}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="contents">
              {chapter1.metrics.map((m, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <li
                    key={m.label}
                    className="border-b border-ink py-5 sm:odd:pr-4 sm:even:pl-4 lg:border-b-0 lg:px-5 lg:odd:pr-5 lg:even:pl-5 lg:[&:not(:last-child)]:border-r lg:first:pl-0 xl:first:pl-5"
                  >
                    <Icon aria-hidden className="size-6 text-burgundy" strokeWidth={1.75} />
                    <p className="headline mt-2 whitespace-nowrap text-[clamp(2rem,2.6vw,2.6rem)] font-black text-burgundy">
                      {m.value}
                    </p>
                    <p className="mt-1 label text-[0.6875rem]">{m.label}</p>
                    <p className="mt-1.5 text-[0.8125rem] leading-snug text-charcoal">{m.caption}</p>
                    <StatusTag status={m.status} className="mt-2" />
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="mt-2 text-xs text-muted">{l.note}</p>
        </div>
      </Container>
    </section>
  );
}
