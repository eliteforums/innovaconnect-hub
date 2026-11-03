"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";
import { scoreTotal } from "@/lib/finals";
import {
  findSolution,
  findTeam,
  readFinalsSettings,
  saveScore,
  saveSolution,
  writeFinalsSettings,
} from "@/lib/server/finals-store";
import {
  checkPortalCredentials,
  createPortalSession,
  destroyPortalSession,
  portalHome,
  requireModerator,
  requireTeam,
} from "@/lib/server/portal-auth";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { storageDriver } from "@/lib/server/store";
import { fieldErrors, solutionSchema } from "@/lib/validation";

// ── Sign in ──────────────────────────────────────────────────────────────────

export async function portalLoginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ip = clientIp(new Request("http://x", { headers: await headers() }));
  const limit = rateLimit(`portal-login:${ip}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!limit.allowed) {
    return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }
  if (storageDriver() === "none") {
    return { ok: false, message: "Sign-in is not available yet. Please contact the organizers." };
  }
  const user = await checkPortalCredentials(String(formData.get("loginId") ?? ""), String(formData.get("pass") ?? ""));
  if (!user) return { ok: false, message: "That login ID and pass don't match. Check the pass card from the organizers." };
  await createPortalSession(user);
  redirect(portalHome(user.role));
}

export async function portalLogoutAction() {
  await destroyPortalSession();
  redirect("/portal/login");
}

// ── Team: solution ───────────────────────────────────────────────────────────

export type SolutionFormState = ActionResult<{ errors?: Record<string, string>; values?: Record<string, string> }>;

export async function saveSolutionAction(_prev: SolutionFormState, formData: FormData): Promise<SolutionFormState> {
  const team = await requireTeam();
  const settings = await readFinalsSettings();
  // Sent back so the form keeps what was typed (React resets forms after an action).
  const values = Object.fromEntries(
    ["title", "summary", "techStack", "repoUrl", "demoUrl", "videoUrl", "deckUrl"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  if (!settings.submissionsOpen) {
    return { ok: false, message: "Submissions are closed. Your last saved version is the one the moderators review." };
  }
  const parsed = solutionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", data: { errors: fieldErrors(parsed.error), values } };
  }
  const v = parsed.data;
  try {
    const existing = await findSolution(team.id);
    const now = new Date().toISOString();
    await saveSolution({
      team_id: team.id,
      title: v.title,
      summary: v.summary,
      tech_stack: v.techStack,
      repo_url: v.repoUrl,
      demo_url: v.demoUrl,
      video_url: v.videoUrl,
      deck_url: v.deckUrl,
      submitted_at: existing?.submitted_at ?? now,
      updated_at: now,
    });
  } catch (err) {
    console.error("[finals] saving solution failed", err);
    return { ok: false, message: "Your solution could not be saved. Please try again in a moment.", data: { values } };
  }
  return { ok: true, message: "Saved. The moderators will review this version.", data: { values } };
}

// ── Moderator: scoring and live review ───────────────────────────────────────

export async function saveScoreAction(
  teamId: string,
  marks: Record<string, number>,
  comment: string,
): Promise<ActionResult<{ total: number; updatedAt: string }>> {
  const moderator = await requireModerator();
  const [team, settings] = await Promise.all([findTeam(teamId), readFinalsSettings()]);
  if (!team) return { ok: false, message: "That team no longer exists." };
  const clean: Record<string, number> = {};
  for (const c of settings.criteria) {
    const n = Number(marks?.[c.key]);
    if (!Number.isFinite(n) || n < 0 || n > c.max) {
      return { ok: false, message: `${c.label} needs a mark from 0 to ${c.max}.` };
    }
    // Half marks are allowed.
    clean[c.key] = Math.round(n * 2) / 2;
  }
  const updatedAt = new Date().toISOString();
  try {
    await saveScore({
      id: `${team.id}:${moderator.id}`,
      team_id: team.id,
      moderator_id: moderator.id,
      marks: clean,
      comment: String(comment ?? "").trim().slice(0, 2000),
      updated_at: updatedAt,
    });
  } catch (err) {
    console.error("[finals] saving score failed", err);
    return { ok: false, message: "The marks could not be saved. Please try again." };
  }
  return {
    ok: true,
    message: settings.leaderboardEnabled ? "Marks saved and live on the leaderboard." : "Marks saved.",
    data: { total: scoreTotal(clean, settings.criteria), updatedAt },
  };
}

/** Puts a team "on stage" on the public leaderboard, or clears it (null). */
export async function setLiveReviewAction(teamId: string | null): Promise<ActionResult> {
  await requireModerator();
  if (teamId && !(await findTeam(teamId))) return { ok: false, message: "That team no longer exists." };
  try {
    await writeFinalsSettings({ ...(await readFinalsSettings()), nowReviewing: teamId });
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  return { ok: true, message: teamId ? "This team is now shown as live on the leaderboard." : "Live review ended." };
}
