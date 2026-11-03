import { redirect } from "next/navigation";
import { getPortalUser, portalHome } from "@/lib/server/portal-auth";

// Portal pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function PortalIndex() {
  const user = await getPortalUser();
  redirect(user ? portalHome(user.role) : "/portal/login");
}
