import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Types ---

interface SendEmailRequest {
  to: string;
  template: "credentials" | "announcement" | "reminder";
  data: Record<string, string>;
  team_id?: string;
}

interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// --- Rate Limiter ---

let sendCount = 0;
let windowStart = Date.now();

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - windowStart >= 1000) {
    sendCount = 0;
    windowStart = now;
  }
  if (sendCount >= 10) {
    return false;
  }
  sendCount++;
  return true;
}

async function waitForRateLimit(): Promise<void> {
  while (!checkRateLimit()) {
    const waitTime = 1000 - (Date.now() - windowStart);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    // Reset window after waiting
    sendCount = 0;
    windowStart = Date.now();
    sendCount++;
    break;
  }
}

// --- Email Validation ---

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// --- Template Rendering ---

function getEmailContent(
  template: string,
  data: Record<string, string>
): { subject: string; html: string } {
  switch (template) {
    case "credentials":
      return {
        subject: "Welcome to InnovaHack! Your Team Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to InnovaHack!</h1>
            <p>Congratulations! Your team has been shortlisted as a finalist.</p>
            <p>Here are your login credentials:</p>
            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Team ID</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.team_id || ""}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Temporary Password</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-family: monospace;">${data.password || ""}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Login URL</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">
                  <a href="${data.login_url || ""}" style="color: #2563eb;">${data.login_url || ""}</a>
                </td>
              </tr>
            </table>
            <p style="color: #6b7280; font-size: 14px;">
              You will be required to change your password on first login.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you did not expect this email, please ignore it.
            </p>
          </div>
        `,
      };

    case "announcement":
      return {
        subject: data.title || "InnovaHack Announcement",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">${data.title || "Announcement"}</h1>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${data.message || ""}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              — The InnovaHack Team
            </p>
          </div>
        `,
      };

    case "reminder":
      return {
        subject: `InnovaHack Reminder: ${data.title || ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b;">⏰ Reminder: ${data.title || ""}</h1>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${data.message || ""}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              — The InnovaHack Team
            </p>
          </div>
        `,
      };

    default:
      return {
        subject: "InnovaHack Notification",
        html: `<p>${data.message || ""}</p>`,
      };
  }
}

// --- Retry with Exponential Backoff ---

async function sendWithRetry(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string
): Promise<{ success: boolean; message_id?: string; error?: string; retries: number }> {
  const backoffDelays = [2000, 4000, 8000]; // 2s, 4s, 8s
  let lastError = "";
  let retries = 0;

  // First attempt
  const firstResult = await callResendApi(to, subject, html, resendApiKey);
  if (firstResult.success) {
    return { success: true, message_id: firstResult.message_id, retries: 0 };
  }

  lastError = firstResult.error || "Unknown error";

  // Retry up to 3 times
  for (let i = 0; i < backoffDelays.length; i++) {
    retries = i + 1;
    await new Promise((resolve) => setTimeout(resolve, backoffDelays[i]));

    const result = await callResendApi(to, subject, html, resendApiKey);
    if (result.success) {
      return { success: true, message_id: result.message_id, retries };
    }
    lastError = result.error || "Unknown error";
  }

  return { success: false, error: lastError, retries };
}

async function callResendApi(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "InnovaHack <noreply@eliteforums.in>",
        to: [to],
        subject,
        html,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, message_id: result.id };
    }

    const errorBody = await response.text();
    return {
      success: false,
      error: `Resend API error (${response.status}): ${errorBody}`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// --- Main Handler ---

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: SendEmailRequest = await req.json();
    const { to, template, data, team_id } = body;

    // Validate required fields
    if (!to || !template || !data) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, template, data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate template type
    if (!["credentials", "announcement", "reminder"].includes(template)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid template. Must be one of: credentials, announcement, reminder" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format — reject immediately if invalid (no retry)
    if (!isValidEmail(to)) {
      // Log the invalid email attempt
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("email_log").insert({
        recipient: to,
        template,
        status: "failed",
        retries: 0,
        error: "Invalid email format",
        team_id: team_id || null,
      });

      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" } as SendEmailResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    await waitForRateLimit();

    // Get environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build email content from template
    const { subject, html } = getEmailContent(template, data);

    // Log initial pending status
    const { data: logEntry, error: logError } = await supabase
      .from("email_log")
      .insert({
        recipient: to,
        template,
        status: "pending",
        retries: 0,
        error: null,
        team_id: team_id || null,
      })
      .select("id")
      .single();

    const logId = logEntry?.id;

    // Send email with retry logic
    const result = await sendWithRetry(to, subject, html, resendApiKey);

    // Update email log with final result
    if (logId) {
      await supabase
        .from("email_log")
        .update({
          status: result.success ? "sent" : "failed",
          retries: result.retries,
          error: result.error || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    // Return response
    const response: SendEmailResponse = {
      success: result.success,
      ...(result.message_id && { message_id: result.message_id }),
      ...(result.error && { error: result.error }),
    };

    return new Response(JSON.stringify(response), {
      status: result.success ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ success: false, error: `Internal error: ${errorMessage}` } as SendEmailResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
