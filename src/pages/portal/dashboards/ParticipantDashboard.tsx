import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Code2,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  GitBranch,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import PortalLayout from "../PortalLayout";

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────

type AppStatus = "pending" | "shortlisted" | "confirmed" | "rejected";

const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; description: string }
> = {
  pending: {
    label: "PENDING",
    color: "text-editorial-orange",
    bg: "bg-editorial-orange/10",
    border: "border-editorial-orange",
    icon: <Clock size={14} />,
    description: "Your application is under review. We'll notify you via email once a decision has been made.",
  },
  shortlisted: {
    label: "SHORTLISTED",
    color: "text-editorial-blue",
    bg: "bg-editorial-blue/10",
    border: "border-editorial-blue",
    icon: <Star size={14} />,
    description: "Congratulations! You've been shortlisted. Please check your email for next steps and further instructions.",
  },
  confirmed: {
    label: "CONFIRMED",
    color: "text-editorial-green",
    bg: "bg-editorial-green/10",
    border: "border-editorial-green",
    icon: <CheckCircle2 size={14} />,
    description: "You're IN! Check your email for full event details, venue address, schedule, and what to bring.",
  },
  rejected: {
    label: "NOT SELECTED",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500",
    icon: <XCircle size={14} />,
    description: "Thank you for applying to InnovaHack 2026. Unfortunately you weren't selected this time. We hope to see you in future editions!",
  },
};

// ─────────────────────────────────────────────
// Timeline steps
// ─────────────────────────────────────────────

const TIMELINE_STEPS: { key: AppStatus | "submitted"; label: string; desc: string }[] = [
  { key: "submitted", label: "SUBMITTED", desc: "Application received" },
  { key: "pending", label: "UNDER REVIEW", desc: "Being reviewed by our team" },
  { key: "shortlisted", label: "SHORTLISTED", desc: "Selected for final round" },
  { key: "confirmed", label: "CONFIRMED", desc: "You're in!" },
];

const getTimelineStep = (status: AppStatus): number => {
  switch (status) {
    case "pending": return 1;
    case "shortlisted": return 2;
    case "confirmed": return 3;
    case "rejected": return 1; // stays at review, not confirmed
    default: return 0;
  }
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | string[] | null;
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {value.map((v) => (
              <span
                key={v}
                className="text-xs font-bold bg-secondary border border-border px-2 py-0.5 uppercase tracking-wide"
              >
                {v}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({
  title,
  eyebrow,
  accent = "text-editorial-pink",
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  eyebrow?: string;
  accent?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-2 border-foreground">
      <button
        className={`w-full flex items-center justify-between px-5 py-4 border-b-2 border-foreground ${
          collapsible ? "cursor-pointer hover:bg-secondary/40 transition-colors" : "cursor-default"
        }`}
        onClick={() => collapsible && setOpen((p) => !p)}
        disabled={!collapsible}
      >
        <div className="text-left">
          {eyebrow && (
            <p className={`text-xs font-bold uppercase tracking-[0.25em] ${accent} mb-0.5`}>
              {eyebrow}
            </p>
          )}
          <h2 className="text-base font-black uppercase tracking-tight">{title}</h2>
        </div>
        {collapsible && (
          <span className="text-muted-foreground">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        )}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────

const ParticipantDashboard = () => {
  const { user } = usePortalAuth();
  const data = user?.profileData as Record<string, unknown> | null;

  if (!data) {
    return (
      <PortalLayout title="MY APPLICATION">
        <div className="border-2 border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No application data found. Please contact support.
          </p>
        </div>
      </PortalLayout>
    );
  }

  const status = (data.status as AppStatus) ?? "pending";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const timelineStep = getTimelineStep(status);

  const teamMembers = (data.team_members as Record<string, unknown>[] | null) ?? [];
  const skills = (data.skills as string[] | null) ?? [];
  const refCode = data.ref_code as string | null;
  const referralSource = data.referral_source as string | null;

  const createdAt = data.created_at
    ? new Date(data.created_at as string).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PortalLayout
      title="MY APPLICATION"
      subtitle={`Submitted on ${createdAt ?? "—"} · Application ID: ${(data.id as string)?.slice(0, 8).toUpperCase() ?? "—"}`}
    >
      {/* ── Status banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`border-2 ${statusCfg.border} ${statusCfg.bg} px-5 py-5`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 border ${statusCfg.border} w-fit ${statusCfg.color}`}
          >
            {statusCfg.icon}
            <span className="text-xs font-black uppercase tracking-widest">
              {statusCfg.label}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${statusCfg.color} font-medium`}>
            {statusCfg.description}
          </p>
        </div>
      </motion.div>

      {/* ── Status timeline ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <SectionCard title="APPLICATION JOURNEY" eyebrow="STATUS TIMELINE">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-editorial-pink transition-all duration-700"
              style={{
                width:
                  status === "rejected"
                    ? "25%"
                    : `${Math.min(timelineStep * 33.3, 100)}%`,
              }}
            />

            <div className="relative grid grid-cols-4 gap-2">
              {TIMELINE_STEPS.map((step, i) => {
                const isActive = i <= timelineStep;
                const isCurrent = i === timelineStep;
                const isRejectedStep = status === "rejected" && i === 1;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center gap-2">
                    {/* Dot */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center border-2 z-10 transition-all ${
                        isRejectedStep
                          ? "border-red-500 bg-red-500/20"
                          : isActive
                          ? "border-editorial-pink bg-editorial-pink"
                          : "border-border bg-background"
                      }`}
                    >
                      {isRejectedStep ? (
                        <XCircle size={16} className="text-red-400" />
                      ) : isActive ? (
                        <CheckCircle2 size={16} className="text-background" />
                      ) : (
                        <div className="w-2 h-2 bg-border rounded-full" />
                      )}
                    </div>

                    {/* Labels */}
                    <div>
                      <p
                        className={`text-xs font-black uppercase tracking-tight leading-tight ${
                          isRejectedStep
                            ? "text-red-400"
                            : isCurrent
                            ? "text-editorial-pink"
                            : isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isRejectedStep ? "REJECTED" : step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block leading-tight">
                        {isRejectedStep ? "Not selected" : step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ── What's next ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionCard
          title="WHAT'S NEXT"
          eyebrow="NEXT STEPS"
          accent={statusCfg.color}
        >
          <div className="space-y-3">
            {status === "pending" && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your application is currently under review by our team. This typically takes
                  <strong className="text-foreground"> 5–10 business days</strong>.
                </p>
                <ul className="space-y-2">
                  {[
                    "Keep an eye on your email inbox (including spam/junk)",
                    "We'll notify you once a decision has been made",
                    "Shortlisted participants will receive next-step instructions",
                    "No action is required from you at this stage",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-editorial-orange mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {status === "shortlisted" && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  🎉 Congratulations on being shortlisted! You are among the{" "}
                  <strong className="text-foreground">top candidates</strong> for InnovaHack 2026.
                </p>
                <ul className="space-y-2">
                  {[
                    "Check your email for a confirmation and next-step instructions",
                    "Complete any required onboarding steps mentioned in the email",
                    "Mark your calendar — the hackathon date will be shared soon",
                    "Start brushing up on your chosen domain track",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-editorial-blue mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {status === "confirmed" && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  🚀 You're officially IN for InnovaHack 2026! Get ready for{" "}
                  <strong className="text-foreground">30 hours of non-stop hacking</strong>.
                </p>
                <ul className="space-y-2">
                  {[
                    "Check your email for venue address, schedule, and logistics",
                    "Arrive on time — check-in starts 30 mins before the event",
                    "Bring your laptop, charger, and ID",
                    "Review the event rules and hackathon tracks",
                    "Connect with your team members ahead of the event",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-editorial-green mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {status === "rejected" && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you for your interest in InnovaHack 2026. We received an overwhelming
                  number of applications and unfortunately couldn't select everyone.
                </p>
                <ul className="space-y-2">
                  {[
                    "Follow us on social media for future events and opportunities",
                    "Continue building your skills and portfolio",
                    "Watch out for InnovaHack Chapter 2 — applications open soon",
                    "Join our community to stay connected with fellow builders",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Application data ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <SectionCard
          title="MY APPLICATION DATA"
          eyebrow="SUBMITTED DETAILS"
          collapsible
          defaultOpen
        >
          <div className="space-y-0">
            <InfoRow
              icon={<User size={14} />}
              label="Full Name"
              value={data.full_name as string}
            />
            <InfoRow
              icon={<Mail size={14} />}
              label="Email Address"
              value={data.email as string}
            />
            <InfoRow
              icon={<Phone size={14} />}
              label="Contact Number"
              value={data.contact_no as string}
            />
            <InfoRow
              icon={<MapPin size={14} />}
              label="City"
              value={data.city as string}
            />
            <InfoRow
              icon={<Building2 size={14} />}
              label="Organisation / College"
              value={data.organisation_name as string}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="Year / Experience"
              value={data.year_or_experience as string}
            />
            <InfoRow
              icon={<Tag size={14} />}
              label="Branch / Department"
              value={data.branch_or_department as string}
            />
            <InfoRow
              icon={<Code2 size={14} />}
              label="Skills"
              value={skills}
            />
            {data.github_url && (
              <InfoRow
                icon={<GitBranch size={14} />}
                label="GitHub"
                value={data.github_url as string}
              />
            )}
            {data.linkedin_url && (
              <InfoRow
                icon={<Linkedin size={14} />}
                label="LinkedIn"
                value={data.linkedin_url as string}
              />
            )}
            <InfoRow
              icon={<Users size={14} />}
              label="Team Type"
              value={(data.team_type as string)?.toUpperCase()}
            />
          </div>

          {/* Team members */}
          {teamMembers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                TEAM MEMBERS ({teamMembers.length})
              </p>
              <div className="space-y-3">
                {teamMembers.map((member, i) => (
                  <div
                    key={i}
                    className="border border-border bg-secondary/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-editorial-pink flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-background">{i + 1}</span>
                      </div>
                      <p className="text-sm font-black uppercase tracking-tight">
                        {(member.full_name as string) || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-8">
                      {member.email && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">Email: </span>
                          {member.email as string}
                        </p>
                      )}
                      {member.city && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">City: </span>
                          {member.city as string}
                        </p>
                      )}
                      {member.organisation_name && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">Org: </span>
                          {member.organisation_name as string}
                        </p>
                      )}
                      {(member.skills as string[] | null)?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">Skills: </span>
                          {(member.skills as string[]).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ── Referral badge ────────────────────────────────────────── */}
      {(refCode || referralSource) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SectionCard
            title="REFERRED BY"
            eyebrow="REFERRAL BADGE"
            accent="text-editorial-green"
            collapsible
            defaultOpen
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-editorial-green/10 border-2 border-editorial-green flex items-center justify-center flex-shrink-0">
                <Tag size={20} className="text-editorial-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">
                  Referral Code Applied
                </p>
                <p className="text-xl font-black uppercase tracking-tighter text-editorial-green">
                  {refCode ?? referralSource}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You were referred by a community partner. Thank them for spreading the word!
                </p>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* ── Notes (if any) ────────────────────────────────────────── */}
      {data.notes && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <SectionCard title="NOTES FROM TEAM" eyebrow="ADMIN NOTES" accent="text-editorial-purple">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.notes as string}
            </p>
          </SectionCard>
        </motion.div>
      )}

      {/* ── Footer info ───────────────────────────────────────────── */}
      <div className="border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Have questions about your application?{" "}
          <a
            href="mailto:hello@eliteforums.in"
            className="text-editorial-pink hover:underline font-bold"
          >
            hello@eliteforums.in
          </a>
        </p>
      </div>
    </PortalLayout>
  );
};

export default ParticipantDashboard;
