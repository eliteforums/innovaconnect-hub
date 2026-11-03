import Link from "next/link";
import { getSiteContentFresh } from "@/lib/content";
import { findSolution, publicLeaderboard, readFinalsSettings } from "@/lib/server/finals-store";
import { requireTeam } from "@/lib/server/portal-auth";
import { PortalShell } from "@/components/finals/PortalShell";
import { SolutionForm } from "@/components/finals/SolutionForm";

// Portal pages read the session on every request and redirect when signed out.
export const instant = false;

export const metadata = { title: "Your solution" };

export default async function TeamPortalPage() {
  const team = await requireTeam();
  const [solution, settings, board, content] = await Promise.all([
    findSolution(team.id),
    readFinalsSettings(),
    publicLeaderboard().catch(() => null),
    getSiteContentFresh(),
  ]);
  const domain = content.domains.list.find((d) => d.slug === team.domain)?.name ?? team.domain;
  const standing = board?.entries.find((e) => e.id === team.id);

  return (
    <PortalShell role="team" name={team.name} loginId={team.login_id}>
      <p className="kicker text-burgundy">Finalist team</p>
      <h1 className="headline mt-2 text-5xl">{team.name}</h1>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        <Info label="Domain" value={domain} />
        <Info label="Final round" value={team.mode === "offline" ? "Offline (on site)" : "Online"} />
        <Info
          label="Solution"
          value={solution ? `Submitted ${new Date(solution.updated_at).toLocaleString("en-IN")}` : "Not submitted yet"}
          warn={!solution}
        />
        <Info label="Submissions" value={settings.submissionsOpen ? "Open" : "Closed"} warn={!settings.submissionsOpen} />
      </dl>

      {standing && (
        <section aria-labelledby="standing-title" className="mt-8 border-2 border-ink bg-paper-white p-5">
          <h2 id="standing-title" className="label text-[0.75rem]">
            Your standing (live)
          </h2>
          <p className="mt-2 text-lg">
            {standing.average === null ? (
              "Awaiting review by the moderators."
            ) : (
              <>
                Rank <strong>{standing.rank}</strong> · average <strong>{standing.average}</strong> / {board!.maxTotal} from{" "}
                {standing.reviews} review{standing.reviews === 1 ? "" : "s"}
                {standing.tier ? <> · <strong>Tier {standing.tier} winner</strong></> : null}
              </>
            )}
          </p>
          <Link href="/leaderboard" className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-burgundy">
            See the full leaderboard
          </Link>
        </section>
      )}

      <section aria-labelledby="solution-title" className="mt-10">
        <h2 id="solution-title" className="headline text-3xl">
          Your solution
        </h2>
        <p className="mt-2 max-w-3xl text-charcoal">
          {settings.submissionsOpen
            ? "Submit your project for the final. You can update it as often as you like until submissions close; the moderators review the latest saved version."
            : "Submissions are closed. This is the version the moderators review."}
        </p>
        <div className="mt-6 max-w-3xl border-2 border-ink bg-paper-white p-5 sm:p-8">
          <SolutionForm
            open={settings.submissionsOpen}
            initial={{
              title: solution?.title ?? "",
              summary: solution?.summary ?? "",
              techStack: solution?.tech_stack ?? "",
              repoUrl: solution?.repo_url ?? "",
              demoUrl: solution?.demo_url ?? "",
              videoUrl: solution?.video_url ?? "",
              deckUrl: solution?.deck_url ?? "",
            }}
          />
        </div>
      </section>
    </PortalShell>
  );
}

function Info({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`border-2 border-ink p-4 ${warn ? "bg-taxi/40" : "bg-paper-white"}`}>
      <dt className="kicker text-[0.5625rem] text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
