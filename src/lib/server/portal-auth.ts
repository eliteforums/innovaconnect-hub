import "server-only";
import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ModeratorRow, TeamRow } from "@/lib/finals";
import {
  createPortalSessionRecord,
  deletePortalSessionRecord,
  findModerator,
  findModeratorByLogin,
  findPortalSessionRecord,
  findTeam,
  findTeamByLogin,
} from "./finals-store";

/**
 * Sign-in for finalist teams and moderators, with the login ID and pass the
 * admin issues from the dashboard. Passes are stored only as scrypt hashes;
 * sessions work like admin sessions (random token, SHA-256 hash stored,
 * HttpOnly + SameSite=Strict cookie).
 */

export const PORTAL_COOKIE = "ih_portal";
const SESSION_HOURS = 12;

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// No 0/O or 1/I, so printed passes are easy to read out and type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomChars = (n: number) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export const newLoginId = (role: "team" | "moderator") => `${role === "team" ? "TEAM" : "MOD"}-${randomChars(6)}`;
/** 12 random characters (~60 bits), grouped for reading: K7QX-29MF-HT4P. */
export const newPass = () => [randomChars(4), randomChars(4), randomChars(4)].join("-");

/** Login IDs and passes are upper-case only; accept them typed in any case. */
export const normaliseCredential = (s: string) => s.trim().toUpperCase().slice(0, 64);

export async function hashPass(pass: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(pass, salt, 32);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(32).toString("base64")}`;

async function verifyPass(pass: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(pass, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

export type PortalUser = { role: "team"; team: TeamRow } | { role: "moderator"; moderator: ModeratorRow };

/** Checks a login ID and pass against teams and moderators. */
export async function checkPortalCredentials(loginId: string, pass: string): Promise<PortalUser | null> {
  const id = normaliseCredential(loginId);
  const team = id.startsWith("TEAM-") ? await findTeamByLogin(id) : null;
  const moderator = !team && id.startsWith("MOD-") ? await findModeratorByLogin(id) : null;
  const row = team ?? moderator;
  // Hash even for unknown IDs, so timing doesn't reveal which IDs exist.
  const ok = await verifyPass(normaliseCredential(pass), row?.pass_hash ?? DUMMY_HASH);
  if (!ok || !row) return null;
  return team ? { role: "team", team } : { role: "moderator", moderator: moderator! };
}

export async function createPortalSession(user: PortalUser) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await createPortalSessionRecord({
    token_hash: sha256(token),
    role: user.role,
    subject_id: user.role === "team" ? user.team.id : user.moderator.id,
    expires_at: expires.toISOString(),
  });
  (await cookies()).set(PORTAL_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function getPortalUser(): Promise<PortalUser | null> {
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  const session = await findPortalSessionRecord(sha256(token));
  if (!session) return null;
  if (session.role === "team") {
    const team = await findTeam(session.subject_id).catch(() => null);
    return team ? { role: "team", team } : null;
  }
  const moderator = await findModerator(session.subject_id).catch(() => null);
  return moderator ? { role: "moderator", moderator } : null;
}

export const portalHome = (role: PortalUser["role"]) => (role === "team" ? "/portal/team" : "/portal/moderator");

/** Use at the top of every team page and server action. */
export async function requireTeam() {
  const user = await getPortalUser();
  if (user?.role !== "team") redirect("/portal/login");
  return user.team;
}

/** Use at the top of every moderator page and server action. */
export async function requireModerator() {
  const user = await getPortalUser();
  if (user?.role !== "moderator") redirect("/portal/login");
  return user.moderator;
}

export async function destroyPortalSession() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE)?.value;
  if (token) await deletePortalSessionRecord(sha256(token)).catch(() => undefined);
  jar.delete(PORTAL_COOKIE);
}
