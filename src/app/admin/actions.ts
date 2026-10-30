"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CONTENT_TAG, isSectionKey, sectionDefaults } from "@/lib/content";
import { sanitize } from "@/lib/content/sanitize";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/server/admin-auth";
import {
  COLLECTIONS,
  deleteContentDoc,
  deleteMedia,
  deleteSubmission,
  uploadMedia,
  writeContentDoc,
} from "@/lib/server/admin-store";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { storageDriver, type Collection } from "@/lib/server/store";

export type ActionResult<T = undefined> = { ok: boolean; message: string; data?: T };

const MAX_SECTION_BYTES = 1_000_000;

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ip = clientIp(new Request("http://x", { headers: await headers() }));
  const limit = rateLimit(`admin-login:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
  if (!limit.allowed) {
    return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }
  const username = String(formData.get("username") ?? "").slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!checkCredentials(username, password)) {
    return { ok: false, message: "Incorrect username or password." };
  }
  if (storageDriver() === "none") {
    return {
      ok: false,
      message: "Admin needs storage to keep you signed in. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see README).",
    };
  }
  await createSession(username);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ── Content ──────────────────────────────────────────────────────────────────

export async function saveSectionAction(key: string, json: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  if (!isSectionKey(key)) return { ok: false, message: "Unknown section." };
  if (json.length > MAX_SECTION_BYTES) return { ok: false, message: "This section is too large to save." };
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return { ok: false, message: "The content could not be read (invalid JSON)." };
  }
  const clean = sanitize(sectionDefaults[key], value, key);
  try {
    await writeContentDoc(key, clean);
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Saved. The live site now shows this version.", data: clean };
}

export async function resetSectionAction(key: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  if (!isSectionKey(key)) return { ok: false, message: "Unknown section." };
  try {
    await deleteContentDoc(key);
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Restored the built-in default.", data: sectionDefaults[key] };
}

// ── Submissions ──────────────────────────────────────────────────────────────

export async function deleteSubmissionAction(collection: string, id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!COLLECTIONS.includes(collection as Collection)) return { ok: false, message: "Unknown collection." };
  try {
    await deleteSubmission(collection as Collection, id);
    return { ok: true, message: "Submission deleted." };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

// ── Media ────────────────────────────────────────────────────────────────────

export async function uploadMediaAction(formData: FormData): Promise<ActionResult<{ url: string; name: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image to upload." };
  try {
    const item = await uploadMedia(file);
    return { ok: true, message: "Uploaded.", data: { url: item.url, name: item.name } };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function deleteMediaAction(name: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteMedia(name);
    return { ok: true, message: "Image deleted. Any content still using it will fall back to its illustration." };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}
