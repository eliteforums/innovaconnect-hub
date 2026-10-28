import { domains } from "@/content/domains";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const domain = domains[1];

export const metadata = pageMeta(
  "/tracks/open-innovation",
  "Domain 02 — Open Innovation / Startup Track",
  domain.summary,
);

export default function OpenInnovationPage() {
  return <DomainDetail domain={domain} />;
}
