import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/server/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="headline text-center text-5xl">INNOVAHACK</p>
        <p className="mt-2 text-center kicker text-burgundy">Admin dashboard</p>
        <div className="mt-8 border-2 border-ink bg-paper-white p-6 shadow-[6px_6px_0_0_var(--color-ink)]">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
