import { moderatorInfo } from "@/lib/finals";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listModerators, listScores, listTeams } from "@/lib/server/finals-store";
import { ModeratorsManager } from "@/components/admin/finals/ModeratorsManager";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function ModeratorsPage() {
  await requireAdmin();
  let data: { moderators: Awaited<ReturnType<typeof listModerators>>; scores: Awaited<ReturnType<typeof listScores>>; teams: number } | null = null;
  let error: string | null = null;
  try {
    const [moderators, scores, teams] = await Promise.all([listModerators(), listScores(), listTeams()]);
    data = { moderators, scores, teams: teams.length };
  } catch (err) {
    error = (err as Error).message;
  }
  const reviewed = Object.fromEntries(
    (data?.moderators ?? []).map((m) => [m.id, data!.scores.filter((s) => s.moderator_id === m.id).length]),
  );

  return (
    <div className="max-w-5xl">
      <p className="kicker text-burgundy">Live final</p>
      <h1 className="headline mt-2 text-5xl">Moderators</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        Moderators sign in to the{" "}
        <a href="/portal/login" target="_blank" className="underline underline-offset-4">
          portal
        </a>{" "}
        with their own login ID and pass, read each team&apos;s solution and give marks. Their name appears next to their
        marks on the public leaderboard. Removing a moderator also removes the marks they gave.
      </p>
      {error || !data ? (
        <p role="alert" className="mt-6 border-2 border-best bg-best/5 p-4">
          {error}
        </p>
      ) : (
        <ModeratorsManager moderators={data.moderators.map(moderatorInfo)} reviewed={reviewed} teamCount={data.teams} />
      )}
    </div>
  );
}
