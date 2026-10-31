import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const SLUG = "open-innovation";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  const seo = copy.domainDetail.seo[SLUG];
  return pageMeta(`/tracks/${SLUG}`, seo.title, seo.description);
}

export default async function OpenInnovationPage() {
  const { domains } = await getSiteContent();
  const domain = domains.list.find((x) => x.slug === SLUG);
  if (!domain) notFound();
  return <DomainDetail domain={domain} />;
}
