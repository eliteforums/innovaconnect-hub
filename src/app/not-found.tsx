import { Auto } from "@/components/illustrations";
import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl rule-double text-center">
        <p className="kicker text-burgundy">Error 404 · Wrong stop</p>
        <h1 className="headline mt-6 text-[clamp(3rem,9vw,6.5rem)] font-black uppercase">This route doesn&rsquo;t run here.</h1>
        <p className="prose-news mx-auto mt-5 max-w-xl text-lg">
          The page you were looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back on the line.
        </p>
        <Auto className="mx-auto mt-8 w-56" />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Front page</ButtonLink>
          <ButtonLink href="/tracks" variant="outline">
            The tracks
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
