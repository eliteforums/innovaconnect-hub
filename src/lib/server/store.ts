import "server-only";
import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Persistence adapter for form submissions (and, via ./admin-store.ts, for
 * editable content, admin sessions and uploaded media).
 *
 *  - "supabase": used when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 *    Writes through the PostgREST API with the service-role key (server only).
 *    Tables are defined in supabase/schema.sql.
 *  - "file": newline-delimited JSON under .data/ — for local development, or
 *    for self-hosting on a persistent disk when STORAGE_DRIVER=file.
 *  - "none": production without configured storage. Submissions are refused
 *    with an honest "unavailable" response rather than silently dropped.
 */

export type Collection = "interest_signups" | "registrations" | "partner_inquiries" | "contact_messages";

export type InsertResult =
  | { ok: true; id: string }
  | { ok: false; reason: "duplicate" | "unavailable" | "error" };

type Driver = "supabase" | "file" | "none";

export function storageDriver(): Driver {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.STORAGE_DRIVER === "file") return "file";
  if (process.env.NODE_ENV !== "production") return "file";
  return "none";
}

export async function insertRecord(
  collection: Collection,
  input: { dedupeKey: string; email: string; payload: unknown },
): Promise<InsertResult> {
  const driver = storageDriver();
  try {
    if (driver === "supabase") return await insertSupabase(collection, input);
    if (driver === "file") return await insertFile(collection, input);
    return { ok: false, reason: "unavailable" };
  } catch (err) {
    console.error(`[store] ${driver} insert into ${collection} failed`, err);
    return { ok: false, reason: "error" };
  }
}

/** Base data directory for the file driver. */
export function dataDir() {
  return process.env.LOCAL_STORE_DIR ?? path.join(process.cwd(), ".data");
}

/** Authenticated request to the Supabase REST/Storage APIs with the service-role key. */
export function supabase(pathAndQuery: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
  const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return fetch(`${base}${pathAndQuery}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
}

async function insertSupabase(
  collection: Collection,
  { dedupeKey, email, payload }: { dedupeKey: string; email: string; payload: unknown },
): Promise<InsertResult> {
  const res = await supabase(`/rest/v1/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ dedupe_key: dedupeKey, email, payload }),
  });
  if (res.status === 201) {
    const rows = (await res.json()) as { id: string }[];
    return { ok: true, id: rows[0]?.id ?? "" };
  }
  if (res.status === 409) return { ok: false, reason: "duplicate" };
  console.error(`[store] supabase responded ${res.status}: ${await res.text()}`);
  return { ok: false, reason: "error" };
}

// Serialise file writes within this process so duplicate checks are reliable.
let fileQueue: Promise<unknown> = Promise.resolve();

/** Runs file-store work one task at a time within this process. */
export function serialised<T>(run: () => Promise<T>): Promise<T> {
  const result = fileQueue.then(run, run);
  fileQueue = result.catch(() => undefined);
  return result;
}

async function insertFile(
  collection: Collection,
  { dedupeKey, email, payload }: { dedupeKey: string; email: string; payload: unknown },
): Promise<InsertResult> {
  const run = async (): Promise<InsertResult> => {
    const dir = dataDir();
    const file = path.join(dir, `${collection}.jsonl`);
    await mkdir(dir, { recursive: true });
    const existing = await readFile(file, "utf8").catch(() => "");
    for (const line of existing.split("\n")) {
      if (!line) continue;
      try {
        if ((JSON.parse(line) as { dedupe_key?: string }).dedupe_key === dedupeKey) {
          return { ok: false, reason: "duplicate" };
        }
      } catch {
        // Ignore a corrupt line rather than blocking every submission.
      }
    }
    const id = randomUUID();
    const row = { id, created_at: new Date().toISOString(), dedupe_key: dedupeKey, email, payload };
    await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
    return { ok: true, id };
  };
  return serialised(run);
}
