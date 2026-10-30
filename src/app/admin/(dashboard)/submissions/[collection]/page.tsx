import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/server/admin-auth";
import { COLLECTIONS, listSubmissions } from "@/lib/server/admin-store";
import type { Collection } from "@/lib/server/store";
import { collectionLabels } from "@/components/admin/collections";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function SubmissionsPage({ params }: { params: Promise<{ collection: string }> }) {
  await requireAdmin();
  const { collection } = await params;
  if (!COLLECTIONS.includes(collection as Collection)) notFound();
  const c = collection as Collection;
  const info = collectionLabels[c];
  let rows: Awaited<ReturnType<typeof listSubmissions>> = [];
  let error: string | null = null;
  try {
    rows = await listSubmissions(c);
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="max-w-7xl">
      <p className="kicker text-burgundy">Form submissions</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="headline text-5xl">{info.title}</h1>
          <p className="mt-2 text-charcoal">{info.description}</p>
        </div>
        <a
          href={`/api/admin/export/${c}`}
          className="inline-flex items-center gap-2 border-2 border-ink bg-paper-white px-4 py-2 text-sm font-semibold hover:bg-taxi"
        >
          <Download aria-hidden className="size-4" /> Export CSV
        </a>
      </div>
      {error ? (
        <p role="alert" className="mt-6 border-2 border-best bg-best/5 p-4">
          {error}
        </p>
      ) : (
        <SubmissionsTable collection={c} rows={rows} columns={info.columns} />
      )}
    </div>
  );
}
