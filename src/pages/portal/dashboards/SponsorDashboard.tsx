import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building2,
  Globe,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Users,
  Trophy,
  Target,
  MessageSquare,
  XCircle,
  Eye,
  Handshake,
} from "lucide-react";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import PortalLayout from "../PortalLayout";

// ─────────────────────────────────────────────
// Types & config
// ─────────────────────────────────────────────

type ProposalStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "converted"
  | "rejected";

type ProposalType =
  | "hiring_partner"
  | "tech_partner"
  | "education_partner"
  | "domain_sponsor"
  | string;

const STATUS_CONFIG: Record<
  ProposalStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    description: string;
  }
> = {
  new: {
    label: "RECEIVED",
    color: "text-editorial-orange",
    bg: "bg-editorial-orange/10",
    border: "border-editorial-orange",
    icon: <Clock size={14} />,
    description:
      "Your proposal has been received. Our partnerships team will review it within 48 hours.",
  },
  reviewed: {
    label: "UNDER REVIEW",
    color: "text-editorial-blue",
    bg: "bg-editorial-blue/10",
    border: "border-editorial-blue",
    icon: <Eye size={14} />,
    description:
      "We've reviewed your proposal and are evaluating the partnership fit. We'll be in touch very soon.",
  },
  contacted: {
    label: "IN DISCUSSION",
    color: "text-editorial-purple",
    bg: "bg-editorial-purple/10",
    border: "border-editorial-purple",
    icon: <MessageSquare size={14} />,
    description:
      "Our partnerships team has reached out to you. Please check your email for the latest communication.",
  },
  converted: {
    label: "PARTNER",
    color: "text-editorial-green",
    bg: "bg-editorial-green/10",
    border: "border-editorial-green",
    icon: <CheckCircle2 size={14} />,
    description:
      "Welcome aboard! You're now an official InnovaHack 2026 partner. Check your email for onboarding details.",
  },
  rejected: {
    label: "NOT PROCEEDING",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500",
    icon: <XCircle size={14} />,
    description:
      "Thank you for your interest in InnovaHack 2026. Unfortunately we're unable to proceed with this partnership at this time.",
  },
};

const PROPOSAL_TYPE_LABELS: Record<ProposalType, string> = {
  hiring_partner: "HIRING PARTNER",
  tech_partner: "TECH PARTNER",
  education_partner: "EDUCATION PARTNER",
  domain_sponsor: "DOMAIN SPONSOR",
};

const PROPOSAL_TYPE_COLORS: Record<ProposalType, string> = {
  hiring_partner: "text-editorial-blue border-editorial-blue",
  tech_partner: "text-editorial-purple border-editorial-purple",
  education_partner: "text-editorial-green border-editorial-green",
  domain_sponsor: "text-editorial-orange border-editorial-orange",
};

// Benefits per proposal type
const BENEFITS_MAP: Record<
  string,
  { icon: React.ReactNode; title: string; desc: string }[]
> = {
  hiring_partner: [
    {
      icon: <Users size={16} />,
      title: "DIRECT TALENT ACCESS",
      desc: "First access to shortlisted participants' profiles, resumes, and GitHub portfolios before the event.",
    },
    {
      icon: <Target size={16} />,
      title: "EXCLUSIVE RECRUITING BOOTH",
      desc: "Dedicated space during Demo Day to conduct informal interviews and connect with top builders.",
    },
    {
      icon: <Star size={16} />,
      title: "BRAND VISIBILITY",
      desc: "Logo placement on event website, banners, email communications, and social media posts.",
    },
    {
      icon: <Trophy size={16} />,
      title: "SPONSORED TRACK PRIZE",
      desc: "Option to sponsor a specific domain track and present prizes directly to winners.",
    },
    {
      icon: <Briefcase size={16} />,
      title: "POST-EVENT RESUME ACCESS",
      desc: "Full resume database of all consenting hackathon participants for 30 days post-event.",
    },
  ],
  tech_partner: [
    {
      icon: <Zap size={16} />,
      title: "API & TOOL SHOWCASE",
      desc: "Your product is introduced in the opening ceremony and available for participants to use during the hackathon.",
    },
    {
      icon: <Star size={16} />,
      title: "BRAND VISIBILITY",
      desc: "Logo placement on event website, banners, email communications, and social media posts.",
    },
    {
      icon: <Trophy size={16} />,
      title: "BEST USE AWARD",
      desc: "Sponsor a 'Best Use of [Your Tech]' award — judged by your team, prizes determined by you.",
    },
    {
      icon: <Users size={16} />,
      title: "DEVELOPER COMMUNITY GROWTH",
      desc: "Direct exposure to hundreds of actively building developers who become product advocates.",
    },
    {
      icon: <Target size={16} />,
      title: "WORKSHOP SLOT",
      desc: "Optional 30-minute workshop or demo session to showcase your product to all participants.",
    },
  ],
  education_partner: [
    {
      icon: <Star size={16} />,
      title: "BRAND VISIBILITY",
      desc: "Logo placement on event website, banners, email communications, and social media posts.",
    },
    {
      icon: <Users size={16} />,
      title: "AUDIENCE OF LEARNERS",
      desc: "Direct access to top 200–250 teams of student builders — highly motivated individuals looking for upskilling opportunities.",
    },
    {
      icon: <Target size={16} />,
      title: "COURSE PROMOTIONS",
      desc: "Distribute course vouchers or scholarship offers in event goody kits and through our email list.",
    },
    {
      icon: <Trophy size={16} />,
      title: "SPONSORED LEARNING PRIZE",
      desc: "Offer course subscriptions or certifications as prizes to track winners.",
    },
    {
      icon: <Zap size={16} />,
      title: "MENTORSHIP SLOT",
      desc: "Optional mentor participation — your experts can guide participants during the hackathon.",
    },
  ],
  domain_sponsor: [
    {
      icon: <Trophy size={16} />,
      title: "DOMAIN NAMING RIGHTS",
      desc: "Your brand associated with a specific domain track — e.g., 'FinTech Track powered by [Your Brand]'.",
    },
    {
      icon: <Star size={16} />,
      title: "PREMIUM BRAND VISIBILITY",
      desc: "Logo placement in all track-specific materials, website, banners, and communications.",
    },
    {
      icon: <Target size={16} />,
      title: "PRIZE PRESENTATION",
      desc: "Your representative presents prizes to domain track winners at the award ceremony.",
    },
    {
      icon: <Users size={16} />,
      title: "TARGETED TALENT ACCESS",
      desc: "Priority access to resumes and profiles of participants competing in your sponsored domain.",
    },
    {
      icon: <Zap size={16} />,
      title: "PROBLEM STATEMENT",
      desc: "Option to submit a real-world problem statement for participants in your domain to solve.",
    },
  ],
};

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
  <div className={`border-2 border-foreground ${className}`}>{children}</div>
);

const SectionHeader = ({
  eyebrow,
  title,
  accent = "text-editorial-pink",
  collapsible = false,
  open = true,
  onToggle,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) => (
  <div
    className={`flex items-center justify-between px-5 py-4 border-b-2 border-foreground ${
      collapsible
        ? "cursor-pointer hover:bg-secondary/40 transition-colors"
        : ""
    }`}
    onClick={collapsible ? onToggle : undefined}
  >
    <div>
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-[0.25em] ${accent} mb-0.5`}
        >
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
  </div>
);

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  eyebrow,
  title,
  accent,
  defaultOpen = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SectionCard>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        collapsible
        open={open}
        onToggle={() => setOpen((p) => !p)}
      />
      {open && <div className="px-5 py-5">{children}</div>}
    </SectionCard>
  );
};

// ─────────────────────────────────────────────
// Next steps content per status
// ─────────────────────────────────────────────

const NEXT_STEPS: Record<ProposalStatus, { arrow: string; items: string[] }> = {
  new: {
    arrow: "text-editorial-orange",
    items: [
      "Your proposal is in our queue — we review all submissions within 48 hours",
      "Our partnerships team will contact you via the email you submitted",
      "Prepare any questions you have about partnership tiers and benefits",
      "In the meantime, explore our website to understand the InnovaHack ecosystem",
    ],
  },
  reviewed: {
    arrow: "text-editorial-blue",
    items: [
      "We've reviewed your proposal and are assessing the best partnership structure",
      "Expect a response from our team within 24–48 hours",
      "If you have urgent queries, email us at partnerships@eliteforums.in",
      "Review your submitted proposal details below to ensure accuracy",
    ],
  },
  contacted: {
    arrow: "text-editorial-purple",
    items: [
      "Check your email for our latest message — reply at your earliest convenience",
      "If you haven't received our email, check your spam/junk folder",
      "We can schedule a call if you'd prefer to discuss the partnership over a call",
      "Contact partnerships@eliteforums.in if you need to reach us urgently",
    ],
  },
  converted: {
    arrow: "text-editorial-green",
    items: [
      "Check your email for official onboarding documentation and partnership agreement",
      "Share your logo in high-resolution PNG/SVG format for website and print use",
      "Confirm your point-of-contact person for event day logistics",
      "Review the partnership benefits and share with your team",
      "Mark the event date on your calendar — details in the onboarding email",
    ],
  },
  rejected: {
    arrow: "text-red-400",
    items: [
      "We appreciate your interest in being part of InnovaHack 2026",
      "Watch out for future InnovaHack editions — we'd love to collaborate",
      "Follow us on social media to stay updated on upcoming opportunities",
      "For feedback or to resubmit in the future, email partnerships@eliteforums.in",
    ],
  },
};

// ─────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────

const SponsorDashboard = () => {
  const { user } = usePortalAuth();
  const data = user?.profileData as Record<string, unknown> | null;

  if (!data) {
    return (
      <PortalLayout title="PARTNER PORTAL">
        <div className="border-2 border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No proposal data found. Please contact support.
          </p>
        </div>
      </PortalLayout>
    );
  }

  const status = (data.status as ProposalStatus) ?? "new";
  const proposalType = (data.proposal_type as ProposalType) ?? "hiring_partner";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  const nextSteps = NEXT_STEPS[status] ?? NEXT_STEPS.new;
  const benefits = BENEFITS_MAP[proposalType] ?? BENEFITS_MAP.hiring_partner;
  const typeLabel =
    PROPOSAL_TYPE_LABELS[proposalType] ??
    proposalType.replace(/_/g, " ").toUpperCase();
  const typeColor =
    PROPOSAL_TYPE_COLORS[proposalType] ??
    "text-editorial-blue border-editorial-blue";

  const submittedAt = data.created_at
    ? new Date(data.created_at as string).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const proposalId = (data.id as string)?.slice(0, 8).toUpperCase() ?? "—";

  return (
    <PortalLayout
      title={typeLabel}
      subtitle={`Proposal #${proposalId}${submittedAt ? ` · Submitted on ${submittedAt}` : ""}`}
    >
      {/* ── 1. STATUS BANNER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`border-2 ${statusCfg.border} ${statusCfg.bg} px-5 py-5`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Type badge + status badge */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <div className={`border px-3 py-1.5 ${typeColor}`}>
              <span className="text-xs font-black uppercase tracking-widest">
                {typeLabel}
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 border ${statusCfg.border} px-3 py-1.5 ${statusCfg.color}`}
            >
              {statusCfg.icon}
              <span className="text-xs font-black uppercase tracking-widest">
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className={`text-sm leading-relaxed ${statusCfg.color} font-medium`}
          >
            {statusCfg.description}
          </p>
        </div>

        {/* Converted congratulations banner */}
        {status === "converted" && (
          <div className="mt-4 border border-editorial-green/40 bg-editorial-green/5 px-4 py-3 flex items-center gap-3">
            <Handshake
              size={16}
              className="text-editorial-green flex-shrink-0"
            />
            <p className="text-xs text-editorial-green font-bold">
              🎉 Welcome to the InnovaHack 2026 partner family! We're excited to
              build something amazing together.
            </p>
          </div>
        )}
      </motion.div>

      {/* ── 2. WHAT'S NEXT ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <SectionCard>
          <SectionHeader
            eyebrow="NEXT STEPS"
            title="WHAT'S NEXT"
            accent={statusCfg.color}
          />
          <div className="px-5 py-5 space-y-2.5">
            {nextSteps.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <span
                  className={`${nextSteps.arrow} mt-0.5 flex-shrink-0 font-black`}
                >
                  →
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {/* ── 3. PROPOSAL DETAILS ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <CollapsibleSection
          eyebrow="SUBMITTED DETAILS"
          title="MY PROPOSAL"
          accent="text-editorial-pink"
          defaultOpen
        >
          <div>
            <DetailRow
              icon={<User size={14} />}
              label="Contact Person"
              value={data.contact_name as string}
            />
            <DetailRow
              icon={<Mail size={14} />}
              label="Email Address"
              value={data.email as string}
            />
            <DetailRow
              icon={<Phone size={14} />}
              label="Phone Number"
              value={data.phone as string}
            />
            <DetailRow
              icon={<Building2 size={14} />}
              label="Organisation / Company"
              value={
                (data.organisation_name as string) ??
                (data.company_name as string)
              }
            />
            <DetailRow
              icon={<Globe size={14} />}
              label="Website"
              value={data.website as string}
            />
            <DetailRow
              icon={<Briefcase size={14} />}
              label="Partnership Type"
              value={typeLabel}
            />
            <DetailRow
              icon={<Target size={14} />}
              label="Domain / Track Interest"
              value={data.domain_interest as string}
            />
            <DetailRow
              icon={<FileText size={14} />}
              label="Proposal Message"
              value={data.message as string}
            />
            {data.budget_range && (
              <DetailRow
                icon={<Star size={14} />}
                label="Budget Range"
                value={data.budget_range as string}
              />
            )}
            {data.notes && (
              <DetailRow
                icon={<MessageSquare size={14} />}
                label="Additional Notes"
                value={data.notes as string}
              />
            )}
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* ── 4. PARTNERSHIP BENEFITS ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <CollapsibleSection
          eyebrow="WHAT YOU GET"
          title="PARTNERSHIP BENEFITS"
          accent="text-editorial-blue"
          defaultOpen
        >
          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="border border-border bg-secondary/30 px-4 py-4 flex items-start gap-4"
              >
                <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0 text-editorial-blue">
                  {benefit.icon}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-1">
                    {benefit.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Converted partners get extra note */}
          {status === "converted" && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-start gap-3 bg-editorial-green/5 border border-editorial-green/40 px-4 py-3">
                <CheckCircle2
                  size={14}
                  className="text-editorial-green mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-editorial-green leading-relaxed">
                  <strong>You're confirmed!</strong> These benefits are now
                  active for your partnership. Reach out to us to start
                  coordinating deliverables.
                </p>
              </div>
            </div>
          )}
        </CollapsibleSection>
      </motion.div>

      {/* ── 5. CONTACT ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionCard>
          <SectionHeader
            eyebrow="GET IN TOUCH"
            title="CONTACT US"
            accent="text-editorial-purple"
          />
          <div className="px-5 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Have questions about your proposal, partnership terms, or event
              logistics? Our partnerships team is here to help.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="mailto:partnerships@eliteforums.in"
                className="group flex items-center gap-3 border-2 border-foreground px-4 py-4 hover:bg-foreground hover:text-background transition-all"
              >
                <Mail
                  size={18}
                  className="text-editorial-pink group-hover:text-background transition-colors flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5 group-hover:text-background transition-colors">
                    PARTNERSHIPS TEAM
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-background/70 transition-colors">
                    partnerships@eliteforums.in
                  </p>
                </div>
              </a>

              <a
                href="mailto:hello@eliteforums.in"
                className="group flex items-center gap-3 border border-border px-4 py-4 hover:border-foreground hover:bg-secondary/60 transition-all"
              >
                <MessageSquare
                  size={18}
                  className="text-editorial-blue flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5">
                    GENERAL INQUIRIES
                  </p>
                  <p className="text-xs text-muted-foreground">
                    hello@eliteforums.in
                  </p>
                </div>
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              We typically respond within{" "}
              <strong className="text-foreground">24–48 business hours</strong>.
            </p>
          </div>
        </SectionCard>
      </motion.div>
    </PortalLayout>
  );
};

export default SponsorDashboard;
