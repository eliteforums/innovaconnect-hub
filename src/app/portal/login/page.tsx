import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalUser, portalHome } from "@/lib/server/portal-auth";
import { PortalLoginForm } from "@/components/finals/PortalLoginForm";

// Portal pages read the session on every request and redirect when signed out.
export const instant = false;

export const metadata = { title: "Finalist sign-in" };

export default async function PortalLoginPage() {
  const user = await getPortalUser();
  if (user) redirect(portalHome(user.role));
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="headline block text-center text-5xl">
          INNOVAHACK
        </Link>
        <p className="mt-2 text-center kicker text-burgundy">Finalists &amp; moderators</p>
        <h1 className="sr-only">Sign in to the finalist portal</h1>
        <div className="mt-8 border-2 border-ink bg-paper-white p-6 shadow-[6px_6px_0_0_var(--color-ink)]">
          <PortalLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Use the login ID and pass on the card the organizers gave your team. Lost it? Ask an organizer at the help desk
          for a new pass.
        </p>
        <p className="mt-3 text-center text-sm">
          <Link href="/leaderboard" className="underline underline-offset-4 hover:text-burgundy">
            View the live leaderboard
          </Link>
        </p>
      </div>
    </main>
  );
}
