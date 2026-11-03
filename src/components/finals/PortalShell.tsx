import Link from "next/link";
import { portalLogoutAction } from "@/app/portal/actions";

/** Frame for signed-in team and moderator pages. */
export function PortalShell({
  role,
  name,
  loginId,
  children,
}: {
  role: "team" | "moderator";
  name: string;
  loginId: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div>
            <Link href={role === "team" ? "/portal/team" : "/portal/moderator"} className="headline text-2xl leading-none text-paper-white">
              INNOVAHACK
            </Link>
            <p className="mt-1 kicker text-[0.625rem] text-taxi">
              {role === "team" ? "Finalist team" : "Moderator"} · {name} · <span className="font-mono">{loginId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" target="_blank" className="text-sm text-taxi underline underline-offset-4">
              Live leaderboard ↗
            </Link>
            <form action={portalLogoutAction}>
              <button type="submit" className="border border-paper/40 px-2.5 py-1.5 kicker text-[0.625rem] hover:bg-paper hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
    </>
  );
}
