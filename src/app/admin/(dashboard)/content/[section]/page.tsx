import { notFound } from "next/navigation";
import { isSectionKey, sectionDefaults, sectionInfo } from "@/lib/content";
import { sanitize } from "@/lib/content/sanitize";
import { libraryOptions } from "@/lib/media-library";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listMedia, readContentDocs } from "@/lib/server/admin-store";
import { ContentEditor } from "@/components/admin/ContentEditor";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

/** Where each section shows up on the public site, for the "View page" link. */
const livePaths: Record<string, string> = {
  event: "/",
  domains: "/tracks",
  chapter1: "/chapter-1",
  articles: "/updates",
  faq: "/faq",
  rules: "/rules",
  city: "/#the-city",
  map: "/#map",
  images: "/",
  navigation: "/",
  "copy.global": "/",
  "copy.home": "/",
  "copy.about": "/about",
  "copy.tracks": "/tracks",
  "copy.domainDetail": "/tracks/artificial-intelligence",
  "copy.chapter1Page": "/chapter-1",
  "copy.timeline": "/#journey-title",
  "copy.prizes": "/prizes",
  "copy.partners": "/partners",
  "copy.updates": "/updates",
  "copy.register": "/register",
  "copy.contact": "/contact",
  "copy.faq": "/faq",
  "copy.rules": "/rules",
  "copy.privacy": "/privacy",
  "copy.terms": "/terms",
};

export default async function EditSectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdmin();
  const { section } = await params;
  if (!isSectionKey(section)) notFound();
  const [docs, uploads] = await Promise.all([readContentDocs(), listMedia()]);
  const doc = docs[section];
  const current = doc ? sanitize(sectionDefaults[section], doc.value, section) : sectionDefaults[section];
  const images = [
    ...libraryOptions(),
    ...uploads.map((u) => ({ key: u.url, label: u.name, group: "Upload" as const, preview: u.url })),
  ];
  const info = sectionInfo[section];
  return (
    <ContentEditor
      key={section}
      sectionKey={section}
      label={info.label}
      group={info.group}
      description={info.description}
      initial={JSON.parse(JSON.stringify(current))}
      updatedAt={doc?.updated_at ?? null}
      images={images}
      livePath={livePaths[section] ?? "/"}
    />
  );
}
