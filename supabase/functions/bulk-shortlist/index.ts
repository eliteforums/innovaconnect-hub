import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Types ---

interface BulkShortlistResponse {
  shortlisted: number;
  unmatched: number;
  skipped_duplicates: number;
  unmatched_emails: string[];
}

// --- CSV Parsing ---

/**
 * Parse a single CSV line, handling quoted fields with commas and escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote (double quote)
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  // Push the last field
  fields.push(current.trim());
  return fields;
}

/**
 * Parse CSV text into headers and data rows.
 */
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => parseCsvLine(line));

  return { headers, rows };
}

// --- CORS ---

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

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    // Validate Authorization header
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

    // Verify caller has super_admin role
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

    // Extract CSV content from request body
    let csvText = "";
    const contentType = req.headers.get("Content-Type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart/form-data upload
      const formData = await req.formData();
      const file = formData.get("file") || formData.get("csv");
      if (!file || !(file instanceof File)) {
        return new Response(
          JSON.stringify({ error: "No CSV file found in form data. Use field name 'file' or 'csv'." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      csvText = await file.text();
    } else if (contentType.includes("text/csv")) {
      csvText = await req.text();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      csvText = body.csv || "";
    } else {
      // Fallback: try to read as text
      csvText = await req.text();
    }

    if (!csvText || csvText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "CSV file is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse CSV
    const { headers, rows } = parseCsv(csvText);

    // Validate: must have 'email' header
    if (!headers.includes("email")) {
      return new Response(
        JSON.stringify({ error: "CSV is missing required 'email' column header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate: must have at least one data row
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "CSV must have at least one data row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate: must not exceed 1000 rows
    if (rows.length > 1000) {
      return new Response(
        JSON.stringify({ error: "CSV must not exceed 1,000 data rows" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract emails from CSV
    const emailIndex = headers.indexOf("email");
    const emails: string[] = rows
      .map((row) => (row[emailIndex] || "").trim().toLowerCase())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid email addresses found in CSV" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduplicate emails from CSV
    const uniqueEmails = [...new Set(emails)];

    // Query registrations for matching emails
    // Supabase .in() has a practical limit, so batch if needed
    const QUERY_BATCH_SIZE = 100;
    const allRegistrations: Array<{ id: string; email: string; status: string }> = [];

    for (let i = 0; i < uniqueEmails.length; i += QUERY_BATCH_SIZE) {
      const batch = uniqueEmails.slice(i, i + QUERY_BATCH_SIZE);
      const { data, error: queryError } = await supabaseAdmin
        .from("registrations")
        .select("id, email, status")
        .in("email", batch);

      if (queryError) {
        return new Response(
          JSON.stringify({ error: "Failed to query registrations: " + queryError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (data) {
        allRegistrations.push(...data);
      }
    }

    // Categorize registrations
    const pendingRegistrations: { id: string; email: string }[] = [];
    const alreadyShortlisted: string[] = [];
    const matchedEmails = new Set<string>();

    for (const reg of allRegistrations) {
      const regEmail = reg.email.toLowerCase();
      matchedEmails.add(regEmail);

      if (reg.status === "pending") {
        pendingRegistrations.push({ id: reg.id, email: regEmail });
      } else if (reg.status === "shortlisted") {
        alreadyShortlisted.push(regEmail);
      }
      // Other statuses (rejected, confirmed) are treated as already processed — skip
    }

    // Identify unmatched emails
    const unmatchedEmails = uniqueEmails.filter((email) => !matchedEmails.has(email));

    // Update pending registrations to shortlisted
    let shortlistedCount = 0;

    if (pendingRegistrations.length > 0) {
      const idsToUpdate = pendingRegistrations.map((r) => r.id);

      // Batch updates to avoid hitting query size limits
      const UPDATE_BATCH_SIZE = 100;
      for (let i = 0; i < idsToUpdate.length; i += UPDATE_BATCH_SIZE) {
        const batch = idsToUpdate.slice(i, i + UPDATE_BATCH_SIZE);
        const { error: updateError } = await supabaseAdmin
          .from("registrations")
          .update({ status: "shortlisted" })
          .in("id", batch);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update registrations: " + updateError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      shortlistedCount = pendingRegistrations.length;
    }

    // Build response
    const response: BulkShortlistResponse = {
      shortlisted: shortlistedCount,
      unmatched: unmatchedEmails.length,
      skipped_duplicates: alreadyShortlisted.length,
      unmatched_emails: unmatchedEmails,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
