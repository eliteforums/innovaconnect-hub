import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionRecord, deleteSessionRecord, findSessionRecord } from "./admin-store";

/**
 * Admin authentication.
 *
 * Credentials come from ADMIN_USERNAME / ADMIN_PASSWORD and default to
 * admin / admin. Sessions are random tokens; only their SHA-256 hash is
 * stored, and the cookie is HttpOnly + SameSite=Strict.
 */

export const ADMIN_COOKIE = "ih_admin";
const SESSION_HOURS = 12;

export function adminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin",
  };
}

export function usingDefaultCredentials() {
  const { username, password } = adminCredentials();
  return username === "admin" && password === "admin";
}

const sha256 = (s: string) => createHash("sha256").update(s).digest();

function safeEqual(a: string, b: string) {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function checkCredentials(username: string, password: string) {
  const expected = adminCredentials();
  // Evaluate both comparisons so timing doesn't reveal which one failed.
  const userOk = safeEqual(username, expected.username);
  const passOk = safeEqual(password, expected.password);
  return userOk && passOk;
}

export async function createSession(username: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await createSessionRecord({
    token_hash: sha256(token).toString("hex"),
    username,
    expires_at: expires.toISOString(),
  });
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function getAdmin(): Promise<{ username: string } | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  const row = await findSessionRecord(sha256(token).toString("hex"));
  return row ? { username: row.username } : null;
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) await deleteSessionRecord(sha256(token).toString("hex"));
  jar.delete(ADMIN_COOKIE);
}
