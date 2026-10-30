import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir, serialised, storageDriver, supabase, type Collection } from "./store";

/**
 * Storage for the admin dashboard: form submissions (read/delete), editable
 * content documents, admin sessions and uploaded media. Mirrors the drivers
 * in ./store.ts — Supabase in production, JSON files under .data/ locally.
 */

export const COLLECTIONS: Collection[] = ["interest_signups", "registrations", "partner_inquiries", "contact_messages"];

export type SubmissionRow = {
  id: string;
  created_at: string;
  email: string;
  payload: Record<string, unknown>;
};

class StorageUnavailableError extends Error {
  constructor() {
    super("Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see README).");
  }
}

function requireDriver() {
  const driver = storageDriver();
  if (driver === "none") throw new StorageUnavailableError();
  return driver;
}

async function readJsonl<T>(file: string): Promise<T[]> {
  const text = await readFile(file, "utf8").catch(() => "");
  const rows: T[] = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    try {
      rows.push(JSON.parse(line) as T);
    } catch {
      // skip corrupt lines
    }
  }
  return rows;
}

async function writeJsonl(file: string, rows: unknown[]) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""), "utf8");
}

async function expectOk(res: Response, what: string) {
  if (!res.ok) throw new Error(`${what} failed (${res.status}): ${await res.text()}`);
  return res;
}

// ── Submissions ──────────────────────────────────────────────────────────────

export async function listSubmissions(collection: Collection, limit = 1000): Promise<SubmissionRow[]> {
  const driver = requireDriver();
  if (driver === "supabase") {
    const res = await expectOk(
      await supabase(`/rest/v1/${collection}?select=id,created_at,email,payload&order=created_at.desc&limit=${limit}`),
      `Listing ${collection}`,
    );
    return (await res.json()) as SubmissionRow[];
  }
  const rows = await readJsonl<SubmissionRow>(path.join(dataDir(), `${collection}.jsonl`));
  return rows.reverse().slice(0, limit);
}

export async function countSubmissions(collection: Collection): Promise<number> {
  const driver = requireDriver();
  if (driver === "supabase") {
    const res = await expectOk(
      await supabase(`/rest/v1/${collection}?select=id`, { method: "HEAD", headers: { Prefer: "count=exact" } }),
      `Counting ${collection}`,
    );
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
  }
  return (await readJsonl(path.join(dataDir(), `${collection}.jsonl`))).length;
}

export async function deleteSubmission(collection: Collection, id: string) {
  const driver = requireDriver();
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/${collection}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }),
      `Deleting from ${collection}`,
    );
    return;
  }
  await serialised(async () => {
    const file = path.join(dataDir(), `${collection}.jsonl`);
    const rows = await readJsonl<SubmissionRow>(file);
    await writeJsonl(file, rows.filter((r) => r.id !== id));
  });
}

// ── Content documents ────────────────────────────────────────────────────────

export type ContentDoc = { key: string; value: unknown; updated_at: string };

/** All saved content documents, keyed by section. Missing storage → none. */
export async function readContentDocs(): Promise<Record<string, ContentDoc>> {
  const driver = storageDriver();
  if (driver === "none") return {};
  if (driver === "supabase") {
    const res = await supabase(`/rest/v1/site_content?select=key,value,updated_at`);
    if (!res.ok) {
      console.error(`[content] reading site_content failed (${res.status})`);
      return {};
    }
    const rows = (await res.json()) as ContentDoc[];
    return Object.fromEntries(rows.map((r) => [r.key, r]));
  }
  const file = path.join(dataDir(), "site_content.json");
  try {
    return JSON.parse(await readFile(file, "utf8")) as Record<string, ContentDoc>;
  } catch {
    return {};
  }
}

export async function writeContentDoc(key: string, value: unknown) {
  const driver = requireDriver();
  const doc = { key, value, updated_at: new Date().toISOString() };
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/site_content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(doc),
      }),
      "Saving content",
    );
    return;
  }
  await serialised(async () => {
    const docs = await readContentDocs();
    docs[key] = doc;
    await mkdir(dataDir(), { recursive: true });
    await writeFile(path.join(dataDir(), "site_content.json"), JSON.stringify(docs, null, 2), "utf8");
  });
}

export async function deleteContentDoc(key: string) {
  const driver = requireDriver();
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/site_content?key=eq.${encodeURIComponent(key)}`, { method: "DELETE" }),
      "Resetting content",
    );
    return;
  }
  await serialised(async () => {
    const docs = await readContentDocs();
    delete docs[key];
    await writeFile(path.join(dataDir(), "site_content.json"), JSON.stringify(docs, null, 2), "utf8");
  });
}

// ── Admin sessions ───────────────────────────────────────────────────────────

type SessionRow = { token_hash: string; username: string; expires_at: string };

export async function createSessionRecord(row: SessionRow) {
  const driver = requireDriver();
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/admin_sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(row),
      }),
      "Creating session",
    );
    return;
  }
  await serialised(async () => {
    const file = path.join(dataDir(), "admin_sessions.jsonl");
    const now = Date.now();
    const rows = (await readJsonl<SessionRow>(file)).filter((r) => Date.parse(r.expires_at) > now);
    await writeJsonl(file, [...rows, row]);
  });
}

export async function findSessionRecord(tokenHash: string): Promise<SessionRow | null> {
  const driver = storageDriver();
  if (driver === "none") return null;
  let row: SessionRow | undefined;
  if (driver === "supabase") {
    const res = await supabase(
      `/rest/v1/admin_sessions?select=token_hash,username,expires_at&token_hash=eq.${encodeURIComponent(tokenHash)}&limit=1`,
    );
    if (!res.ok) return null;
    row = ((await res.json()) as SessionRow[])[0];
  } else {
    row = (await readJsonl<SessionRow>(path.join(dataDir(), "admin_sessions.jsonl"))).find((r) => r.token_hash === tokenHash);
  }
  if (!row || Date.parse(row.expires_at) <= Date.now()) return null;
  return row;
}

export async function deleteSessionRecord(tokenHash: string) {
  const driver = storageDriver();
  if (driver === "none") return;
  if (driver === "supabase") {
    await supabase(`/rest/v1/admin_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}`, { method: "DELETE" });
    return;
  }
  await serialised(async () => {
    const file = path.join(dataDir(), "admin_sessions.jsonl");
    const rows = await readJsonl<SessionRow>(file);
    await writeJsonl(file, rows.filter((r) => r.token_hash !== tokenHash));
  });
}

// ── Uploaded media ───────────────────────────────────────────────────────────

export const MEDIA_BUCKET = "site-media";
const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type MediaItem = { name: string; url: string; size: number; created_at: string };

function mediaDir() {
  return path.join(dataDir(), "uploads");
}

/** Public URL for an uploaded file. */
function mediaUrl(name: string) {
  if (storageDriver() === "supabase") {
    return `${process.env.SUPABASE_URL!.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${name}`;
  }
  return `/api/media/${name}`;
}

export function mediaExtension(type: string) {
  return MEDIA_TYPES[type] ?? null;
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  const driver = requireDriver();
  const ext = mediaExtension(file.type);
  if (!ext) throw new Error("Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/storage/v1/object/${MEDIA_BUCKET}/${name}`, {
        method: "POST",
        headers: { "Content-Type": file.type, "x-upsert": "false" },
        body: bytes,
      }),
      "Uploading image",
    );
  } else {
    await mkdir(mediaDir(), { recursive: true });
    await writeFile(path.join(mediaDir(), name), bytes);
  }
  return { name, url: mediaUrl(name), size: file.size, created_at: new Date().toISOString() };
}

export async function listMedia(): Promise<MediaItem[]> {
  const driver = storageDriver();
  if (driver === "none") return [];
  if (driver === "supabase") {
    const res = await supabase(`/storage/v1/object/list/${MEDIA_BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 500, sortBy: { column: "created_at", order: "desc" } }),
    });
    if (!res.ok) return [];
    const items = (await res.json()) as { name: string; created_at: string; metadata?: { size?: number } }[];
    return items
      .filter((i) => i.name && !i.name.startsWith("."))
      .map((i) => ({ name: i.name, url: mediaUrl(i.name), size: i.metadata?.size ?? 0, created_at: i.created_at }));
  }
  const names = await readdir(mediaDir()).catch(() => [] as string[]);
  const items = await Promise.all(
    names.map(async (name) => {
      const s = await stat(path.join(mediaDir(), name));
      return { name, url: mediaUrl(name), size: s.size, created_at: s.mtime.toISOString() };
    }),
  );
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function deleteMedia(name: string) {
  const driver = requireDriver();
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/i.test(name)) throw new Error("Invalid file name.");
  if (driver === "supabase") {
    await expectOk(
      await supabase(`/storage/v1/object/${MEDIA_BUCKET}/${name}`, { method: "DELETE" }),
      "Deleting image",
    );
    return;
  }
  await rm(path.join(mediaDir(), name), { force: true });
}

/** File-driver only: bytes and type of an uploaded file, for /api/media. */
export async function readLocalMedia(name: string): Promise<{ bytes: Buffer; type: string } | null> {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/i.test(name)) return null;
  const ext = name.split(".").pop()!.toLowerCase();
  const type = Object.entries(MEDIA_TYPES).find(([, e]) => e === ext)?.[0];
  if (!type) return null;
  try {
    return { bytes: await readFile(path.join(mediaDir(), name)), type };
  } catch {
    return null;
  }
}
