import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  KeyRound,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  MailX,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Registration } from "@/lib/supabase";
import { fetchEmailLog, type EmailLog } from "@/lib/hms";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CredentialSummary {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; reason: string }>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    sent: "bg-green-500/20 text-green-400 border-green-500/40",
    failed: "bg-red-500/20 text-red-400 border-red-500/40",
    retrying: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  };
  return (
    <span
      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
        map[status] ?? "bg-secondary text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch shortlisted registrations that don't yet have a corresponding team record.
 */
const fetchPendingCredentials = async (): Promise<Registration[]> => {
  // Get all shortlisted registrations
  const { data: registrations, error: regError } = await supabase
    .from("registrations")
    .select("*")
    .eq("status", "shortlisted")
    .order("created_at", { ascending: false });

  if (regError) throw new Error(regError.message);
  if (!registrations || registrations.length === 0) return [];

  // Get emails that already have team records
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("leader_email");

  if (teamError) throw new Error(teamError.message);

  const existingEmails = new Set(
    (teams ?? []).map((t: { leader_email: string }) => t.leader_email.toLowerCase())
  );

  // Filter out registrations that already have team records
  return registrations.filter(
    (r: Registration) => !existingEmails.has(r.email.toLowerCase())
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CredentialsSection = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<CredentialSummary | null>(null);
  const [failedEmailsPage, setFailedEmailsPage] = useState(0);

  // Fetch pending credentials
  const {
    data: pendingRegistrations = [],
    isLoading: loadingRegistrations,
    refetch: refetchRegistrations,
  } = useQuery({
    queryKey: ["hms", "pending-credentials"],
    queryFn: fetchPendingCredentials,
  });

  // Fetch failed emails
  const {
    data: failedEmailsData,
    isLoading: loadingEmails,
    refetch: refetchEmails,
  } = useQuery({
    queryKey: ["hms", "failed-emails", failedEmailsPage],
    queryFn: () => fetchEmailLog(failedEmailsPage, 20, "failed"),
  });

  const failedEmails = failedEmailsData?.data ?? [];
  const failedEmailsCount = failedEmailsData?.count ?? 0;

  // Generate credentials mutation
  const generateMutation = useMutation({
    mutationFn: async (registrationIds: string[]) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-credentials",
        { body: { registration_ids: registrationIds } }
      );
      if (error) throw new Error(error.message || "Failed to generate credentials");
      return data as CredentialSummary;
    },
    onSuccess: (data) => {
      setSummary(data);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["hms", "pending-credentials"] });
      queryClient.invalidateQueries({ queryKey: ["hms", "failed-emails"] });
    },
  });

  // Resend email mutation
  const resendMutation = useMutation({
    mutationFn: async (emailLog: EmailLog) => {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: emailLog.recipient,
          template: emailLog.template,
          data: {},
          team_id: emailLog.team_id,
        },
      });
      if (error) throw new Error(error.message || "Failed to resend email");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hms", "failed-emails"] });
    },
  });

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRegistrations.map((r) => r.id!)));
    }
  };

  const handleGenerate = () => {
    if (selectedIds.size === 0) return;
    setSummary(null);
    generateMutation.mutate(Array.from(selectedIds));
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
            CREDENTIALS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate team accounts and credentials for shortlisted registrations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              refetchRegistrations();
              refetchEmails();
            }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Pending Credentials Section */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-editorial-pink" />
            <p className="text-xs font-bold uppercase tracking-widest">
              PENDING CREDENTIAL GENERATION
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {pendingRegistrations.length} registration
            {pendingRegistrations.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loadingRegistrations ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                LOADING...
              </p>
            </div>
          </div>
        ) : pendingRegistrations.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={24} className="mx-auto mb-3 text-green-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              ALL SHORTLISTED REGISTRATIONS HAVE CREDENTIALS
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No pending credential generation needed.
            </p>
          </div>
        ) : (
          <div>
            {/* Action bar */}
            <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === pendingRegistrations.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-editorial-pink"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    SELECT ALL ({pendingRegistrations.length})
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-xs text-editorial-pink font-bold">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={selectedIds.size === 0 || generateMutation.isPending}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <KeyRound size={13} />
                    GENERATE CREDENTIALS
                  </>
                )}
              </button>
            </div>

            {/* Registration list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-2.5 w-10" />
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Team Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(reg.id!)}
                          onChange={() => toggleSelect(reg.id!)}
                          className="w-4 h-4 accent-editorial-pink"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {reg.full_name}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {reg.email}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-bold uppercase border border-border px-2 py-0.5">
                          {reg.team_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Generation Progress / Summary */}
      <AnimatePresence>
        {generateMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-2 border-editorial-pink/50 bg-editorial-pink/5 p-4"
          >
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-editorial-pink" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-editorial-pink">
                  GENERATING CREDENTIALS
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Processing {selectedIds.size} registration
                  {selectedIds.size !== 1 ? "s" : ""} in batches of 50...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {generateMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-2 border-red-500/50 bg-red-500/5 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                  GENERATION FAILED
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {generateMutation.error?.message ?? "An unexpected error occurred."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-2 border-border"
          >
            <div className="bg-secondary/40 border-b border-border px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest">
                GENERATION SUMMARY
              </p>
            </div>
            <div className="p-4 space-y-4">
              {/* Counts */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-green-500/30 bg-green-500/5 p-3 text-center">
                  <p className="text-2xl font-black text-green-400">
                    {summary.success}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                    SUCCESS
                  </p>
                </div>
                <div className="border-2 border-red-500/30 bg-red-500/5 p-3 text-center">
                  <p className="text-2xl font-black text-red-400">
                    {summary.failed}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                    FAILED
                  </p>
                </div>
                <div className="border-2 border-yellow-500/30 bg-yellow-500/5 p-3 text-center">
                  <p className="text-2xl font-black text-yellow-400">
                    {summary.skipped}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                    SKIPPED
                  </p>
                </div>
              </div>

              {/* Error details */}
              {summary.errors.length > 0 && (
                <div className="border-2 border-red-500/30">
                  <div className="bg-red-500/5 border-b border-red-500/30 px-4 py-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                      ERROR DETAILS ({summary.errors.length})
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {summary.errors.map((err, i) => (
                      <div
                        key={i}
                        className="px-4 py-2.5 flex items-start justify-between gap-4"
                      >
                        <span className="text-xs text-muted-foreground">
                          {err.email}
                        </span>
                        <span className="text-xs text-red-400 text-right">
                          {err.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failed Emails Section */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MailX size={14} className="text-red-400" />
            <p className="text-xs font-bold uppercase tracking-widest">
              FAILED EMAILS
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {failedEmailsCount} failed deliver
            {failedEmailsCount !== 1 ? "ies" : "y"}
          </span>
        </div>

        {loadingEmails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                LOADING...
              </p>
            </div>
          </div>
        ) : failedEmails.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={24} className="mx-auto mb-3 text-green-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO FAILED EMAILS
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All emails have been delivered successfully.
            </p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Team ID
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Failed At
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Error
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failedEmails.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs">
                        {log.recipient}
                      </td>
                      <td className="px-4 py-2.5">
                        {log.team_id ? (
                          <span className="text-xs font-bold uppercase border border-editorial-pink/50 bg-editorial-pink/10 px-2 py-0.5">
                            {log.team_id}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {log.updated_at
                          ? new Date(log.updated_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-red-400 max-w-[200px] truncate">
                        {log.error ?? "Unknown error"}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => resendMutation.mutate(log)}
                          disabled={resendMutation.isPending}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send size={11} />
                          RESEND
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for failed emails */}
            {failedEmailsCount > 20 && (
              <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {failedEmailsPage * 20 + 1}–
                  {Math.min((failedEmailsPage + 1) * 20, failedEmailsCount)} of{" "}
                  {failedEmailsCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFailedEmailsPage((p) => p - 1)}
                    disabled={failedEmailsPage === 0}
                    className="text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← PREV
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    PAGE {failedEmailsPage + 1} /{" "}
                    {Math.ceil(failedEmailsCount / 20)}
                  </span>
                  <button
                    onClick={() => setFailedEmailsPage((p) => p + 1)}
                    disabled={(failedEmailsPage + 1) * 20 >= failedEmailsCount}
                    className="text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resend feedback */}
      <AnimatePresence>
        {resendMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-2 border-green-500/50 bg-green-500/5 p-3 flex items-center gap-2"
          >
            <CheckCircle size={14} className="text-green-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-green-400">
              EMAIL RESENT SUCCESSFULLY
            </p>
          </motion.div>
        )}
        {resendMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-2 border-red-500/50 bg-red-500/5 p-3 flex items-center gap-2"
          >
            <XCircle size={14} className="text-red-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">
              RESEND FAILED — {resendMutation.error?.message ?? "Unknown error"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CredentialsSection;
