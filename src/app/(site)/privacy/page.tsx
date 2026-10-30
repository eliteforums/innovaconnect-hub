import { getSiteContent } from "@/lib/content";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/privacy", copy.privacy.meta.title, copy.privacy.meta.description);
}

export default async function PrivacyPage() {
  const { copy } = await getSiteContent();
  const x = copy.privacy;
  return <LegalPage section={x.section} path="/privacy" title={x.title} deck={x.deck} sections={x.sections} />;
}
