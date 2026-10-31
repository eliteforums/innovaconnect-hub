import { getSiteContent } from "@/lib/content";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata() {
  const { copy } = await getSiteContent();
  return pageMeta("/terms", copy.terms.seo.title, copy.terms.seo.description);
}

export default async function TermsPage() {
  const { copy } = await getSiteContent();
  const x = copy.terms;
  return <LegalPage section={x.section} path="/terms" title={x.title} deck={x.deck} sections={x.sections} />;
}
