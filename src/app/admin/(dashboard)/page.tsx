import Link from "next/link";
import { ArrowRight, Database, FileText, Image as ImageIcon, Inbox } from "lucide-react";
import { getSiteContentFresh, sectionInfo } from "@/lib/content";
import { requireAdmin } from "@/lib/server/admin-auth";
import { COLLECTIONS, countSubmissions, listSubmissions, readContentDocs } from "@/lib/server/admin-store";
import { emailConfigured } from "@/lib/server/email";
import { storageDriver, type Collection } from "@/lib/server/store";
import { collectionLabels, getPath } from "@/components/admin/collections";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function AdminOverview() {
  await requireAdmin();
  const driver = storageDriver();
  const [counts, recent, docs, content] = await Promise.all([
    Promise.all(COLLECTIONS.map((c) => countSubmissions(c).catch(() => null))),
    Promise.all(
      COLLECTIONS.map(async (c) => (await listSubmissions(c, 5).catch(() => [])).map((r) => ({ ...r, collection: c }))),
    ),
    readContentDocs(),
    getSiteContentFresh(),
  ]);
  const latest = recent
    .flat()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);
  const edited = Object.values(docs).sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return (
    <div className="max-w-6xl">
      <p className="kicker text-burgundy">Dashboard</p>
      <h1 className="headline mt-2 text-5xl">Overview</h1>

      <section aria-label="Status" className="mt-8 grid gap-3 sm:grid-cols-3">
        <Status
          icon={Database}
          label="Storage"
          value={driver === "supabase" ? "Supabase" : driver === "file" ? "Local files (.data/)" : "Not configured"}
          warn={driver === "none"}
        />
        <Status icon={Inbox} label="Email notifications" value={emailConfigured() ? "Configured" : "Not configured"} />
        <Status
          icon={FileText}
          label="Registration status"
          value={content.copy.global.registration[content.event.registration.status].badge}
        />
      </section>

      <section aria-labelledby="subs-title" className="mt-10">
        <h2 id="subs-title" className="label text-[0.75rem]">
          Form submissions
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => (
            <li key={c}>
              <Link
                href={`/admin/submissions/${c}`}
                className="group block border-2 border-ink bg-paper-white p-5 transition-colors hover:bg-taxi"
              >
                <p className="kicker text-[0.6875rem] text-muted group-hover:text-ink">{collectionLabels[c].title}</p>
                <p className="headline mt-2 text-5xl">{counts[i] ?? "—"}</p>
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold">
                  View all <ArrowRight aria-hidden className="size-4" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="latest-title">
          <h2 id="latest-title" className="label text-[0.75rem]">
            Latest submissions
          </h2>
          {latest.length ? (
            <ul className="mt-3 divide-y divide-rule border-2 border-ink bg-paper-white">
              {latest.map((r) => (
                <li key={`${r.collection}-${r.id}`}>
                  <Link
                    href={`/admin/submissions/${r.collection}#${r.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-paper"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{summary(r.collection, r.payload) || r.email}</span>
                      <span className="block truncate text-xs text-muted">{r.email}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block kicker text-[0.5625rem] text-burgundy">{collectionLabels[r.collection].title}</span>
                      <span className="block text-xs text-muted">{new Date(r.created_at).toLocaleString("en-IN")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-2 border-dashed border-ink/40 p-6 text-sm text-muted">No submissions yet.</p>
          )}
        </section>

        <section aria-labelledby="edits-title">
          <h2 id="edits-title" className="label text-[0.75rem]">
            Edited sections
          </h2>
          {edited.length ? (
            <ul className="mt-3 divide-y divide-rule border-2 border-ink bg-paper-white">
              {edited.map((d) => (
                <li key={d.key}>
                  <Link href={`/admin/content/${d.key}`} className="flex justify-between gap-3 px-4 py-3 hover:bg-paper">
                    <span className="font-semibold">{sectionInfo[d.key as keyof typeof sectionInfo]?.label ?? d.key}</span>
                    <span className="text-xs text-muted">{new Date(d.updated_at).toLocaleString("en-IN")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-2 border-dashed border-ink/40 p-6 text-sm text-muted">
              Everything is showing the built-in content. Pick a section in the sidebar to start editing.
            </p>
          )}
          <Link
            href="/admin/media"
            className="mt-4 inline-flex items-center gap-2 border-2 border-ink bg-paper-white px-4 py-2 text-sm font-semibold hover:bg-taxi"
          >
            <ImageIcon aria-hidden className="size-4" /> Manage images
          </Link>
        </section>
      </div>
    </div>
  );
}

function summary(collection: Collection, payload: Record<string, unknown>) {
  const first = collectionLabels[collection].columns[0];
  const v = getPath(payload, first.path);
  return typeof v === "string" ? v : "";
}

function Status({
  icon: Icon,
  label,
  value,
  warn = false,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 border-2 border-ink p-4 ${warn ? "bg-best/10" : "bg-paper-white"}`}>
      <Icon aria-hidden className="size-5 shrink-0" />
      <div>
        <p className="kicker text-[0.5625rem] text-muted">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
