import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/hms";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface LockoutStatus {
  locked: boolean;
  unlockAt?: Date;
}

export interface FinalistSignInResult {
  success: boolean;
  mustChangePassword: boolean;
  team: Team | null;
  error: string | null;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const TEAM_ID_PATTERN = /^IH-\d{4}$/;

// ─────────────────────────────────────────────
// Auth Helper Functions
// ─────────────────────────────────────────────

/**
 * Resolves a Team ID (IH-XXXX format) to the team leader's email address.
 * Returns null if the Team ID does not exist.
 */
export async function resolveTeamId(teamId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("leader_email")
    .eq("team_id", teamId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.leader_email;
}

/**
 * Checks if an account is locked out due to too many failed login attempts.
 * An account is locked if there are 5 or more failed attempts within the last 15 minutes.
 * Returns the lockout status and the time when the lockout expires.
 */
export async function checkLockout(email: string): Promise<LockoutStatus> {
  const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_WINDOW_MS);

  const { count } = await supabase
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("created_at", fifteenMinutesAgo.toISOString());

  if ((count ?? 0) >= LOCKOUT_THRESHOLD) {
    // Find the most recent failure to calculate unlock time
    const { data } = await supabase
      .from("login_attempts")
      .select("created_at")
      .eq("email", email)
      .eq("success", false)
      .order("created_at", { ascending: false })
      .limit(1);

    const unlockAt = data?.[0]
      ? new Date(new Date(data[0].created_at).getTime() + LOCKOUT_WINDOW_MS)
      : undefined;

    return { locked: true, unlockAt };
  }

  return { locked: false };
}

/**
 * Records a login attempt (success or failure) for the given email.
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
): Promise<void> {
  await supabase.from("login_attempts").insert({
    email,
    success,
    ip_address: null, // IP is only available server-side (Edge Functions)
  });
}

/**
 * Checks whether a user must change their password on login.
 * Queries the teams table for the must_change_password flag.
 */
export async function checkMustChangePassword(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("teams")
    .select("must_change_password")
    .eq("leader_id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.must_change_password;
}

/**
 * Handles finalist sign-in with either email or Team ID.
 *
 * Flow:
 * 1. Detect if identifier is a Team ID (IH-XXXX format) → resolve to email
 * 2. Check lockout status before attempting auth
 * 3. If locked, return error with unlock time
 * 4. Attempt sign in via supabase.auth.signInWithPassword
 * 5. Record login attempt (success or failure)
 * 6. On success, check if must_change_password is true
 * 7. Return result with success status, mustChangePassword flag, team data, and error
 */
export async function finalistSignIn(
  identifier: string,
  password: string,
): Promise<FinalistSignInResult> {
  // Step 1: Resolve identifier to email
  let email: string;

  if (TEAM_ID_PATTERN.test(identifier)) {
    const resolvedEmail = await resolveTeamId(identifier);
    if (!resolvedEmail) {
      // Return generic error — don't reveal that Team ID doesn't exist (Req 4.3)
      return {
        success: false,
        mustChangePassword: false,
        team: null,
        error: "Invalid credentials. Please check your email/Team ID and password.",
      };
    }
    email = resolvedEmail;
  } else {
    email = identifier;
  }

  // Step 2: Check lockout status
  const lockout = await checkLockout(email);

  if (lockout.locked) {
    const unlockTime = lockout.unlockAt
      ? lockout.unlockAt.toLocaleTimeString()
      : "15 minutes";
    return {
      success: false,
      mustChangePassword: false,
      team: null,
      error: `Account is temporarily locked due to too many failed attempts. Please try again after ${unlockTime}.`,
    };
  }

  // Step 3: Attempt sign in
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    // Record failed attempt
    await recordLoginAttempt(email, false);

    // Return generic error — don't reveal whether email or password was wrong (Req 4.4)
    return {
      success: false,
      mustChangePassword: false,
      team: null,
      error: "Invalid credentials. Please check your email/Team ID and password.",
    };
  }

  // Step 4: Record successful attempt
  await recordLoginAttempt(email, true);

  // Step 5: Fetch team data
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("leader_id", authData.user.id)
    .single();

  // Step 6: Check must_change_password flag
  const mustChangePassword = team?.must_change_password ?? false;

  return {
    success: true,
    mustChangePassword,
    team: team as Team | null,
    error: null,
  };
}
