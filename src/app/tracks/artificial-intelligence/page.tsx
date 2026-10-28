import { domains } from "@/content/domains";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const domain = domains[0];

export const metadata = pageMeta(
  "/tracks/artificial-intelligence",
  "Domain 01 — Artificial Intelligence",
  domain.summary,
);

export default function ArtificialIntelligencePage() {
  return <DomainDetail domain={domain} />;
}
