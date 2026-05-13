import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────
// Type Aliases
// ─────────────────────────────────────────────

export type TeamStatus = "active" | "suspended" | "disqualified";
export type SubmissionStatus = "pending" | "under_review" | "reviewed" | "flagged";
export type NotificationAudienceType = "all" | "domain" | "team";
export type DeliverableType =
  | "github_url"
  | "pitch_deck"
  | "demo_video"
  | "documentation"
  | "proof_of_work";

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface Team {
  id: string;
  team_id: string; // IH-XXXX format
  team_name: string;
  leader_id: string;
  leader_email: string;
  domain: string;
  status: TeamStatus;
  github_url: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  member_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  domain: string;
  deadline: string | null;
  release_at: string;
  resources: ResourceFile[];
  is_updated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Submission {
  id: string;
  team_id: string;
  github_url: string | null;
  pitch_deck_url: string | null;
  video_url: string | null;
  documentation_urls: string[];
  pow_urls: string[];
  status: SubmissionStatus;
  flag_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  audience_type: NotificationAudienceType;
  audience_value: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_by: string;
  created_at: string;
}

export interface NotificationRead {
  id: string;
  notification_id: string;
  team_id: string;
  read_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  template: string;
  status: "sent" | "failed" | "pending" | "retrying";
  retries: number;
  error: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;
  role: "super_admin" | "moderator";
  created_at: string;
}

export interface AccessAuditLog {
  id: string;
  user_id: string;
  route: string;
  timestamp: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address: string | null;
  created_at: string;
}


// ─────────────────────────────────────────────
// Query Functions
// ─────────────────────────────────────────────

/**
 * Fetch paginated list of teams.
 * Uses 20 per page as specified in the team management section.
 */
export const fetchTeams = async (page = 0, pageSize = 20) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("teams")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  return { data: data as Team[] | null, error, count, page, pageSize };
};

/**
 * Fetch a single team by its UUID primary key.
 */
export const fetchTeamById = async (id: string) => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as Team | null, error };
};

/**
 * Fetch a single team by its human-readable Team ID (e.g., IH-0042).
 */
export const fetchTeamByTeamId = async (teamId: string) => {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("team_id", teamId)
    .single();
  return { data: data as Team | null, error };
};

/**
 * Fetch all members belonging to a team (by team UUID).
 */
export const fetchTeamMembers = async (teamId: string) => {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });
  return { data: data as TeamMember[] | null, error };
};

/**
 * Update a team's profile fields (github_url, etc.).
 * Only allows updating fields that team leaders are permitted to change.
 */
export const updateTeamProfile = async (
  teamId: string,
  updates: Partial<Pick<Team, "github_url">>,
) => {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single();
  return { data: data as Team | null, error };
};

/**
 * Fetch released problem statements for a given domain.
 * Only returns statements where release_at <= now().
 */
export const fetchProblemStatements = async (domain?: string) => {
  let query = supabase
    .from("problem_statements")
    .select("*")
    .lte("release_at", new Date().toISOString())
    .order("release_at", { ascending: false });

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data, error } = await query;
  return { data: data as ProblemStatement[] | null, error };
};

/**
 * Fetch a team's submission by team UUID.
 * Each team has at most one submission record.
 */
export const fetchSubmission = async (teamId: string) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("team_id", teamId)
    .single();
  return { data: data as Submission | null, error };
};

/**
 * Create or update a team's submission.
 * Uses upsert on team_id (unique constraint) to handle both insert and update.
 */
export const upsertSubmission = async (
  submission: Partial<Submission> & { team_id: string },
) => {
  const { data, error } = await supabase
    .from("submissions")
    .upsert(submission, { onConflict: "team_id" })
    .select()
    .single();
  return { data: data as Submission | null, error };
};

/**
 * Fetch notifications visible to a team.
 * Returns published notifications targeted at the team (all, matching domain, or matching team_id).
 * Ordered by published_at descending.
 */
export const fetchNotifications = async (
  teamDomain?: string,
  teamId?: string,
) => {
  let query = supabase
    .from("notifications")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  // RLS policies handle audience filtering on the server side,
  // but we can also apply client-side filtering for specificity
  if (teamDomain && teamId) {
    query = query.or(
      `audience_type.eq.all,and(audience_type.eq.domain,audience_value.eq.${teamDomain}),and(audience_type.eq.team,audience_value.eq.${teamId})`,
    );
  }

  const { data, error } = await query;
  return { data: data as Notification[] | null, error };
};

/**
 * Mark a notification as read for a specific team.
 * Inserts into notification_reads (unique constraint prevents duplicates).
 */
export const markNotificationRead = async (
  notificationId: string,
  teamId: string,
) => {
  const { data, error } = await supabase
    .from("notification_reads")
    .upsert(
      { notification_id: notificationId, team_id: teamId },
      { onConflict: "notification_id,team_id" },
    )
    .select()
    .single();
  return { data: data as NotificationRead | null, error };
};

/**
 * Fetch the count of unread notifications for a team.
 * Compares total visible notifications against notification_reads entries.
 */
export const fetchUnreadCount = async (
  teamId: string,
  teamDomain?: string,
  teamTeamId?: string,
) => {
  // Get total published notifications targeted at this team
  let notifQuery = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());

  if (teamDomain && teamTeamId) {
    notifQuery = notifQuery.or(
      `audience_type.eq.all,and(audience_type.eq.domain,audience_value.eq.${teamDomain}),and(audience_type.eq.team,audience_value.eq.${teamTeamId})`,
    );
  }

  const { count: totalCount, error: notifError } = await notifQuery;

  if (notifError) {
    return { data: 0, error: notifError };
  }

  // Get count of read notifications for this team
  const { count: readCount, error: readError } = await supabase
    .from("notification_reads")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (readError) {
    return { data: 0, error: readError };
  }

  const unread = (totalCount ?? 0) - (readCount ?? 0);
  return { data: Math.max(0, unread), error: null };
};

/**
 * Fetch email log entries with optional filtering by status.
 * Paginated with 20 per page.
 */
export const fetchEmailLog = async (
  page = 0,
  pageSize = 20,
  statusFilter?: EmailLog["status"],
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("email_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;
  return { data: data as EmailLog[] | null, error, count, page, pageSize };
};

/**
 * Fetch aggregate analytics data for the HMS dashboard.
 * Returns total teams, active teams (login within 48h), total submissions,
 * completion rate, and domain breakdown.
 */
export const fetchAnalytics = async () => {
  // Total teams
  const { count: totalTeams, error: teamsError } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true });

  if (teamsError) {
    return { data: null, error: teamsError };
  }

  // Active teams (login within last 48 hours)
  const fortyEightHoursAgo = new Date(
    Date.now() - 48 * 60 * 60 * 1000,
  ).toISOString();

  const { count: activeTeams, error: activeError } = await supabase
    .from("login_attempts")
    .select("email", { count: "exact", head: true })
    .eq("success", true)
    .gte("created_at", fortyEightHoursAgo);

  if (activeError) {
    return { data: null, error: activeError };
  }

  // Submissions data for completion rate calculation
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("github_url, pitch_deck_url, video_url, documentation_urls, pow_urls");

  if (submissionsError) {
    return { data: null, error: submissionsError };
  }

  const totalSubmissions = submissions?.length ?? 0;

  // Calculate completion rate: teams with all 5 deliverables submitted
  const completeSubmissions =
    submissions?.filter(
      (s) =>
        s.github_url &&
        s.pitch_deck_url &&
        s.video_url &&
        (s.documentation_urls as string[])?.length > 0 &&
        (s.pow_urls as string[])?.length > 0,
    ).length ?? 0;

  const completionRate =
    totalTeams && totalTeams > 0
      ? Math.round((completeSubmissions / totalTeams) * 100)
      : 0;

  // Domain breakdown
  const { data: teamsByDomain, error: domainError } = await supabase
    .from("teams")
    .select("domain");

  if (domainError) {
    return { data: null, error: domainError };
  }

  const { data: submissionsByTeam, error: subDomainError } = await supabase
    .from("submissions")
    .select("team_id, teams(domain)")
    .not("team_id", "is", null);

  if (subDomainError) {
    return { data: null, error: subDomainError };
  }

  // Aggregate domain breakdown
  const domainBreakdown: Record<string, { teams: number; submissions: number }> = {};

  teamsByDomain?.forEach((t) => {
    if (!domainBreakdown[t.domain]) {
      domainBreakdown[t.domain] = { teams: 0, submissions: 0 };
    }
    domainBreakdown[t.domain].teams += 1;
  });

  submissionsByTeam?.forEach((s: any) => {
    const domain = s.teams?.domain;
    if (domain && domainBreakdown[domain]) {
      domainBreakdown[domain].submissions += 1;
    }
  });

  return {
    data: {
      totalTeams: totalTeams ?? 0,
      activeTeams: activeTeams ?? 0,
      totalSubmissions,
      completionRate,
      domainBreakdown,
    },
    error: null,
  };
};
