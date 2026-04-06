import { createClient } from "@supabase/supabase-js";

// Accept any of the common Supabase key variable names so the app works
// regardless of which one is set in .env / .env.local
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || "";

const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  "";

if (!supabaseUrl) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL is not set. " +
      "Create a .env file with your Supabase project URL — see supabase/INSTRUCTIONS.md.",
  );
}

if (!supabaseAnonKey) {
  console.warn(
    "[Supabase] No Supabase API key found. Set one of these in your .env file:\n" +
      "  VITE_SUPABASE_ANON_KEY\n" +
      "  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY\n" +
      "See supabase/INSTRUCTIONS.md for details.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type TeamType = "solo" | "duo" | "trio" | "quad";

export type MemberDetails = {
  full_name: string;
  email: string;
  contact_no: string;
  city: string;
  organisation_name: string;
  year_or_experience: string;
  branch_or_department: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
};

export type Registration = {
  id?: string;
  // Personal
  full_name: string;
  email: string;
  contact_no: string;
  city: string;
  resume_url?: string;
  // Academic
  organisation_name: string;
  year_or_experience: string;
  branch_or_department: string;
  // Skills
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
  // Team
  team_type: TeamType;
  team_members: MemberDetails[];
  // Meta
  consent: boolean;
  status?: "pending" | "shortlisted" | "rejected" | "confirmed";
  notes?: string;
  created_at?: string;
};

export type ContactInquiry = {
  id?: string;
  name: string;
  email: string;
  company?: string;
  category?: string;
  subject: string;
  message: string;
  status?: "new" | "read" | "replied" | "archived";
  created_at?: string;
};

export type SiteContent = {
  id?: string;
  section: string;
  content: Record<string, unknown>;
  updated_at?: string;
  updated_by?: string;
};

export type Sponsor = {
  id?: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  category: string;
  track?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────

export const adminSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const adminSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// ─────────────────────────────────────────────
// Site Content helpers
// ─────────────────────────────────────────────

export const fetchSiteContent = async (section: string) => {
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("section", section)
    .single();
  return { data: data?.content ?? null, error };
};

export const fetchAllSiteContent = async () => {
  const { data, error } = await supabase
    .from("site_content")
    .select("section, content, updated_at");
  return { data, error };
};

export const upsertSiteContent = async (
  section: string,
  content: Record<string, unknown>,
  adminEmail?: string,
) => {
  const { data, error } = await supabase
    .from("site_content")
    .upsert(
      {
        section,
        content,
        updated_at: new Date().toISOString(),
        updated_by: adminEmail,
      },
      { onConflict: "section" },
    )
    .select()
    .single();
  return { data, error };
};

// ─────────────────────────────────────────────
// Registration helpers
// ─────────────────────────────────────────────

export const submitRegistration = async (registration: Registration) => {
  const { data, error } = await supabase
    .from("registrations")
    .insert(registration)
    .select()
    .single();
  return { data, error };
};

export const fetchRegistrations = async () => {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const updateRegistrationStatus = async (
  id: string,
  status: Registration["status"],
  notes?: string,
) => {
  const { data, error } = await supabase
    .from("registrations")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

export const deleteRegistration = async (id: string) => {
  const { error } = await supabase.from("registrations").delete().eq("id", id);
  return { error };
};

// ─────────────────────────────────────────────
// Contact Inquiries helpers
// ─────────────────────────────────────────────

export const submitContactInquiry = async (inquiry: ContactInquiry) => {
  const { data, error } = await supabase
    .from("contact_inquiries")
    .insert(inquiry)
    .select()
    .single();
  return { data, error };
};

export const fetchContactInquiries = async () => {
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const updateInquiryStatus = async (
  id: string,
  status: ContactInquiry["status"],
) => {
  const { data, error } = await supabase
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

// ─────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────

export const uploadResume = async (file: File, registrationId: string) => {
  const ext = file.name.split(".").pop();
  const path = `${registrationId}/resume.${ext}`;
  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(path, file, { upsert: true });
  return { data, path, error };
};

export const getResumeUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60); // 1 hour expiry
  return data?.signedUrl ?? null;
};

export const uploadSponsorLogo = async (file: File, sponsorId: string) => {
  const ext = file.name.split(".").pop();
  const path = `${sponsorId}.${ext}`;
  const { data, error } = await supabase.storage
    .from("sponsors")
    .upload(path, file, { upsert: true });
  if (data) {
    const { data: urlData } = supabase.storage
      .from("sponsors")
      .getPublicUrl(path);
    return { url: urlData.publicUrl, error };
  }
  return { url: null, error };
};

// ─────────────────────────────────────────────
// Sponsors helpers
// ─────────────────────────────────────────────

export const fetchSponsors = async () => {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return { data, error };
};

export const fetchAllSponsors = async () => {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("sort_order");
  return { data, error };
};

export const upsertSponsor = async (sponsor: Sponsor) => {
  const { data, error } = await supabase
    .from("sponsors")
    .upsert(sponsor)
    .select()
    .single();
  return { data, error };
};

export const deleteSponsor = async (id: string) => {
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  return { error };
};
