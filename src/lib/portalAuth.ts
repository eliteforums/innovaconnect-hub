import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type PortalRole =
  | "participant"
  | "community_partner"
  | "college_partner"
  | "sponsor"
  | null;

export type PortalUser = {
  id: string;
  email: string;
  role: PortalRole;
  profileData: Record<string, unknown> | null;
};

// ─────────────────────────────────────────────
// Role resolution
// Checks each relevant table in priority order to determine
// the authenticated user's role and load their profile data.
// ─────────────────────────────────────────────

export async function resolveUserRole(email: string): Promise<{
  role: PortalRole;
  profileData: Record<string, unknown> | null;
}> {
  // 1. Check registrations → participant
  const { data: reg } = await supabase
    .from("registrations")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (reg) {
    return { role: "participant", profileData: reg as Record<string, unknown> };
  }

  // 2. Check community_partners → community_partner (must be approved)
  const { data: cp } = await supabase
    .from("community_partners")
    .select("*")
    .eq("email", email)
    .eq("status", "approved")
    .single();

  if (cp) {
    return {
      role: "community_partner",
      profileData: cp as Record<string, unknown>,
    };
  }

  // 3. Check partner_proposals for college_partner type
  const { data: college } = await supabase
    .from("partner_proposals")
    .select("*")
    .eq("email", email)
    .eq("proposal_type", "college_partner")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (college) {
    return {
      role: "college_partner",
      profileData: college as Record<string, unknown>,
    };
  }

  // 4. Check partner_proposals for sponsor / hiring types
  const { data: sponsor } = await supabase
    .from("partner_proposals")
    .select("*")
    .eq("email", email)
    .in("proposal_type", [
      "hiring_partner",
      "tech_partner",
      "education_partner",
      "domain_sponsor",
    ])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (sponsor) {
    return {
      role: "sponsor",
      profileData: sponsor as Record<string, unknown>,
    };
  }

  return { role: null, profileData: null };
}
