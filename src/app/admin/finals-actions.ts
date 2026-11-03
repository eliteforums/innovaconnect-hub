"use server";

import { randomUUID } from "node:crypto";
import type { ActionResult } from "./actions";
import { TIERS, type FinalsSettings, type ModeratorInfo, type TeamInfo, type Tier, moderatorInfo, teamInfo } from "@/lib/finals";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  DuplicateError,
  deleteModerator,
  deleteScore,
  deleteSessionsFor,
  deleteTeam,
  findModerator,
  findTeam,
  insertModerator,
  insertTeam,
  listTeams,
  readFinalsSettings,
  updateModerator,
  updateTeam,
  writeFinalsSettings,
} from "@/lib/server/finals-store";
import { hashPass, newLoginId, newPass } from "@/lib/server/portal-auth";
import { criteriaSchema, finalistTeamSchema, moderatorSchema } from "@/lib/validation";

/** A freshly issued login, shown to the admin once. Only its hash is stored. */
export type IssuedPass = { name: string; loginId: string; pass: string };

const failure = (err: unknown): ActionResult<never> => ({ ok: false, message: (err as Error).message });

/** Inserts a row with a new login ID, retrying in the (unlikely) event of a clash. */
async function withNewLogin<T>(role: "team" | "moderator", insert: (loginId: string) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await insert(newLoginId(role));
    } catch (err) {
      if (!(err instanceof DuplicateError) || attempt >= 4) throw err;
    }
  }
}

// ── Teams ────────────────────────────────────────────────────────────────────

export async function createTeamsAction(
  input: unknown[],
): Promise<ActionResult<{ teams: TeamInfo[]; passes: IssuedPass[] }>> {
  await requireAdmin();
  if (!Array.isArray(input) || input.length === 0) return { ok: false, message: "Add at least one team." };
  if (input.length > 500) return { ok: false, message: "Add at most 500 teams at a time." };
  const parsed = input.map((t) => finalistTeamSchema.safeParse(t));
  const bad = parsed.findIndex((p) => !p.success);
  if (bad >= 0) {
    const issue = parsed[bad].error!.issues[0];
    return { ok: false, message: input.length > 1 ? `Team ${bad + 1}: ${issue.message}` : issue.message };
  }

  const existing = await listTeams().catch(() => []);
  const imported = new Set(existing.map((t) => t.registration_id).filter(Boolean));
  const teams: TeamInfo[] = [];
  const passes: IssuedPass[] = [];
  try {
    for (const p of parsed) {
      const t = p.data!;
      if (t.registrationId && imported.has(t.registrationId)) continue;
      const pass = newPass();
      const pass_hash = await hashPass(pass);
      const row = await withNewLogin("team", async (login_id) => {
        const row = {
          id: randomUUID(),
          login_id,
          pass_hash,
          name: t.name,
          domain: t.domain,
          mode: t.mode,
          email: t.email,
          members: t.members,
          registration_id: t.registrationId || null,
          tier: null,
          created_at: new Date().toISOString(),
        };
        await insertTeam(row);
        return row;
      });
      teams.push(teamInfo(row));
      passes.push({ name: row.name, loginId: row.login_id, pass });
    }
  } catch (err) {
    // Report the teams created before the failure, so their passes aren't lost.
    return {
      ok: false,
      message: `${(err as Error).message}${passes.length ? ` (${passes.length} created before the error.)` : ""}`,
      data: { teams, passes },
    };
  }
  const skipped = parsed.length - teams.length;
  return {
    ok: true,
    message: `Created ${teams.length} team login${teams.length === 1 ? "" : "s"}.${skipped ? ` Skipped ${skipped} already imported.` : ""} Copy the passes now — they are shown only once.`,
    data: { teams, passes },
  };
}

export async function updateTeamAction(id: string, input: unknown): Promise<ActionResult<TeamInfo>> {
  await requireAdmin();
  const parsed = finalistTeamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { name, domain, mode, email, members } = parsed.data;
  try {
    const team = await findTeam(id);
    if (!team) return { ok: false, message: "That team no longer exists." };
    await updateTeam(id, { name, domain, mode, email, members });
    return { ok: true, message: "Team updated.", data: teamInfo({ ...team, name, domain, mode, email, members }) };
  } catch (err) {
    return failure(err);
  }
}

export async function resetTeamPassAction(id: string): Promise<ActionResult<IssuedPass>> {
  await requireAdmin();
  try {
    const team = await findTeam(id);
    if (!team) return { ok: false, message: "That team no longer exists." };
    const pass = newPass();
    await updateTeam(id, { pass_hash: await hashPass(pass) });
    await deleteSessionsFor(id);
    return {
      ok: true,
      message: "New pass issued. The old pass no longer works and the team has been signed out.",
      data: { name: team.name, loginId: team.login_id, pass },
    };
  } catch (err) {
    return failure(err);
  }
}

export async function deleteTeamAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteTeam(id);
    const settings = await readFinalsSettings();
    if (settings.nowReviewing === id) await writeFinalsSettings({ ...settings, nowReviewing: null });
    return { ok: true, message: "Team, its solution and its marks deleted." };
  } catch (err) {
    return failure(err);
  }
}

export async function setTierAction(id: string, tier: number | null): Promise<ActionResult> {
  await requireAdmin();
  if (tier !== null && !TIERS.includes(tier as Tier)) return { ok: false, message: "Unknown tier." };
  try {
    await updateTeam(id, { tier: tier as Tier | null });
    return { ok: true, message: tier ? `Marked as a Tier ${tier} winner.` : "Tier removed." };
  } catch (err) {
    return failure(err);
  }
}

// ── Moderators ───────────────────────────────────────────────────────────────

export async function createModeratorAction(
  input: unknown,
): Promise<ActionResult<{ moderator: ModeratorInfo; pass: IssuedPass }>> {
  await requireAdmin();
  const parsed = moderatorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    const pass = newPass();
    const pass_hash = await hashPass(pass);
    const row = await withNewLogin("moderator", async (login_id) => {
      const row = {
        id: randomUUID(),
        login_id,
        pass_hash,
        name: parsed.data.name,
        affiliation: parsed.data.affiliation,
        created_at: new Date().toISOString(),
      };
      await insertModerator(row);
      return row;
    });
    return {
      ok: true,
      message: "Moderator added. Copy the pass now — it is shown only once.",
      data: { moderator: moderatorInfo(row), pass: { name: row.name, loginId: row.login_id, pass } },
    };
  } catch (err) {
    return failure(err);
  }
}

export async function resetModeratorPassAction(id: string): Promise<ActionResult<IssuedPass>> {
  await requireAdmin();
  try {
    const moderator = await findModerator(id);
    if (!moderator) return { ok: false, message: "That moderator no longer exists." };
    const pass = newPass();
    await updateModerator(id, { pass_hash: await hashPass(pass) });
    await deleteSessionsFor(id);
    return {
      ok: true,
      message: "New pass issued. The old pass no longer works and the moderator has been signed out.",
      data: { name: moderator.name, loginId: moderator.login_id, pass },
    };
  } catch (err) {
    return failure(err);
  }
}

export async function deleteModeratorAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteModerator(id);
    return { ok: true, message: "Moderator removed, along with the marks they gave." };
  } catch (err) {
    return failure(err);
  }
}

// ── Scores ───────────────────────────────────────────────────────────────────

export async function deleteScoreAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteScore(id);
    return { ok: true, message: "Marks removed. The leaderboard has been updated." };
  } catch (err) {
    return failure(err);
  }
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function updateFinalsSettingsAction(
  patch: Partial<FinalsSettings>,
): Promise<ActionResult<FinalsSettings>> {
  await requireAdmin();
  try {
    const current = await readFinalsSettings();
    const next = { ...current };
    for (const key of ["leaderboardEnabled", "submissionsOpen", "winnersPublished", "showModeratorMarks"] as const) {
      if (typeof patch[key] === "boolean") next[key] = patch[key];
    }
    if ("nowReviewing" in patch) {
      const id = patch.nowReviewing;
      if (id && !(await findTeam(id))) return { ok: false, message: "That team no longer exists." };
      next.nowReviewing = id || null;
    }
    if (patch.criteria !== undefined) {
      const parsed = criteriaSchema.safeParse(patch.criteria);
      if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
      next.criteria = parsed.data;
    }
    await writeFinalsSettings(next);
    return { ok: true, message: "Saved. The leaderboard reflects this within a few seconds.", data: next };
  } catch (err) {
    return failure(err);
  }
}
