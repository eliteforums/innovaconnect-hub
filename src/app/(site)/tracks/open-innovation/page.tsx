import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { DomainDetail } from "@/components/tracks/DomainDetail";
import { pageMeta } from "@/lib/seo";

const SLUG = "open-innovation";

export async function generateMetadata() {
  const { domains } = await getSiteContent();
  const d = domains.list.find((x) => x.slug === SLUG);
  return d ? pageMeta(`/tracks/${SLUG}`, `Domain ${d.number} — ${d.name}`, d.summary) : {};
}

export default async function OpenInnovationPage() {
  const { domains } = await getSiteContent();
  const domain = domains.list.find((x) => x.slug === SLUG);
  if (!domain) notFound();
  return <DomainDetail domain={domain} />;
}
