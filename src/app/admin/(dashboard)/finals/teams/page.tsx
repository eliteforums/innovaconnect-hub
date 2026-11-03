import { getSiteContentFresh } from "@/lib/content";
import { teamInfo } from "@/lib/finals";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listSubmissions } from "@/lib/server/admin-store";
import { listSolutions, listTeams } from "@/lib/server/finals-store";
import { TeamsManager, type RegistrationOption } from "@/components/admin/finals/TeamsManager";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

type RegistrationPayload = {
  team?: { name?: string; members?: { fullName?: string }[] };
  lead?: { fullName?: string; email?: string };
  domain?: string;
};

export default async function FinalistTeamsPage() {
  await requireAdmin();
  let teams: Awaited<ReturnType<typeof listTeams>> = [];
  let submitted: string[] = [];
  let error: string | null = null;
  try {
    [teams, submitted] = await Promise.all([listTeams(), listSolutions().then((s) => s.map((x) => x.team_id))]);
  } catch (err) {
    error = (err as Error).message;
  }
  const registrations: RegistrationOption[] = (await listSubmissions("registrations").catch(() => [])).map((r) => {
    const p = r.payload as RegistrationPayload;
    return {
      id: r.id,
      name: p.team?.name ?? r.email,
      domain: p.domain ?? "",
      email: p.lead?.email ?? r.email,
      members: [p.lead?.fullName, ...(p.team?.members ?? []).map((m) => m.fullName)].filter(Boolean).join(", "),
    };
  });
  const content = await getSiteContentFresh();

  return (
    <div className="max-w-7xl">
      <p className="kicker text-burgundy">Live final</p>
      <h1 className="headline mt-2 text-5xl">Finalist teams</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        Every finalist team gets a login ID and pass for the{" "}
        <a href="/portal/login" target="_blank" className="underline underline-offset-4">
          finalist portal
        </a>
        , where it submits its solution. Passes are shown only once, when they are issued: download or print them straight
        away. A lost pass can be replaced with a new one.
      </p>
      {error ? (
        <p role="alert" className="mt-6 border-2 border-best bg-best/5 p-4">
          {error}
        </p>
      ) : (
        <TeamsManager
          teams={teams.map(teamInfo)}
          submitted={submitted}
          registrations={registrations}
          domains={content.domains.list.map((d) => ({ slug: d.slug, name: d.name }))}
        />
      )}
    </div>
  );
}
