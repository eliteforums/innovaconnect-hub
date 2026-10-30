import { AlertTriangle } from "lucide-react";
import { requireAdmin, usingDefaultCredentials } from "@/lib/server/admin-auth";
import { sectionInfo, sectionKeys } from "@/lib/content";
import { COLLECTIONS } from "@/lib/server/admin-store";
import { AdminNav, type NavGroup } from "@/components/admin/AdminNav";
import { collectionLabels } from "@/components/admin/collections";
import { logoutAction } from "../actions";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const contentGroups = new Map<string, { label: string; href: string }[]>();
  for (const key of sectionKeys) {
    const info = sectionInfo[key];
    const list = contentGroups.get(info.group) ?? [];
    list.push({ label: info.label, href: `/admin/content/${key}` });
    contentGroups.set(info.group, list);
  }
  const groups: NavGroup[] = [
    { title: "Dashboard", items: [{ label: "Overview", href: "/admin" }] },
    {
      title: "Form submissions",
      items: COLLECTIONS.map((c) => ({ label: collectionLabels[c].title, href: `/admin/submissions/${c}` })),
    },
    ...Array.from(contentGroups, ([title, items]) => ({ title: `Edit · ${title}`, items })),
    { title: "Media", items: [{ label: "Image library", href: "/admin/media" }] },
  ];

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="border-b-2 border-ink bg-ink text-paper lg:sticky lg:top-0 lg:h-dvh lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r-2">
        <div className="flex items-center justify-between gap-3 border-b border-paper/20 px-5 py-4">
          <div>
            <p className="headline text-2xl leading-none text-paper-white">INNOVAHACK</p>
            <p className="mt-1 kicker text-[0.625rem] text-taxi">Admin · {admin.username}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="border border-paper/40 px-2.5 py-1.5 kicker text-[0.625rem] hover:bg-paper hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
        <AdminNav groups={groups} />
      </aside>
      <div className="min-w-0 flex-1">
        {usingDefaultCredentials() && (
          <p className="flex items-start gap-2 border-b-2 border-ink bg-taxi px-6 py-3 text-sm font-medium">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            You are signed in with the default admin / admin credentials. Before the site is public, set ADMIN_USERNAME and
            ADMIN_PASSWORD in the environment — anyone who guesses the defaults can edit the site and read submissions.
          </p>
        )}
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
