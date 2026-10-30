import { getAdmin } from "@/lib/server/admin-auth";
import { COLLECTIONS, listSubmissions } from "@/lib/server/admin-store";
import type { Collection } from "@/lib/server/store";

/** Flattens nested payloads into dotted columns (team.name, lead.email…). */
function flatten(value: unknown, prefix = "", out: Record<string, string> = {}) {
  if (Array.isArray(value)) {
    if (value.every((v) => v === null || typeof v !== "object")) out[prefix] = value.join("; ");
    else value.forEach((v, i) => flatten(v, `${prefix}.${i + 1}`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (prefix) {
    out[prefix] = value === null || value === undefined ? "" : String(value);
  }
  return out;
}

function csvCell(v: string) {
  // Neutralise spreadsheet formulas and quote every cell.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ collection: string }> }) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const { collection } = await ctx.params;
  if (!COLLECTIONS.includes(collection as Collection)) return new Response("Not found", { status: 404 });
  const rows = await listSubmissions(collection as Collection, 10_000);
  const flat = rows.map((r) => ({ id: r.id, received: r.created_at, ...flatten(r.payload) }));
  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
  const csv = [headers.map(csvCell).join(","), ...flat.map((r) => headers.map((h) => csvCell((r as Record<string, string>)[h] ?? "")).join(","))].join("\r\n");
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${collection}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
