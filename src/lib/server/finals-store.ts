import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildLeaderboard,
  defaultFinalsSettings,
  type FinalsSettings,
  type ModeratorRow,
  type ScoreRow,
  type SolutionRow,
  type TeamRow,
} from "@/lib/finals";
import { dataDir, serialised, storageDriver, supabase } from "./store";

/**
 * Storage for the live final: finalist teams, moderators, solutions, scores,
 * finals settings and team/moderator sessions. Mirrors the drivers in
 * ./store.ts — Supabase tables in production (supabase/schema.sql), JSON
 * files under .data/ locally. Data sets are small (hundreds of rows), so
 * reads fetch whole tables and filter in memory.
 */

export type PortalSessionRow = {
  token_hash: string;
  role: "team" | "moderator";
  subject_id: string;
  expires_at: string;
};

type Tables = {
  finals_teams: TeamRow;
  finals_moderators: ModeratorRow;
  finals_solutions: SolutionRow;
  finals_scores: ScoreRow;
  finals_settings: { id: string; value: unknown; updated_at: string };
  portal_sessions: PortalSessionRow;
};
type Table = keyof Tables;

const PRIMARY_KEY: { [T in Table]: keyof Tables[T] & string } = {
  finals_teams: "id",
  finals_moderators: "id",
  finals_solutions: "team_id",
  finals_scores: "id",
  finals_settings: "id",
  portal_sessions: "token_hash",
};

export class DuplicateError extends Error {}

function requireDriver() {
  const driver = storageDriver();
  if (driver === "none") throw new Error("Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY (see README).");
  return driver;
}

async function expectOk(res: Response, what: string) {
  if (res.status === 409) throw new DuplicateError(`${what}: already exists.`);
  if (!res.ok) throw new Error(`${what} failed (${res.status}): ${await res.text()}`);
  return res;
}

const fileOf = (table: Table) => path.join(dataDir(), `${table}.json`);

async function readFileTable<T extends Table>(table: T): Promise<Tables[T][]> {
  try {
    const rows = JSON.parse(await readFile(fileOf(table), "utf8"));
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function writeFileTable<T extends Table>(table: T, rows: Tables[T][]) {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(fileOf(table), JSON.stringify(rows, null, 2), "utf8");
}

async function selectAll<T extends Table>(table: T): Promise<Tables[T][]> {
  if (requireDriver() === "supabase") {
    const res = await expectOk(await supabase(`/rest/v1/${table}?select=*&limit=10000`), `Reading ${table}`);
    return (await res.json()) as Tables[T][];
  }
  return readFileTable(table);
}

async function selectWhere<T extends Table>(table: T, column: keyof Tables[T] & string, value: string): Promise<Tables[T][]> {
  if (requireDriver() === "supabase") {
    const res = await expectOk(
      await supabase(`/rest/v1/${table}?select=*&${column}=eq.${encodeURIComponent(value)}&limit=10000`),
      `Reading ${table}`,
    );
    return (await res.json()) as Tables[T][];
  }
  return (await readFileTable(table)).filter((r) => r[column] === value);
}

async function insertRow<T extends Table>(table: T, row: Tables[T], unique: (keyof Tables[T] & string)[] = []) {
  if (requireDriver() === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(row),
      }),
      `Saving to ${table}`,
    );
    return;
  }
  await serialised(async () => {
    const rows = await readFileTable(table);
    const key = PRIMARY_KEY[table];
    if (rows.some((r) => [key, ...unique].some((k) => r[k as keyof Tables[T]] === row[k as keyof Tables[T]]))) {
      throw new DuplicateError(`Saving to ${table}: already exists.`);
    }
    await writeFileTable(table, [...rows, row]);
  });
}

async function upsertRow<T extends Table>(table: T, row: Tables[T]) {
  if (requireDriver() === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(row),
      }),
      `Saving to ${table}`,
    );
    return;
  }
  await serialised(async () => {
    const key = PRIMARY_KEY[table] as keyof Tables[T];
    const rows = (await readFileTable(table)).filter((r) => r[key] !== row[key]);
    await writeFileTable(table, [...rows, row]);
  });
}

async function updateRow<T extends Table>(table: T, id: string, patch: Partial<Tables[T]>) {
  const key = PRIMARY_KEY[table];
  if (requireDriver() === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/${table}?${key}=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(patch),
      }),
      `Updating ${table}`,
    );
    return;
  }
  await serialised(async () => {
    const rows = await readFileTable(table);
    await writeFileTable(
      table,
      rows.map((r) => (r[key as keyof Tables[T]] === id ? { ...r, ...patch } : r)),
    );
  });
}

async function deleteWhere<T extends Table>(table: T, column: keyof Tables[T] & string, value: string) {
  if (requireDriver() === "supabase") {
    await expectOk(
      await supabase(`/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`, { method: "DELETE" }),
      `Deleting from ${table}`,
    );
    return;
  }
  await serialised(async () => {
    const rows = await readFileTable(table);
    await writeFileTable(table, rows.filter((r) => r[column] !== value));
  });
}

const byCreated = <R extends { created_at: string }>(rows: R[]) => rows.sort((a, b) => a.created_at.localeCompare(b.created_at));

// ── Teams ────────────────────────────────────────────────────────────────────

export const listTeams = async () => byCreated(await selectAll("finals_teams"));
export const findTeam = async (id: string) => (await selectWhere("finals_teams", "id", id))[0] ?? null;
export const findTeamByLogin = async (loginId: string) => (await selectWhere("finals_teams", "login_id", loginId))[0] ?? null;
export const insertTeam = (row: TeamRow) => insertRow("finals_teams", row, ["login_id"]);
export const updateTeam = (id: string, patch: Partial<TeamRow>) => updateRow("finals_teams", id, patch);

export async function deleteTeam(id: string) {
  // Supabase cascades through foreign keys; the file driver needs it spelled out.
  await deleteWhere("finals_scores", "team_id", id);
  await deleteWhere("finals_solutions", "team_id", id);
  await deleteSessionsFor(id);
  await deleteWhere("finals_teams", "id", id);
}

// ── Moderators ───────────────────────────────────────────────────────────────

export const listModerators = async () => byCreated(await selectAll("finals_moderators"));
export const findModerator = async (id: string) => (await selectWhere("finals_moderators", "id", id))[0] ?? null;
export const findModeratorByLogin = async (loginId: string) =>
  (await selectWhere("finals_moderators", "login_id", loginId))[0] ?? null;
export const insertModerator = (row: ModeratorRow) => insertRow("finals_moderators", row, ["login_id"]);
export const updateModerator = (id: string, patch: Partial<ModeratorRow>) => updateRow("finals_moderators", id, patch);

export async function deleteModerator(id: string) {
  await deleteWhere("finals_scores", "moderator_id", id);
  await deleteSessionsFor(id);
  await deleteWhere("finals_moderators", "id", id);
}

// ── Solutions ────────────────────────────────────────────────────────────────

export const listSolutions = () => selectAll("finals_solutions");
export const findSolution = async (teamId: string) => (await selectWhere("finals_solutions", "team_id", teamId))[0] ?? null;
export const saveSolution = (row: SolutionRow) => upsertRow("finals_solutions", row);

// ── Scores ───────────────────────────────────────────────────────────────────

export const listScores = () => selectAll("finals_scores");
export const listScoresForTeam = (teamId: string) => selectWhere("finals_scores", "team_id", teamId);
export const saveScore = (row: ScoreRow) => upsertRow("finals_scores", row);
export const deleteScore = (id: string) => deleteWhere("finals_scores", "id", id);

// ── Settings ─────────────────────────────────────────────────────────────────

const SETTINGS_ID = "current";

/** Saved finals settings over the defaults. Missing storage → defaults. */
export async function readFinalsSettings(): Promise<FinalsSettings> {
  if (storageDriver() === "none") return defaultFinalsSettings;
  const row = (await selectWhere("finals_settings", "id", SETTINGS_ID).catch(() => []))[0];
  const saved = (row?.value ?? {}) as Partial<FinalsSettings>;
  return {
    ...defaultFinalsSettings,
    ...saved,
    criteria: Array.isArray(saved.criteria) && saved.criteria.length ? saved.criteria : defaultFinalsSettings.criteria,
  };
}

export async function writeFinalsSettings(settings: FinalsSettings) {
  await upsertRow("finals_settings", { id: SETTINGS_ID, value: settings, updated_at: new Date().toISOString() });
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export async function createPortalSessionRecord(row: PortalSessionRow) {
  if (requireDriver() === "file") {
    // Drop expired sessions as new ones are created (Supabase does this in a trigger).
    await serialised(async () => {
      const now = Date.now();
      const rows = (await readFileTable("portal_sessions")).filter((r) => Date.parse(r.expires_at) > now);
      await writeFileTable("portal_sessions", [...rows, row]);
    });
    return;
  }
  await insertRow("portal_sessions", row);
}

export async function findPortalSessionRecord(tokenHash: string): Promise<PortalSessionRow | null> {
  if (storageDriver() === "none") return null;
  const row = (await selectWhere("portal_sessions", "token_hash", tokenHash).catch(() => []))[0];
  if (!row || Date.parse(row.expires_at) <= Date.now()) return null;
  return row;
}

export const deletePortalSessionRecord = (tokenHash: string) => deleteWhere("portal_sessions", "token_hash", tokenHash);

/** Signs a team or moderator out everywhere (after a pass reset or removal). */
export const deleteSessionsFor = (subjectId: string) => deleteWhere("portal_sessions", "subject_id", subjectId);

// ── Leaderboard ──────────────────────────────────────────────────────────────

/** Everything the leaderboard is computed from, read in one go. */
export async function loadFinals() {
  const [teams, moderators, solutions, scores, settings] = await Promise.all([
    listTeams(),
    listModerators(),
    listSolutions(),
    listScores(),
    readFinalsSettings(),
  ]);
  return { teams, moderators, solutions, scores, settings };
}

/** The public leaderboard, or null while the admin has it switched off. */
export async function publicLeaderboard() {
  const settings = await readFinalsSettings();
  if (!settings.leaderboardEnabled) return null;
  const data = await loadFinals();
  return buildLeaderboard({ ...data, includeMarks: data.settings.showModeratorMarks });
}
