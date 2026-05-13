import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Types ---

interface GenerateCredentialsRequest {
  registration_ids: string[];
}

interface GenerateCredentialsResponse {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; reason: string }>;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  contact_no: string;
  team_members: Array<{
    full_name: string;
    email: string;
    contact_no: string;
    city?: string;
    organisation_name?: string;
    year_or_experience?: string;
    branch_or_department?: string;
    skills?: string[];
    github_url?: string;
    linkedin_url?: string;
  }>;
  status: string;
  team_type: string;
  // Domain is inferred from site_content or assigned during shortlisting
  domain?: string;
}

// --- Password Generation ---

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

function generateTempPassword(length: number = 16): string {
  if (length < 12) {
    length = 12;
  }

  const randomChar = (charset: string): string =>
    charset[Math.floor(Math.random() * charset.length)];

  // Ensure at least one of each required character type
  const required = [
    randomChar(UPPERCASE),
    randomChar(LOWERCASE),
    randomChar(DIGITS),
    randomChar(SPECIAL),
  ];

  // Fill the rest with random characters from the full set
  const remaining = Array.from({ length: length - required.length }, () =>
    randomChar(ALL_CHARS)
  );

  // Combine and shuffle using Fisher-Yates
  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

// --- Team ID Generation ---

function formatTeamId(num: number): string {
  return `IH-${String(num).padStart(4, "0")}`;
}

// --- Helpers ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Main Handler ---

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Validate Authorization header — verify caller is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller has super_admin role
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !adminRole || adminRole.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: super_admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: GenerateCredentialsRequest = await req.json();

    if (!body.registration_ids || !Array.isArray(body.registration_ids) || body.registration_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "registration_ids array is required and must not be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch registrations by IDs
    const { data: registrations, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .in("id", body.registration_ids)
      .eq("status", "shortlisted");

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch registrations", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed: 0, skipped: 0, errors: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process in batches of 50
    const BATCH_SIZE = 50;
    const result: GenerateCredentialsResponse = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < registrations.length; i += BATCH_SIZE) {
      const batch = registrations.slice(i, i + BATCH_SIZE);

      // Add delay between batches (not before the first batch)
      if (i > 0) {
        await delay(1000);
      }

      for (const registration of batch) {
        try {
          const email = registration.email;

          // Step a: Check if auth account already exists → skip if yes
          // Check if a team record already exists for this email (fast DB check)
          const { data: existingTeam } = await supabaseAdmin
            .from("teams")
            .select("id")
            .eq("leader_email", email)
            .maybeSingle();

          if (existingTeam) {
            result.skipped++;
            continue;
          }

          // Step b: Generate temp password (12+ chars, mixed case, digit, special char)
          const tempPassword = generateTempPassword(16);

          // Step c: Create auth user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
          });

          if (createError || !newUser?.user) {
            // If user already exists in auth, treat as skipped
            const errMsg = createError?.message || "Failed to create auth user";
            if (errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("duplicate")) {
              result.skipped++;
            } else {
              result.failed++;
              result.errors.push({ email, reason: errMsg });
            }
            continue;
          }

          // Step d: Generate next sequential Team ID
          const { data: maxTeam } = await supabaseAdmin
            .from("teams")
            .select("team_id")
            .order("team_id", { ascending: false })
            .limit(1)
            .maybeSingle();

          let nextNumber = 1;
          if (maxTeam?.team_id) {
            const currentMax = parseInt(maxTeam.team_id.replace("IH-", ""), 10);
            nextNumber = currentMax + 1;
          }

          const teamId = formatTeamId(nextNumber);

          // Step e: INSERT into teams table
          const teamName = `${registration.full_name} Team`;
          const domain = registration.domain || "general";

          const { data: teamRecord, error: teamError } = await supabaseAdmin
            .from("teams")
            .insert({
              team_id: teamId,
              team_name: teamName,
              leader_id: newUser.user.id,
              leader_email: email,
              domain,
              status: "active",
              must_change_password: true,
              registration_id: registration.id,
            })
            .select()
            .single();

          if (teamError || !teamRecord) {
            result.failed++;
            result.errors.push({
              email,
              reason: teamError?.message || "Failed to create team record",
            });
            continue;
          }

          // Step f: INSERT into team_members table (from registration's team_members JSON)
          const members: Array<{
            team_id: string;
            member_name: string;
            email: string;
            phone: string;
            role: string;
          }> = [];

          // Add the leader as a team member
          members.push({
            team_id: teamRecord.id,
            member_name: registration.full_name,
            email: registration.email,
            phone: registration.contact_no || "",
            role: "leader",
          });

          // Add other team members from the registration JSON
          const regMembers = registration.team_members || [];
          if (Array.isArray(regMembers)) {
            for (const member of regMembers) {
              members.push({
                team_id: teamRecord.id,
                member_name: member.full_name || "",
                email: member.email || "",
                phone: member.contact_no || "",
                role: "member",
              });
            }
          }

          if (members.length > 0) {
            const { error: membersError } = await supabaseAdmin
              .from("team_members")
              .insert(members);

            if (membersError) {
              // Log but don't fail the whole registration
              console.error(`Failed to insert team members for ${email}:`, membersError.message);
            }
          }

          // Step g: Queue email via calling the send-email function
          try {
            const emailPayload = {
              to: email,
              template: "credentials",
              data: {
                team_name: teamName,
                team_id: teamId,
                email: email,
                password: tempPassword,
                login_url: `${supabaseUrl.replace(".supabase.co", ".vercel.app")}/finalist/login`,
              },
              team_id: teamRecord.id,
            };

            // Call the send-email edge function
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify(emailPayload),
            });
          } catch (emailError) {
            // Email failure doesn't fail the credential generation
            console.error(`Failed to queue email for ${email}:`, emailError);
          }

          result.success++;
        } catch (err) {
          result.failed++;
          result.errors.push({
            email: registration.email || "unknown",
            reason: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
