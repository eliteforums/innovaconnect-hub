import { domains } from "@/content/domains";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const domain = domains[1];

export const metadata = pageMeta(
  "/tracks/open-innovation",
  "Startup Hackathon India 2027",
  "Explore InnovaHack Chapter 2's Open Innovation / Startup domain for original products, services and business ideas. AI is welcome but not required.",
);

export default function OpenInnovationPage() {
  return <DomainDetail domain={domain} />;
}
