import { domains } from "@/content/domains";
import { DomainPanels } from "@/components/home/DomainPanels";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, SectionHeader } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/tracks",
  "AI & Startup Hackathon Tracks 2027",
  "Explore the two InnovaHack Chapter 2 domains: Artificial Intelligence and Open Innovation / Startup. Both are planned for the 2027 pan-India hybrid hackathon.",
);

const rows: { label: string; values: [string, string] }[] = [
  { label: "Core of the innovation", values: ["The AI itself — a model, agent or learning system", "The product, service or business concept"] },
  { label: "Use of AI", values: ["Required — AI is the heart of the solution", "Permitted, never compulsory"] },
  { label: "Typical output", values: ["An intelligent system applied to a real problem", "An original product, platform or startup MVP"] },
  { label: "Challenge themes", values: [domains[0].challengeThemes.slice(0, 4).join(", ") + "…", domains[1].challengeThemes.slice(0, 4).join(", ") + "…"] },
];

export default function TracksPage() {
  return (
    <>
      <PageHeader
        section="The Tracks"
        crumbs={[{ label: "The Tracks", href: "/tracks" }]}
        title={
          <>
            Two domains. <span className="text-burgundy">One national stage.</span>
          </>
        }
        deck="Every team enters one of exactly two official competition domains. AI may be used in both — the difference is what sits at the core of your innovation."
      />
      <Container className="mt-12">
        <DomainPanels headingLevel="h2" />

        <section aria-labelledby="compare-title" className="mt-20">
          <SectionHeader number="03" kicker="Side by side" id="compare-title" title="Which domain is yours?" />
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">Comparison of the two official domains</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="w-1/4 py-3 pr-4 kicker text-[0.6875rem] font-medium text-muted">
                    Compare
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    <span className="kicker text-violet">Domain 01</span>
                    <span className="headline block text-2xl">Artificial Intelligence</span>
                  </th>
                  <th scope="col" className="py-3">
                    <span className="kicker text-burgundy">Domain 02</span>
                    <span className="headline block text-2xl">Open Innovation / Startup</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-ink/30">
                    <th scope="row" className="py-4 pr-4 align-top label text-[0.75rem]">
                      {r.label}
                    </th>
                    <td className="py-4 pr-4 align-top text-charcoal">{r.values[0]}</td>
                    <td className="py-4 align-top text-charcoal">{r.values[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>
    </>
  );
}
