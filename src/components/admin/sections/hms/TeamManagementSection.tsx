import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  User,
  Mail,
  Phone,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchTeams, fetchTeamMembers, fetchSubmission } from "@/lib/hms";
import type { Team, TeamMember, Submission, TeamStatus } from "@/lib/hms";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TeamStatus, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/40",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  disqualified: "bg-red-500/20 text-red-400 border-red-500/40",
};

const STATUS_LABELS: Record<TeamStatus, string> = {
  active: "ACTIVE",
  suspended: "SUSPENDED",
  disqualified: "DISQUALIFIED",
};

function calculateSubmissionProgress(submission: Submission | null): number {
  if (!submission) return 0;
  let count = 0;
  if (submission.github_url) count++;
  if (submission.pitch_deck_url) count++;
  if (submission.video_url) count++;
  if (submission.documentation_urls && submission.documentation_urls.length > 0) count++;
  if (submission.pow_urls && submission.pow_urls.length > 0) count++;
  return Math.round((count / 5) * 100);
}

const StatusBadge = ({ status }: { status: TeamStatus }) => (
  <span
    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${STATUS_COLORS[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

const PAGE_SIZE = 20;


// ─── Team Detail View ─────────────────────────────────────────────────────────

const TeamDetail = ({
  team,
  onBack,
}: {
  team: Team;
  onBack: () => void;
}) => {
  const { data: membersResult, isLoading: membersLoading } = useQuery({
    queryKey: ["hms", "team-members", team.id],
    queryFn: () => fetchTeamMembers(team.id),
  });

  const { data: submissionResult, isLoading: submissionLoading } = useQuery({
    queryKey: ["hms", "team-submission", team.id],
    queryFn: () => fetchSubmission(team.id),
  });

  const members = membersResult?.data ?? [];
  const submission = submissionResult?.data ?? null;
  const progress = calculateSubmissionProgress(submission);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} /> BACK TO LIST
        </button>
      </div>

      {/* Team Profile */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
              {team.team_id}
            </p>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {team.team_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Domain: {team.domain} · Leader: {team.leader_email}
            </p>
          </div>
          <StatusBadge status={team.status} />
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Team ID
              </p>
              <p className="text-sm font-medium">{team.team_id}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Status
              </p>
              <StatusBadge status={team.status} />
            </div>
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Domain
              </p>
              <p className="text-sm font-medium">{team.domain}</p>
            </div>
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Submission Progress
              </p>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-secondary border border-border overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progress === 100
                        ? "bg-green-400"
                        : progress >= 50
                        ? "bg-yellow-400"
                        : progress > 0
                        ? "bg-editorial-pink"
                        : "bg-transparent"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{progress}%</span>
              </div>
            </div>
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                GitHub URL
              </p>
              {team.github_url ? (
                <a
                  href={team.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-editorial-pink hover:underline truncate block"
                >
                  {team.github_url}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div className="border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-xs text-muted-foreground">
                <span
                  title={new Date(team.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  className="cursor-help border-b border-dotted border-muted-foreground"
                >
                  {formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Users size={13} /> TEAM MEMBERS
          </p>
        </div>
        <div className="p-4">
          {membersLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              No members found
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="border border-border p-3 flex flex-wrap items-center gap-4"
                >
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <User size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{member.member_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{member.phone}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider border border-border px-2 py-0.5">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submission History */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <FileText size={13} /> SUBMISSION HISTORY
          </p>
        </div>
        <div className="p-4">
          {submissionLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !submission ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">
              No submission yet
            </p>
          ) : (
            <div className="space-y-3">
              {/* Deliverables status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { label: "GitHub URL", value: submission.github_url },
                  { label: "Pitch Deck", value: submission.pitch_deck_url },
                  { label: "Demo Video", value: submission.video_url },
                  { label: "Documentation", value: submission.documentation_urls?.length > 0 ? "Submitted" : null },
                  { label: "Proof of Work", value: submission.pow_urls?.length > 0 ? "Submitted" : null },
                ].map((item) => (
                  <div key={item.label} className="border border-border p-2 flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.value ? "bg-green-400" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {item.value ? "✓" : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timestamps */}
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>
                    Created:{" "}
                    <span
                      title={new Date(submission.created_at).toLocaleString("en-IN")}
                      className="cursor-help border-b border-dotted border-muted-foreground"
                    >
                      {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>
                    Last updated:{" "}
                    <span
                      title={new Date(submission.updated_at).toLocaleString("en-IN")}
                      className="cursor-help border-b border-dotted border-muted-foreground"
                    >
                      {formatDistanceToNow(new Date(submission.updated_at), { addSuffix: true })}
                    </span>
                  </span>
                </div>
                {submission.reviewed_at && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={11} />
                    <span>
                      Reviewed:{" "}
                      <span
                        title={new Date(submission.reviewed_at).toLocaleString("en-IN")}
                        className="cursor-help border-b border-dotted border-muted-foreground"
                      >
                        {formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Submission status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status:
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
                    submission.status === "reviewed"
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : submission.status === "flagged"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : submission.status === "under_review"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                  }`}
                >
                  {submission.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {submission.flag_reason && (
                <div className="border-2 border-red-500/30 bg-red-500/5 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                    FLAG REASON
                  </p>
                  <p className="text-sm text-foreground">{submission.flag_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity size={13} /> ACTIVITY TIMELINE
          </p>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {/* Team created */}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-editorial-pink mt-1.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Team Created</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(team.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Profile updated */}
            {team.updated_at !== team.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Profile Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(team.updated_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Submission created */}
            {submission && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Submission Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(submission.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Submission updated */}
            {submission && submission.updated_at !== submission.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Submission Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(submission.updated_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Submission reviewed */}
            {submission?.reviewed_at && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Submission Reviewed</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(submission.reviewed_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────

const TeamManagementSection = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Fetch all teams (we fetch a large batch for client-side search/filter)
  const {
    data: teamsResult,
    isLoading,
    isError,
    error: teamsError,
    refetch,
  } = useQuery({
    queryKey: ["hms", "teams", page],
    queryFn: async () => {
      const result = await fetchTeams(0, 1000);
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    retry: false,
  });

  // Fetch submissions for progress calculation
  const { data: allSubmissions } = useQuery({
    queryKey: ["hms", "all-submissions-for-teams"],
    queryFn: async () => {
      const { data, error } = await (await import("@/lib/supabase")).supabase
        .from("submissions")
        .select("team_id, github_url, pitch_deck_url, video_url, documentation_urls, pow_urls");
      if (error) throw new Error(error.message);
      return data as Array<{
        team_id: string;
        github_url: string | null;
        pitch_deck_url: string | null;
        video_url: string | null;
        documentation_urls: string[];
        pow_urls: string[];
      }>;
    },
  });

  const teams = teamsResult?.data ?? [];

  // Build a map of team_id -> submission progress
  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!allSubmissions) return map;
    for (const sub of allSubmissions) {
      let count = 0;
      if (sub.github_url) count++;
      if (sub.pitch_deck_url) count++;
      if (sub.video_url) count++;
      if (sub.documentation_urls && sub.documentation_urls.length > 0) count++;
      if (sub.pow_urls && sub.pow_urls.length > 0) count++;
      map.set(sub.team_id, Math.round((count / 5) * 100));
    }
    return map;
  }, [allSubmissions]);

  // Extract unique domains for filter
  const domains = useMemo(() => {
    const domainSet = new Set(teams.map((t) => t.domain));
    return Array.from(domainSet).sort();
  }, [teams]);

  // Apply search and filters
  const filtered = useMemo(() => {
    return teams.filter((t) => {
      // Search filter (case-insensitive substring)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.team_name.toLowerCase().includes(query);
        const matchesId = t.team_id.toLowerCase().includes(query);
        const matchesEmail = t.leader_email.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesEmail) return false;
      }

      // Domain filter
      if (domainFilter !== "all" && t.domain !== domainFilter) return false;

      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      return true;
    });
  }, [teams, searchQuery, domainFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedTeams = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleDomainChange = (value: string) => {
    setDomainFilter(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDomainFilter("all");
    setStatusFilter("all");
    setPage(0);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
            HMS
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            TEAM MANAGEMENT
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View, search, and monitor finalist team progress
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTeam ? (
          <TeamDetail
            key="detail"
            team={selectedTeam}
            onBack={() => setSelectedTeam(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Search and Filters */}
            <div className="border-2 border-border">
              <div className="bg-secondary/40 border-b border-border px-4 py-2.5">
                <p className="text-xs font-bold uppercase tracking-widest">SEARCH & FILTERS</p>
              </div>
              <div className="p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by team name, Team ID, or leader email..."
                    className="pl-9 bg-secondary border-border text-sm"
                  />
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3">
                  {/* Domain filter */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Domain
                    </label>
                    <select
                      value={domainFilter}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="block bg-secondary border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-editorial-pink/50"
                    >
                      <option value="all">All Domains</option>
                      {domains.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status filter */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="block bg-secondary border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-editorial-pink/50"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Table */}
            <div className="border-2 border-border">
              <div className="bg-secondary/40 border-b border-border px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest">TEAMS</p>
                <span className="text-xs text-muted-foreground">
                  {filtered.length} team{filtered.length !== 1 ? "s" : ""} found
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      LOADING...
                    </p>
                  </div>
                </div>
              ) : isError ? (
                <div className="p-8 text-center">
                  <XCircle size={24} className="mx-auto mb-3 text-red-400" />
                  <p className="text-sm font-bold uppercase tracking-widest text-red-400">
                    DATABASE TABLE NOT FOUND
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
                    The HMS tables haven't been created yet. Run the migrations in your Supabase SQL Editor:
                  </p>
                  <div className="mt-3 text-left max-w-sm mx-auto border border-border p-3 bg-secondary/50">
                    <p className="text-xs font-mono text-muted-foreground">1. supabase/migrations/001_hms_schema.sql</p>
                    <p className="text-xs font-mono text-muted-foreground">2. supabase/migrations/002_hms_rls_policies.sql</p>
                    <p className="text-xs font-mono text-muted-foreground">3. supabase/migrations/003_hms_storage.sql</p>
                  </div>
                  {teamsError && (
                    <p className="text-xs text-red-400/70 mt-2">
                      Error: {(teamsError as Error).message}
                    </p>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <XCircle size={24} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    NO TEAMS FOUND
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {teams.length > 0
                      ? "No teams match the current search or filter criteria."
                      : "No finalist teams have been created yet."}
                  </p>
                  {(searchQuery || domainFilter !== "all" || statusFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline"
                    >
                      CLEAR ALL FILTERS
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="border-b border-border bg-secondary/20">
                          <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Team Name
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Team ID
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Domain
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTeams.map((team) => {
                          const progress = progressMap.get(team.id) ?? 0;
                          return (
                            <tr
                              key={team.id}
                              onClick={() => setSelectedTeam(team)}
                              className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-2.5 font-medium">
                                {team.team_name}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-xs font-bold uppercase border border-editorial-pink/50 bg-editorial-pink/10 px-2 py-0.5">
                                  {team.team_id}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {team.domain}
                              </td>
                              <td className="px-4 py-2.5">
                                <StatusBadge status={team.status} />
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-secondary border border-border overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        progress === 100
                                          ? "bg-green-400"
                                          : progress >= 50
                                          ? "bg-yellow-400"
                                          : progress > 0
                                          ? "bg-editorial-pink"
                                          : "bg-transparent"
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-muted-foreground">
                                    {progress}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Page {page + 1} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={12} /> Prev
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={page >= totalPages - 1}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagementSection;
