import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Users,
  TrendingUp,
  Trophy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import PortalLayout from "../PortalLayout";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ReferralStats = {
  ref_code: string;
  community_name: string;
  live_referral_count: number;
  pending_count: number;
  shortlisted_count: number;
  confirmed_count: number;
  rank_position: number | null;
};

type ReferredParticipant = {
  full_name: string;
  city: string;
  team_type: string;
  status: string;
  created_at: string;
};

type LeaderboardEntry = {
  community_name: string;
  live_referral_count: number;
  rank_position: number | null;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getRewardTier(count: number): {
  emoji: string;
  label: string;
  color: string;
  threshold: string;
} {
  if (count >= 50)
    return { emoji: "🥇", label: "GOLD TIER", color: "text-yellow-400", threshold: "50+ referrals" };
  if (count >= 25)
    return { emoji: "🥈", label: "SILVER TIER", color: "text-slate-300", threshold: "25+ referrals" };
  if (count >= 10)
    return { emoji: "🥉", label: "BRONZE TIER", color: "text-orange-400", threshold: "10+ referrals" };
  return {
    emoji: "🎯",
    label: "BUILDING UP",
    color: "text-muted-foreground",
    threshold: "Reach 10 to unlock Bronze",
  };
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "text-editorial-green border-editorial-green";
    case "shortlisted":
      return "text-editorial-blue border-editorial-blue";
    case "rejected":
      return "text-red-400 border-red-400";
    default:
      return "text-muted-foreground border-border";
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`border-2 border-foreground p-5 md:p-6 ${className}`}>{children}</div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-3">
    {children}
  </p>
);

const StatCard = ({
  value,
  label,
  color = "text-foreground",
}: {
  value: string | number;
  label: string;
  color?: string;
}) => (
  <div className="border border-border bg-secondary/40 p-4 text-center">
    <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
      {label}
    </p>
  </div>
);

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const CommunityPartnerDashboard = () => {
  const { user } = usePortalAuth();
  const profileData = user?.profileData ?? {};

  const refCode = (profileData.ref_code as string) ?? "";
  const communityName = (profileData.community_name as string) ?? (profileData.name as string) ?? "Your Community";
  const referralLink = `https://innovahack.in/register?ref=${refCode}`;

  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [participants, setParticipants] = useState<ReferredParticipant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    if (!refCode) return;
    setStatsError(null);
    try {
      const { data, error } = await supabase
        .from("referral_leaderboard")
        .select("*")
        .eq("ref_code", refCode)
        .single();
      if (error) throw error;
      setStats(data as ReferralStats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load referral stats.";
      setStatsError(msg);
    } finally {
      setStatsLoading(false);
    }
  }, [refCode]);

  const fetchParticipants = useCallback(async () => {
    if (!refCode) return;
    setParticipantsError(null);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("full_name, city, team_type, status, created_at")
        .eq("ref_code", refCode)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setParticipants((data ?? []) as ReferredParticipant[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load referred participants.";
      setParticipantsError(msg);
    } finally {
      setParticipantsLoading(false);
    }
  }, [refCode]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("referral_leaderboard")
        .select("community_name, live_referral_count, rank_position")
        .order("live_referral_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      setLeaderboard((data ?? []) as LeaderboardEntry[]);
    } catch {
      // Leaderboard is non-critical, silently fail
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchParticipants();
    fetchLeaderboard();
  }, [fetchStats, fetchParticipants, fetchLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatsLoading(true);
    setParticipantsLoading(true);
    setLeaderboardLoading(true);
    await Promise.all([fetchStats(), fetchParticipants(), fetchLeaderboard()]);
    setRefreshing(false);
  };

  // ── Copy referral link ─────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-HTTPS
      const el = document.createElement("textarea");
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const totalReferrals = stats?.live_referral_count ?? participants.length;
  const rewardTier = getRewardTier(totalReferrals);
  const myRank = stats?.rank_position ?? null;

  return (
    <PortalLayout
      title={`${communityName}`}
      subtitle="Community Partner Dashboard — Track your referrals and rewards"
    >
      {/* ── Refresh button ───────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground hover:bg-secondary transition-all disabled:opacity-40"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          REFRESH DATA
        </button>
      </div>

      {/* ── 1. MY REFERRAL LINK ─────────────────────────────────────────── */}
      <SectionCard className="bg-editorial-pink/5">
        <SectionLabel>MY REFERRAL LINK</SectionLabel>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">
            Share this link with your community. Every registration using your link earns
            referral credit toward your reward tier.
          </p>
          <div className="flex items-center gap-0">
            <div className="flex-1 bg-secondary border-2 border-foreground px-4 py-3 font-mono text-sm break-all text-foreground min-w-0">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-1.5 bg-editorial-pink border-2 border-editorial-pink px-4 py-3 text-xs font-black uppercase tracking-wider text-background hover:opacity-90 transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "COPIED!" : "COPY"}
            </button>
          </div>
        </div>

        {/* Ref code badge */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="border border-border px-3 py-1.5 bg-secondary/60">
            <span className="text-xs text-muted-foreground uppercase tracking-widest mr-2">
              REF CODE:
            </span>
            <span className="text-sm font-black text-editorial-pink tracking-widest">
              {refCode || "—"}
            </span>
          </div>
          <div className="border border-border px-3 py-1.5 bg-secondary/60">
            <ExternalLink size={11} className="inline mr-1.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              innovahack.in/register?ref=
              <strong className="text-foreground">{refCode}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
          📱 <strong className="text-foreground">Pro tip:</strong> Screenshot this page and share
          the link on your social media, WhatsApp groups, and Discord servers for maximum reach.
        </p>
      </SectionCard>

      {/* ── 2. REFERRAL STATS ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
            REFERRAL STATS
          </p>
          {statsLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 border border-editorial-pink border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          )}
        </div>

        {statsError ? (
          <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{statsError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              value={statsLoading ? "—" : totalReferrals}
              label="Total Referrals"
              color="text-editorial-pink"
            />
            <StatCard
              value={statsLoading ? "—" : (stats?.pending_count ?? participants.filter((p) => p.status === "pending").length)}
              label="Pending"
              color="text-muted-foreground"
            />
            <StatCard
              value={statsLoading ? "—" : (stats?.shortlisted_count ?? participants.filter((p) => p.status === "shortlisted").length)}
              label="Shortlisted"
              color="text-editorial-blue"
            />
            <StatCard
              value={statsLoading ? "—" : (stats?.confirmed_count ?? participants.filter((p) => p.status === "confirmed").length)}
              label="Confirmed"
              color="text-editorial-green"
            />
          </div>
        )}

        {myRank && (
          <div className="mt-3 border border-border bg-secondary/30 px-4 py-2 flex items-center gap-3">
            <TrendingUp size={14} className="text-editorial-orange flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your current rank on the leaderboard:{" "}
              <strong className="text-foreground text-sm">#{myRank}</strong>
            </p>
          </div>
        )}
      </div>

      {/* ── 3. LEADERBOARD POSITION ──────────────────────────────────────── */}
      <SectionCard>
        <SectionLabel>LEADERBOARD POSITION</SectionLabel>
        <p className="text-xs text-muted-foreground mb-4">
          Top community partners by total referrals. Your community is highlighted.
        </p>

        {leaderboardLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No leaderboard data available yet.</p>
        ) : (
          <div className="space-y-1">
            {leaderboard.slice(0, 10).map((entry, idx) => {
              const isMe =
                entry.community_name === communityName ||
                entry.community_name === (profileData.community_name as string);
              const rank = entry.rank_position ?? idx + 1;
              const rankEmoji =
                rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

              return (
                <motion.div
                  key={entry.community_name ?? idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center justify-between px-4 py-2.5 border transition-all ${
                    isMe
                      ? "border-editorial-pink bg-editorial-pink/10"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{rankEmoji}</span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${
                        isMe ? "text-editorial-pink" : "text-foreground"
                      }`}
                    >
                      {isMe
                        ? communityName
                        : `Community Partner #${rank}`}
                    </span>
                    {isMe && (
                      <span className="text-xs bg-editorial-pink text-background px-1.5 py-0.5 font-black uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-black tabular-nums ${
                      isMe ? "text-editorial-pink" : "text-foreground"
                    }`}
                  >
                    {entry.live_referral_count}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── 4. REWARD TIER ───────────────────────────────────────────────── */}
      <SectionCard>
        <SectionLabel>REWARD TIER</SectionLabel>
        <div className="flex items-start gap-5">
          <div className="text-5xl leading-none">{rewardTier.emoji}</div>
          <div className="flex-1">
            <h3 className={`text-xl font-black uppercase tracking-tighter mb-1 ${rewardTier.color}`}>
              {rewardTier.label}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">{rewardTier.threshold}</p>

            {/* Tier ladder */}
            <div className="space-y-2">
              {[
                { emoji: "🥇", label: "GOLD", threshold: "50+ referrals", reward: "Top prize + goodies bundle", count: 50 },
                { emoji: "🥈", label: "SILVER", threshold: "25+ referrals", reward: "Premium swag kit", count: 25 },
                { emoji: "🥉", label: "BRONZE", threshold: "10+ referrals", reward: "InnovaHack merchandise", count: 10 },
              ].map((tier) => {
                const unlocked = totalReferrals >= tier.count;
                return (
                  <div
                    key={tier.label}
                    className={`flex items-center gap-3 px-3 py-2 border transition-all ${
                      unlocked
                        ? "border-editorial-green bg-editorial-green/10"
                        : "border-border opacity-50"
                    }`}
                  >
                    <span className="text-lg">{tier.emoji}</span>
                    <div className="flex-1">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {tier.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">{tier.threshold}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {tier.reward}
                      </span>
                      {unlocked && <Check size={13} className="text-editorial-green flex-shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalReferrals < 50 && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <Star size={11} className="text-editorial-orange" />
                {totalReferrals < 10
                  ? `${10 - totalReferrals} more referrals to unlock Bronze tier`
                  : totalReferrals < 25
                  ? `${25 - totalReferrals} more referrals to reach Silver tier`
                  : `${50 - totalReferrals} more referrals to reach Gold tier`}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── 5. REFERRED PARTICIPANTS ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
            REFERRED PARTICIPANTS
          </p>
          <span className="text-xs text-muted-foreground">
            {participantsLoading ? "Loading…" : `${participants.length} total`}
          </span>
        </div>

        {participantsError ? (
          <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{participantsError}</p>
          </div>
        ) : participantsLoading ? (
          <div className="border-2 border-foreground">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 border-b border-border bg-secondary/20 animate-pulse" />
            ))}
          </div>
        ) : participants.length === 0 ? (
          <div className="border-2 border-dashed border-border px-6 py-10 text-center">
            <Users size={28} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              No referrals yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your referral link to start tracking participants.
            </p>
          </div>
        ) : (
          <div className="border-2 border-foreground overflow-x-auto">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-0 border-b-2 border-foreground bg-secondary/60">
              {["NAME", "CITY", "TEAM TYPE", "STATUS", "DATE"].map((col) => (
                <div
                  key={col}
                  className="px-3 py-2.5 text-xs font-black uppercase tracking-widest border-r border-border last:border-r-0"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {participants.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-0 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
              >
                <div className="px-3 py-2.5 text-xs font-bold truncate border-r border-border">
                  {p.full_name}
                </div>
                <div className="px-3 py-2.5 text-xs text-muted-foreground truncate border-r border-border capitalize">
                  {p.city || "—"}
                </div>
                <div className="px-3 py-2.5 text-xs text-muted-foreground truncate border-r border-border uppercase">
                  {p.team_type || "—"}
                </div>
                <div className="px-3 py-2.5 border-r border-border">
                  <span
                    className={`text-xs font-black uppercase tracking-widest border px-1.5 py-0.5 ${getStatusColor(
                      p.status
                    )}`}
                  >
                    {p.status || "PENDING"}
                  </span>
                </div>
                <div className="px-3 py-2.5 text-xs text-muted-foreground">
                  {formatDate(p.created_at)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default CommunityPartnerDashboard;
