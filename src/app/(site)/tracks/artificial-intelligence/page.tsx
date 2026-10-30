import { domains } from "@/content/domains";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const domain = domains[0];

export const metadata = pageMeta(
  "/tracks/artificial-intelligence",
  "AI Hackathon India 2027",
  "Explore the Artificial Intelligence domain for InnovaHack Chapter 2. Build with generative AI, agents, machine learning and other AI systems for real-world problems.",
);

export default function ArtificialIntelligencePage() {
  return <DomainDetail domain={domain} />;
}
