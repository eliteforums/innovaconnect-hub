import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteContentFresh } from "@/lib/content";
import { buildLeaderboard, TIERS } from "@/lib/finals";
import { requireAdmin } from "@/lib/server/admin-auth";
import { loadFinals } from "@/lib/server/finals-store";
import { FinalsControls } from "@/components/admin/finals/FinalsControls";
import { ResultsTable } from "@/components/admin/finals/ResultsTable";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function FinalsPage() {
  await requireAdmin();
  let data: Awaited<ReturnType<typeof loadFinals>>;
  try {
    data = await loadFinals();
  } catch (err) {
    return (
      <p role="alert" className="max-w-3xl border-2 border-best bg-best/5 p-4">
        {(err as Error).message}
      </p>
    );
  }
  const content = await getSiteContentFresh();
  const board = buildLeaderboard({ ...data, revealTiers: true, includeMarks: true });
  const domains = Object.fromEntries(content.domains.list.map((d) => [d.slug, d.name]));
  // Winner places per tier, from the awards in Event settings (Tier 1 = first award…).
  const capacity = TIERS.map((tier, i) => {
    const award = content.event.awards[i];
    return { tier, total: award?.winnerCount ?? null, offline: award?.split?.offline ?? null, online: award?.split?.online ?? null };
  });
  const submitted = data.solutions.length;
  const reviewed = board.entries.filter((e) => e.reviews > 0).length;

  return (
    <div className="max-w-7xl">
      <p className="kicker text-burgundy">Live final</p>
      <h1 className="headline mt-2 text-5xl">Controls &amp; results</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        Switch the public leaderboard on when the offline round starts, choose which team is being reviewed live, and
        pick the Tier 1, 2 and 3 winners. Changes reach the{" "}
        <a href="/leaderboard" target="_blank" className="underline underline-offset-4">
          leaderboard
        </a>{" "}
        within five seconds.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-4">
        <Stat label="Finalist teams" value={data.teams.length} href="/admin/finals/teams" />
        <Stat label="Solutions submitted" value={submitted} href="/admin/finals/solutions" />
        <Stat label="Teams reviewed" value={reviewed} href="/admin/finals/solutions" />
        <Stat label="Moderators" value={data.moderators.length} href="/admin/finals/moderators" />
      </ul>

      <FinalsControls settings={data.settings} teams={data.teams.map((t) => ({ id: t.id, name: t.name }))} />

      <section aria-labelledby="results-title" className="mt-12">
        <h2 id="results-title" className="headline text-3xl">
          Results &amp; winners
        </h2>
        <p className="mt-2 max-w-3xl text-charcoal">
          Ranked by the average of every moderator&apos;s total. Choose a tier for each winning team; the leaderboard shows
          the winners once you publish them above.
        </p>
        <ResultsTable board={board} domains={domains} capacity={capacity} />
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <li>
      <Link href={href} className="group block border-2 border-ink bg-paper-white p-5 transition-colors hover:bg-taxi">
        <p className="kicker text-[0.6875rem] text-muted group-hover:text-ink">{label}</p>
        <p className="headline mt-2 text-5xl">{value}</p>
        <p className="mt-2 flex items-center gap-1 text-sm font-semibold">
          Manage <ArrowRight aria-hidden className="size-4" />
        </p>
      </Link>
    </li>
  );
}
