import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Github,
  Video,
  Image,
  BookOpen,
  RefreshCw,
  Flag,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Submission, SubmissionStatus } from "@/lib/hms";
import { flagReasonSchema } from "@/lib/hmsValidation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubmissionWithTeam extends Submission {
  team_name: string;
  team_display_id: string;
  domain: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  under_review: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  reviewed: "bg-green-500/20 text-green-400 border-green-500/40",
  flagged: "bg-red-500/20 text-red-400 border-red-500/40",
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "PENDING",
  under_review: "UNDER REVIEW",
  reviewed: "REVIEWED",
  flagged: "FLAGGED",
};

function calculateCompleteness(submission: Submission): number {
  let count = 0;
  if (submission.github_url) count++;
  if (submission.pitch_deck_url) count++;
  if (submission.video_url) count++;
  if (submission.documentation_urls && submission.documentation_urls.length > 0) count++;
  if (submission.pow_urls && submission.pow_urls.length > 0) count++;
  return Math.round((count / 5) * 100);
}

const StatusBadge = ({ status }: { status: SubmissionStatus }) => (
  <span
    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${STATUS_COLORS[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchSubmissionsWithTeams(): Promise<SubmissionWithTeam[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, teams(team_name, team_id, domain)")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    team_id: row.team_id,
    github_url: row.github_url,
    pitch_deck_url: row.pitch_deck_url,
    video_url: row.video_url,
    documentation_urls: row.documentation_urls ?? [],
    pow_urls: row.pow_urls ?? [],
    status: row.status as SubmissionStatus,
    flag_reason: row.flag_reason,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    team_name: row.teams?.team_name ?? "Unknown",
    team_display_id: row.teams?.team_id ?? "—",
    domain: row.teams?.domain ?? "—",
  }));
}

async function updateSubmissionStatus(
  submissionId: string,
  newStatus: SubmissionStatus,
  flagReason?: string,
): Promise<Submission> {
  const updates: Record<string, any> = {
    status: newStatus,
    reviewed_at: new Date().toISOString(),
  };

  if (newStatus === "flagged" && flagReason) {
    updates.flag_reason = flagReason;
  }

  if (newStatus !== "flagged") {
    updates.flag_reason = null;
  }

  const { data, error } = await supabase
    .from("submissions")
    .update(updates)
    .eq("id", submissionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Submission;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const SubmissionDetail = ({
  submission,
  onBack,
  onStatusChange,
  isUpdating,
}: {
  submission: SubmissionWithTeam;
  onBack: () => void;
  onStatusChange: (newStatus: SubmissionStatus, flagReason?: string) => void;
  isUpdating: boolean;
}) => {
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagError, setFlagError] = useState<string | null>(null);

  const handleFlag = () => {
    const result = flagReasonSchema.safeParse(flagReason);
    if (!result.success) {
      setFlagError(result.error.errors[0]?.message ?? "Invalid flag reason");
      return;
    }
    setFlagError(null);
    onStatusChange("flagged", flagReason);
    setShowFlagInput(false);
    setFlagReason("");
  };

  const completeness = calculateCompleteness(submission);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} /> BACK TO LIST
        </button>
      </div>

      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
              {submission.team_display_id}
            </p>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {submission.team_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Domain: {submission.domain} · Completeness: {completeness}%
            </p>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        {/* Deliverables */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            DELIVERABLES
          </p>

          {/* GitHub URL */}
          <div className="flex items-center gap-3 border border-border p-3">
            <Github size={16} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">GitHub Repository</p>
              {submission.github_url ? (
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-editorial-pink hover:underline flex items-center gap-1 truncate"
                >
                  {submission.github_url}
                  <ExternalLink size={10} />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not Submitted</p>
              )}
            </div>
          </div>

          {/* Pitch Deck */}
          <div className="flex items-center gap-3 border border-border p-3">
            <FileText size={16} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">Pitch Deck</p>
              {submission.pitch_deck_url ? (
                <a
                  href={submission.pitch_deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-editorial-pink hover:underline flex items-center gap-1 truncate"
                >
                  Download Pitch Deck
                  <ExternalLink size={10} />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not Submitted</p>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="flex items-center gap-3 border border-border p-3">
            <Video size={16} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">Demo Video</p>
              {submission.video_url ? (
                <a
                  href={submission.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-editorial-pink hover:underline flex items-center gap-1 truncate"
                >
                  {submission.video_url}
                  <ExternalLink size={10} />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not Submitted</p>
              )}
            </div>
          </div>

          {/* Documentation */}
          <div className="flex items-start gap-3 border border-border p-3">
            <BookOpen size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">Documentation</p>
              {submission.documentation_urls.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {submission.documentation_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-editorial-pink hover:underline flex items-center gap-1 truncate"
                    >
                      Document {i + 1}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not Submitted</p>
              )}
            </div>
          </div>

          {/* Proof of Work */}
          <div className="flex items-start gap-3 border border-border p-3">
            <Image size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider">Proof of Work</p>
              {submission.pow_urls.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {submission.pow_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border p-1 hover:border-editorial-pink transition-colors"
                    >
                      <img
                        src={url}
                        alt={`PoW ${i + 1}`}
                        className="w-16 h-16 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            '<span class="text-xs text-muted-foreground p-2 block">Image ' + (i + 1) + '</span>';
                        }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not Submitted</p>
              )}
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            <span
              title={new Date(submission.updated_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
              className="cursor-help border-b border-dotted border-muted-foreground"
            >
              {formatDistanceToNow(new Date(submission.updated_at), { addSuffix: true })}
            </span>
          </p>
        </div>
      </div>

      {/* Status Transition Controls */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest">STATUS CONTROLS</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {submission.status === "pending" && (
              <button
                onClick={() => onStatusChange("under_review")}
                disabled={isUpdating}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-blue-500/50 text-blue-400 px-4 py-2 hover:bg-blue-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                START REVIEW
              </button>
            )}

            {submission.status === "under_review" && (
              <button
                onClick={() => onStatusChange("reviewed")}
                disabled={isUpdating}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-green-500/50 text-green-400 px-4 py-2 hover:bg-green-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                MARK REVIEWED
              </button>
            )}

            {submission.status !== "flagged" && (
              <button
                onClick={() => setShowFlagInput(true)}
                disabled={isUpdating}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-red-500/50 text-red-400 px-4 py-2 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Flag size={13} />
                FLAG
              </button>
            )}
          </div>

          {/* Flag reason input */}
          <AnimatePresence>
            {showFlagInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-2 border-red-500/30 p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                    FLAG REASON (10-500 characters)
                  </p>
                  <textarea
                    value={flagReason}
                    onChange={(e) => {
                      setFlagReason(e.target.value);
                      setFlagError(null);
                    }}
                    placeholder="Describe the reason for flagging this submission..."
                    className="w-full bg-secondary border border-border p-2 text-sm resize-none h-24 focus:outline-none focus:border-red-500/50"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {flagReason.length}/500
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowFlagInput(false);
                          setFlagReason("");
                          setFlagError(null);
                        }}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-3 py-1.5"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleFlag}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-red-500 text-white px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? <Loader2 size={11} className="animate-spin" /> : <Flag size={11} />}
                        CONFIRM FLAG
                      </button>
                    </div>
                  </div>
                  {flagError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> {flagError}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show existing flag reason */}
          {submission.status === "flagged" && submission.flag_reason && (
            <div className="border-2 border-red-500/30 bg-red-500/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                FLAG REASON
              </p>
              <p className="text-sm text-foreground">{submission.flag_reason}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SubmissionsSection = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithTeam | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [completenessFilter, setCompletenessFilter] = useState<string>("all");

  // Fetch submissions with team data
  const {
    data: submissions = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["hms", "submissions"],
    queryFn: fetchSubmissionsWithTeams,
    retry: false,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({
      submissionId,
      newStatus,
      flagReason,
    }: {
      submissionId: string;
      newStatus: SubmissionStatus;
      flagReason?: string;
    }) => updateSubmissionStatus(submissionId, newStatus, flagReason),
    onSuccess: (updatedSubmission) => {
      queryClient.invalidateQueries({ queryKey: ["hms", "submissions"] });
      toast.success(`Status updated to ${STATUS_LABELS[updatedSubmission.status as SubmissionStatus]}`);
      // Update selected submission in place
      if (selectedSubmission && selectedSubmission.id === updatedSubmission.id) {
        setSelectedSubmission({
          ...selectedSubmission,
          status: updatedSubmission.status as SubmissionStatus,
          flag_reason: updatedSubmission.flag_reason,
          reviewed_at: updatedSubmission.reviewed_at,
          reviewed_by: updatedSubmission.reviewed_by,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Extract unique domains for filter
  const domains = useMemo(() => {
    const domainSet = new Set(submissions.map((s) => s.domain));
    return Array.from(domainSet).sort();
  }, [submissions]);

  // Apply filters
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (domainFilter !== "all" && s.domain !== domainFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (completenessFilter !== "all") {
        const comp = calculateCompleteness(s);
        switch (completenessFilter) {
          case "0":
            if (comp !== 0) return false;
            break;
          case "1-49":
            if (comp < 1 || comp > 49) return false;
            break;
          case "50-99":
            if (comp < 50 || comp > 99) return false;
            break;
          case "100":
            if (comp !== 100) return false;
            break;
        }
      }
      return true;
    });
  }, [submissions, domainFilter, statusFilter, completenessFilter]);

  const handleStatusChange = (newStatus: SubmissionStatus, flagReason?: string) => {
    if (!selectedSubmission) return;
    statusMutation.mutate({
      submissionId: selectedSubmission.id,
      newStatus,
      flagReason,
    });
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
            SUBMISSIONS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and evaluate team submissions across all domains
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
        {selectedSubmission ? (
          <SubmissionDetail
            key="detail"
            submission={selectedSubmission}
            onBack={() => setSelectedSubmission(null)}
            onStatusChange={handleStatusChange}
            isUpdating={statusMutation.isPending}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="border-2 border-border">
              <div className="bg-secondary/40 border-b border-border px-4 py-2.5">
                <p className="text-xs font-bold uppercase tracking-widest">FILTERS</p>
              </div>
              <div className="p-4 flex flex-wrap gap-3">
                {/* Domain filter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Domain
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
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
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block bg-secondary border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-editorial-pink/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                {/* Completeness filter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Completeness
                  </label>
                  <select
                    value={completenessFilter}
                    onChange={(e) => setCompletenessFilter(e.target.value)}
                    className="block bg-secondary border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-editorial-pink/50"
                  >
                    <option value="all">All</option>
                    <option value="0">0% (No deliverables)</option>
                    <option value="1-49">1–49%</option>
                    <option value="50-99">50–99%</option>
                    <option value="100">100% (Complete)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="border-2 border-border">
              <div className="bg-secondary/40 border-b border-border px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest">
                  SUBMISSIONS
                </p>
                <span className="text-xs text-muted-foreground">
                  {filtered.length} of {submissions.length} submissions
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
                    Run the HMS migrations in Supabase SQL Editor (001_hms_schema.sql, 002_hms_rls_policies.sql, 003_hms_storage.sql).
                  </p>
                  {queryError && (
                    <p className="text-xs text-red-400/70 mt-2">Error: {(queryError as Error).message}</p>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <XCircle size={24} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    NO SUBMISSIONS FOUND
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {submissions.length > 0
                      ? "Try adjusting your filters."
                      : "No teams have submitted deliverables yet."}
                  </p>
                </div>
              ) : (
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
                          Completeness
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((sub) => {
                        const completeness = calculateCompleteness(sub);
                        return (
                          <tr
                            key={sub.id}
                            onClick={() => setSelectedSubmission(sub)}
                            className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {sub.team_name}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-xs font-bold uppercase border border-editorial-pink/50 bg-editorial-pink/10 px-2 py-0.5">
                                {sub.team_display_id}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">
                              {sub.domain}
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={sub.status} />
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-secondary border border-border overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      completeness === 100
                                        ? "bg-green-400"
                                        : completeness >= 50
                                        ? "bg-yellow-400"
                                        : "bg-red-400"
                                    }`}
                                    style={{ width: `${completeness}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {completeness}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                title={new Date(sub.updated_at).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                                className="text-xs text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50"
                              >
                                {formatDistanceToNow(new Date(sub.updated_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubmissionsSection;
