import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Trophy,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Building2,
  FileText,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import PortalLayout from "../PortalLayout";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ProposalStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "converted"
  | "rejected";

type ReferralCount = {
  total: number;
  pending: number;
  shortlisted: number;
  confirmed: number;
};

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    desc: string;
  }
> = {
  new: {
    label: "RECEIVED",
    color: "text-editorial-orange",
    bg: "bg-editorial-orange/10",
    border: "border-editorial-orange",
    icon: <Clock size={14} />,
    desc: "Your proposal has been received and is awaiting review by our partnerships team.",
  },
  reviewed: {
    label: "REVIEWED",
    color: "text-editorial-blue",
    bg: "bg-editorial-blue/10",
    border: "border-editorial-blue",
    icon: <FileText size={14} />,
    desc: "Our team has reviewed your proposal and will be in touch with you shortly.",
  },
  contacted: {
    label: "CONTACTED",
    color: "text-editorial-purple",
    bg: "bg-editorial-purple/10",
    border: "border-editorial-purple",
    icon: <Mail size={14} />,
    desc: "Our partnerships team has reached out to you. Please check your inbox for details.",
  },
  converted: {
    label: "PARTNER",
    color: "text-editorial-green",
    bg: "bg-editorial-green/10",
    border: "border-editorial-green",
    icon: <CheckCircle2 size={14} />,
    desc: "Welcome aboard! Your institution is now an official InnovaHack College Partner.",
  },
  rejected: {
    label: "CLOSED",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500",
    icon: <XCircle size={14} />,
    desc: "Thank you for your interest. We're unable to proceed with this proposal at this time.",
  },
};

const NEXT_STEPS: Record<ProposalStatus, string[]> = {
  new: [
    "Your proposal is in the queue — our team reviews all proposals within 5 business days",
    "Ensure students at your institution know about InnovaHack and encourage them to register",
    "Keep an eye on your email inbox for updates from our partnerships team",
    "Share the registration link with your student body, clubs, and faculty",
  ],
  reviewed: [
    "Our team has reviewed your proposal and is evaluating the partnership details",
    "We'll reach out to you soon with next steps or to schedule a discussion",
    "In the meantime, encourage students to register at innovahack.in/register",
    "Prepare any required documents or promotional materials your institution can share",
  ],
  contacted: [
    "Check your email for the message from our partnerships team",
    "Reply promptly to move forward with the partnership agreement",
    "Start planning how your institution can help promote InnovaHack to students",
    "Coordinate with your student clubs and technical committees",
  ],
  converted: [
    "Begin promoting InnovaHack through your official institution channels",
    "Share the registration link with all departments, clubs, and student groups",
    "Display InnovaHack posters and banners on campus if possible",
    "Track your student registrations using the referral stats below",
    "Coordinate with our team for any on-campus events or workshops",
  ],
  rejected: [
    "We appreciate your interest in InnovaHack 2026",
    "Follow us on social media for future partnership opportunities",
    "Students from your institution can still register independently at innovahack.in/register",
    "Watch out for future editions of InnovaHack where we expand our partner network",
  ],
};

const REWARD_TIERS = [
  {
    emoji: "🥇",
    rank: "1ST PLACE",
    reward: "₹20,000",
    label: "Gold — Highest student registrations",
    color: "text-yellow-400",
    border: "border-yellow-400/40",
    bg: "bg-yellow-400/5",
    threshold: 80,
  },
  {
    emoji: "🥈",
    rank: "2ND PLACE",
    reward: "₹15,000",
    label: "Silver — Second highest registrations",
    color: "text-slate-300",
    border: "border-slate-400/40",
    bg: "bg-slate-400/5",
    threshold: 50,
  },
  {
    emoji: "🥉",
    rank: "3RD PLACE",
    reward: "₹10,000",
    label: "Bronze — Third highest registrations",
    color: "text-orange-400",
    border: "border-orange-400/40",
    bg: "bg-orange-400/5",
    threshold: 25,
  },
];

const SHARE_TEXT = `Hey! 🚀

InnovaHack 2026 — India's Largest Hiring & Startup Hackathon is now open for registrations!

✅ 30-hour intensive hackathon
✅ Top 1% selected from 10,000+ applicants
✅ ₹3 Lakhs+ prize pool
✅ Direct exposure to 100+ hiring companies
✅ Startup incubation & investor access

Apply now → https://innovahack.in/register

Only the top 1% get selected. Don't miss your shot! 💪

#InnovaHack2026 #Hackathon #TechEvent #EliteForums`;

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
  <div className={`border-2 border-foreground p-5 md:p-6 ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({
  children,
  color = "text-editorial-pink",
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <p className={`text-xs font-bold tracking-[0.3em] uppercase mb-3 ${color}`}>
    {children}
  </p>
);

const StatCard = ({
  value,
  label,
  color = "text-foreground",
  loading = false,
}: {
  value: string | number;
  label: string;
  color?: string;
  loading?: boolean;
}) => (
  <div className="border border-border bg-secondary/40 p-4 text-center">
    <p
      className={`text-3xl font-black tracking-tighter ${color} ${loading ? "animate-pulse" : ""}`}
    >
      {loading ? "—" : value}
    </p>
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
      {label}
    </p>
  </div>
);

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border last:border-0">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground sm:w-36 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const CollegePartnerDashboard = () => {
  const { user } = usePortalAuth();
  const profileData = user?.profileData ?? {};

  const status = (profileData.status as ProposalStatus) ?? "new";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  const nextSteps = NEXT_STEPS[status] ?? NEXT_STEPS.new;

  const collegeName =
    (profileData.college_name as string) ??
    (profileData.organisation_name as string) ??
    (profileData.name as string) ??
    "Your Institution";

  const contactName =
    (profileData.contact_name as string) ??
    (profileData.full_name as string) ??
    null;

  const [referralCount, setReferralCount] = useState<ReferralCount>({
    total: 0,
    pending: 0,
    shortlisted: 0,
    confirmed: 0,
  });
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch registrations from matching college name ──────────────────────

  const fetchReferralData = useCallback(async () => {
    if (!collegeName || collegeName === "Your Institution") {
      setReferralLoading(false);
      return;
    }

    setReferralError(null);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("status")
        .ilike("organisation_name", `%${collegeName}%`);

      if (error) throw error;

      const rows = data ?? [];
      const counts: ReferralCount = {
        total: rows.length,
        pending: rows.filter((r) => r.status === "pending").length,
        shortlisted: rows.filter((r) => r.status === "shortlisted").length,
        confirmed: rows.filter((r) => r.status === "confirmed").length,
      };
      setReferralCount(counts);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load referral data.";
      setReferralError(msg);
    } finally {
      setReferralLoading(false);
    }
  }, [collegeName]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setReferralLoading(true);
    await fetchReferralData();
    setRefreshing(false);
  };

  // ── Estimated reward position based on count ───────────────────────────

  const getEstimatedTier = (count: number) => {
    if (count >= REWARD_TIERS[0].threshold) return 0;
    if (count >= REWARD_TIERS[1].threshold) return 1;
    if (count >= REWARD_TIERS[2].threshold) return 2;
    return null;
  };

  const estimatedTierIdx = getEstimatedTier(referralCount.total);

  // ── Copy helpers ───────────────────────────────────────────────────────

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://innovahack.in/register");
    } catch {
      const el = document.createElement("textarea");
      el.value = "https://innovahack.in/register";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
    } catch {
      const el = document.createElement("textarea");
      el.value = SHARE_TEXT;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const submittedAt = profileData.created_at
    ? new Date(profileData.created_at as string).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PortalLayout
      title={collegeName}
      subtitle={`College Partner Portal${submittedAt ? ` · Submitted ${submittedAt}` : ""}`}
    >
      {/* Refresh button */}
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

      {/* ── 1. PROPOSAL STATUS ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SectionCard className={`${statusCfg.bg}`}>
          <SectionLabel>
            {statusCfg.label === "PARTNER"
              ? "PARTNERSHIP STATUS"
              : "PROPOSAL STATUS"}
          </SectionLabel>

          {/* Status badge + description */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
            <div
              className={`flex items-center gap-2 border-2 ${statusCfg.border} ${statusCfg.color} px-3 py-2 w-fit flex-shrink-0`}
            >
              {statusCfg.icon}
              <span className="text-xs font-black uppercase tracking-widest">
                {statusCfg.label}
              </span>
            </div>
            <p
              className={`text-sm leading-relaxed ${statusCfg.color} font-medium`}
            >
              {statusCfg.desc}
            </p>
          </div>

          {/* Proposal details */}
          <div className="border-t border-border pt-4 space-y-0">
            <DetailRow label="Institution" value={collegeName} />
            <DetailRow label="Contact Person" value={contactName} />
            <DetailRow
              label="Contact Email"
              value={(profileData.email as string) ?? null}
            />
            <DetailRow
              label="Contact Phone"
              value={
                (profileData.phone as string) ??
                (profileData.contact_no as string) ??
                null
              }
            />
            <DetailRow
              label="City"
              value={(profileData.city as string) ?? null}
            />
            <DetailRow label="Proposal Type" value="COLLEGE PARTNER" />
            <DetailRow label="Submitted On" value={submittedAt} />
            {profileData.message && (
              <div className="py-3 border-b border-border last:border-0">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1">
                  Message / Notes
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {profileData.message as string}
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      </motion.div>

      {/* ── 2. REFERRAL TRACKING ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel color="text-editorial-blue">
              STUDENT REFERRAL TRACKING
            </SectionLabel>
            {referralLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 border border-editorial-blue border-t-transparent rounded-full animate-spin" />
                Loading…
              </div>
            )}
          </div>

          <div className="border-2 border-foreground p-5 md:p-6">
            <div className="flex items-start gap-3 border border-border bg-secondary/40 px-4 py-3 mb-5">
              <GraduationCap
                size={14}
                className="text-editorial-blue mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Students from{" "}
                <strong className="text-foreground">{collegeName}</strong> who
                register for InnovaHack are automatically tracked based on their
                institution name. Registrations are matched using your college
                name.
              </p>
            </div>

            {referralError ? (
              <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-2">
                <AlertCircle
                  size={14}
                  className="text-red-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-red-400">{referralError}</p>
                  <button
                    onClick={fetchReferralData}
                    className="text-xs text-red-300 underline mt-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  value={referralCount.total}
                  label="Total Students"
                  color="text-editorial-blue"
                  loading={referralLoading}
                />
                <StatCard
                  value={referralCount.pending}
                  label="Under Review"
                  color="text-muted-foreground"
                  loading={referralLoading}
                />
                <StatCard
                  value={referralCount.shortlisted}
                  label="Shortlisted"
                  color="text-editorial-purple"
                  loading={referralLoading}
                />
                <StatCard
                  value={referralCount.confirmed}
                  label="Confirmed"
                  color="text-editorial-green"
                  loading={referralLoading}
                />
              </div>
            )}

            {!referralLoading && referralCount.total > 0 && (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <TrendingUp
                  size={13}
                  className="text-editorial-green flex-shrink-0"
                />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">
                    {referralCount.confirmed}
                  </strong>{" "}
                  student
                  {referralCount.confirmed !== 1 ? "s" : ""} confirmed out of{" "}
                  <strong className="text-foreground">
                    {referralCount.total}
                  </strong>{" "}
                  registered.
                  {referralCount.total > 0 && (
                    <span className="text-editorial-green ml-1">
                      (
                      {Math.round(
                        (referralCount.confirmed / referralCount.total) * 100,
                      )}
                      % conversion)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 3. REWARDS ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionCard>
          <SectionLabel color="text-editorial-orange">
            REWARDS STRUCTURE
          </SectionLabel>
          <p className="text-xs text-muted-foreground mb-5">
            The top 3 college partners with the highest number of confirmed
            student participants win cash prizes. Rankings are determined at the
            close of registrations.
          </p>

          <div className="space-y-3">
            {REWARD_TIERS.map((tier, idx) => {
              const isCurrentEstimate = estimatedTierIdx === idx;
              return (
                <motion.div
                  key={tier.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.06 }}
                  className={`flex items-center gap-4 px-4 py-4 border-2 transition-all ${
                    isCurrentEstimate
                      ? `${tier.border} ${tier.bg}`
                      : "border-border"
                  }`}
                >
                  <span className="text-3xl leading-none flex-shrink-0">
                    {tier.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-black uppercase tracking-tight ${tier.color}`}
                      >
                        {tier.rank}
                      </span>
                      {isCurrentEstimate && (
                        <span className="text-xs bg-editorial-orange text-background px-1.5 py-0.5 font-black uppercase tracking-wider">
                          YOUR ESTIMATE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Approx. threshold: {tier.threshold}+ confirmed students
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-2xl font-black tracking-tighter ${tier.color}`}
                    >
                      {tier.reward}
                    </p>
                    <p className="text-xs text-muted-foreground">Cash Prize</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress hint */}
          <div className="mt-4 border-t border-border pt-4">
            {referralCount.confirmed === 0 ? (
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Trophy
                  size={12}
                  className="text-editorial-orange mt-0.5 flex-shrink-0"
                />
                No confirmed students yet. Start promoting InnovaHack to your
                student body to unlock reward tiers.
              </p>
            ) : referralCount.confirmed < REWARD_TIERS[2].threshold ? (
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Trophy
                  size={12}
                  className="text-editorial-orange mt-0.5 flex-shrink-0"
                />
                <span>
                  You have{" "}
                  <strong className="text-foreground">
                    {referralCount.confirmed}
                  </strong>{" "}
                  confirmed student{referralCount.confirmed !== 1 ? "s" : ""}.
                  Reach{" "}
                  <strong className="text-foreground">
                    {REWARD_TIERS[2].threshold - referralCount.confirmed} more
                  </strong>{" "}
                  to be in contention for the Bronze prize (₹10,000).
                </span>
              </p>
            ) : (
              <p className="text-xs text-editorial-green flex items-start gap-2">
                <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  You're in contention for a prize! Keep driving registrations
                  to move up the rankings.
                </span>
              </p>
            )}
          </div>
        </SectionCard>
      </motion.div>

      {/* ── 4. WHAT'S NEXT ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <SectionCard>
          <SectionLabel color={statusCfg.color}>WHAT'S NEXT</SectionLabel>
          <ul className="space-y-2.5">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 border ${statusCfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <span className={`text-xs font-black ${statusCfg.color}`}>
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </motion.div>

      {/* ── 5. SHARE & PROMOTE ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionCard>
          <SectionLabel color="text-editorial-purple">
            SHARE & PROMOTE
          </SectionLabel>
          <p className="text-xs text-muted-foreground mb-5">
            Use the tools below to promote InnovaHack 2026 across your
            institution's channels — WhatsApp groups, Instagram, LinkedIn,
            notice boards, and email newsletters.
          </p>

          {/* Registration link */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              REGISTRATION LINK
            </p>
            <div className="flex items-center gap-0">
              <div className="flex-1 bg-secondary border-2 border-foreground px-4 py-2.5 font-mono text-sm text-foreground break-all min-w-0">
                https://innovahack.in/register
              </div>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 flex items-center gap-1.5 bg-editorial-purple border-2 border-editorial-purple px-4 py-2.5 text-xs font-black uppercase tracking-wider text-background hover:opacity-90 transition-all"
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                {copiedLink ? "COPIED!" : "COPY"}
              </button>
            </div>
          </div>

          {/* Shareable text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              READY-TO-SHARE MESSAGE
            </p>
            <div className="bg-secondary/60 border border-border p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed mb-3">
              {SHARE_TEXT}
            </div>
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-2 border-2 border-foreground px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              {copiedShare ? <Check size={13} /> : <Share2 size={13} />}
              {copiedShare ? "COPIED TO CLIPBOARD!" : "COPY THIS MESSAGE"}
            </button>
          </div>

          {/* Quick share tips */}
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              PROMOTION IDEAS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: "💬", tip: "Share in department WhatsApp groups" },
                { icon: "📱", tip: "Post on your college Instagram page" },
                { icon: "💼", tip: "Share on LinkedIn with relevant hashtags" },
                { icon: "📋", tip: "Put up posters on college notice boards" },
                { icon: "🎙️", tip: "Announce in classes and college events" },
                { icon: "📧", tip: "Send an email blast to student clubs" },
              ].map(({ icon, tip }) => (
                <div
                  key={tip}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="flex-shrink-0">{icon}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Footer contact ───────────────────────────────────────────────── */}
      <div className="border-t border-border pt-6 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          Questions about your college partnership?
        </p>
        <p className="text-xs text-muted-foreground">
          Email us at{" "}
          <a
            href="mailto:partnerships@eliteforums.in"
            className="text-editorial-pink hover:underline font-bold"
          >
            partnerships@eliteforums.in
          </a>
        </p>
      </div>
    </PortalLayout>
  );
};

export default CollegePartnerDashboard;
