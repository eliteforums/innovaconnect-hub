import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { Auto } from "@/components/illustrations";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ButtonLink, Container, Rich } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist on the InnovaHack Chapter 2 website.",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const { copy } = await getSiteContent();
  const x = copy.global.notFound;
  return (
    <SiteChrome>
      <Container className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl rule-double text-center">
          <p className="kicker text-burgundy">{x.kicker}</p>
          <h1 className="headline mt-6 text-[clamp(3rem,9vw,6.5rem)] font-black uppercase">
            <Rich text={x.title} />
          </h1>
          <p className="prose-news mx-auto mt-5 max-w-xl text-lg">
            <Rich text={x.body} />
          </p>
          <Auto className="mx-auto mt-8 w-56" />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">{x.primary}</ButtonLink>
            <ButtonLink href="/tracks" variant="outline">
              {x.secondary}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </SiteChrome>
  );
}
