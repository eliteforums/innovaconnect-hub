import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/admin/AdminEditorLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Link,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  Eye,
  ExternalLink,
  Users,
  TrendingUp,
  Award,
  Search,
  Download,
  Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CommunityPartner = {
  id: string;
  ref_code: string;
  referral_link: string;
  community_name: string;
  community_platform?: string;
  community_size?: string;
  community_focus?: string;
  contact_person_name: string;
  email: string;
  phone_number?: string;
  role_in_community?: string;
  total_referrals: number;
  live_referral_count?: number;
  pending_count?: number;
  shortlisted_count?: number;
  confirmed_count?: number;
  rejected_count?: number;
  rank_position?: number;
  status: "pending" | "approved" | "suspended" | "rejected";
  reward_tier?: "gold" | "silver" | "bronze" | null;
  notes?: string;
  proposal_id?: string;
  created_at: string;
};

type ReferralRegistration = {
  registration_id: string;
  full_name: string;
  registrant_email: string;
  city?: string;
  team_type?: string;
  registration_status?: string;
  registered_at: string;
  ref_code: string;
  referral_source?: string;
  community_name?: string;
  community_contact?: string;
  community_email?: string;
  community_platform?: string;
};

type LeaderboardEntry = CommunityPartner & {
  rank_position: number;
};

// ─── Copy Hook ────────────────────────────────────────────────────────────────

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildReferralLink = (ref_code: string) =>
  `https://innovahack.in/register?ref=${ref_code}`;

const generateRefCode = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const STATUS_STYLES: Record<string, { text: string; bg: string }> = {
  approved:  { text: "text-green-400",  bg: "bg-green-500/20"  },
  pending:   { text: "text-yellow-400", bg: "bg-yellow-500/20" },
  suspended: { text: "text-red-400",    bg: "bg-red-500/20"    },
  rejected:  { text: "text-red-400",    bg: "bg-red-500/20"    },
};

const TIER_STYLES: Record<string, { border: string; bg: string; emoji: string; medal: string }> = {
  gold:   { border: "border-yellow-500", bg: "bg-yellow-500/10", emoji: "🥇", medal: "text-yellow-400" },
  silver: { border: "border-gray-400",   bg: "bg-gray-400/10",   emoji: "🥈", medal: "text-gray-300"   },
  bronze: { border: "border-orange-400", bg: "bg-orange-400/10", emoji: "🥉", medal: "text-orange-400" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? { text: "text-muted-foreground", bg: "bg-secondary" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${s.text} ${s.bg}`}>
      {status}
    </span>
  );
};

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Blank partner form ───────────────────────────────────────────────────────

const BLANK_PARTNER: Omit<CommunityPartner, "id" | "created_at" | "total_referrals"> = {
  ref_code: "",
  referral_link: "",
  community_name: "",
  community_platform: "",
  community_size: "",
  community_focus: "",
  contact_person_name: "",
  email: "",
  phone_number: "",
  role_in_community: "",
  status: "pending",
  reward_tier: null,
  notes: "",
};

// ─── Approve From Proposal Modal ──────────────────────────────────────────────

const ApproveFromProposalModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [proposalId, setProposalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApprove = async () => {
    if (!proposalId.trim()) return;
    setLoading(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("approve_community_partner", {
      p_proposal_id: proposalId.trim(),
    });
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="bg-background border-2 border-foreground w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-black uppercase tracking-tighter">APPROVE FROM PROPOSAL</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter the Proposal ID (UUID) of a community proposal to auto-create and approve a community partner record from it.
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              PROPOSAL ID (UUID)
            </Label>
            <Input
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="bg-secondary border-border rounded-none text-xs font-mono focus:border-editorial-pink"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 font-bold">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-400 font-bold flex items-center gap-1.5">
              <Check size={12} /> Partner approved successfully!
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={loading || !proposalId.trim() || success}
              className="text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "APPROVING..." : "APPROVE"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Partner Form ─────────────────────────────────────────────────────────────

const PartnerForm = ({
  initial,
  onSave,
  onCancel,
  isEdit = false,
}: {
  initial?: Partial<CommunityPartner>;
  onSave: (data: Partial<CommunityPartner>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}) => {
  const [form, setForm] = useState<Partial<CommunityPartner>>({
    ...BLANK_PARTNER,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [refCodeManual, setRefCodeManual] = useState(!!initial?.ref_code);

  const set = (key: keyof CommunityPartner, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "community_name" && !refCodeManual) {
        const code = generateRefCode(value);
        next.ref_code = code;
        next.referral_link = buildReferralLink(code);
      }
      if (key === "ref_code") {
        next.referral_link = buildReferralLink(value);
        setRefCodeManual(true);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.community_name?.trim() || !form.ref_code?.trim() || !form.contact_person_name?.trim() || !form.email?.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="border-2 border-border bg-secondary/20 p-5 space-y-4">
      <p className="text-xs font-black uppercase tracking-tighter text-editorial-pink">
        {isEdit ? "EDIT PARTNER" : "ADD NEW PARTNER"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Community Name *</Label>
          <Input
            value={form.community_name ?? ""}
            onChange={(e) => set("community_name", e.target.value)}
            placeholder="Tech Community India"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ref Code * (auto-generated)</Label>
          <Input
            value={form.ref_code ?? ""}
            onChange={(e) => set("ref_code", e.target.value)}
            placeholder="tech-community-india"
            className="bg-secondary border-border rounded-none text-xs font-mono focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Person *</Label>
          <Input
            value={form.contact_person_name ?? ""}
            onChange={(e) => set("contact_person_name", e.target.value)}
            placeholder="John Doe"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email *</Label>
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contact@community.com"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone</Label>
          <Input
            value={form.phone_number ?? ""}
            onChange={(e) => set("phone_number", e.target.value)}
            placeholder="+91 9999999999"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Platform</Label>
          <Input
            value={form.community_platform ?? ""}
            onChange={(e) => set("community_platform", e.target.value)}
            placeholder="Discord, WhatsApp, LinkedIn…"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Community Size</Label>
          <Input
            value={form.community_size ?? ""}
            onChange={(e) => set("community_size", e.target.value)}
            placeholder="500+"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Community Focus</Label>
          <Input
            value={form.community_focus ?? ""}
            onChange={(e) => set("community_focus", e.target.value)}
            placeholder="AI, Web Dev, Startups…"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
          <select
            value={form.status ?? "pending"}
            onChange={(e) => set("status", e.target.value)}
            className="w-full bg-secondary border border-border px-3 py-2 text-xs focus:outline-none focus:border-editorial-pink transition-colors"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</Label>
          <Input
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Internal notes…"
            className="bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
          />
        </div>
      </div>

      {form.ref_code && (
        <div className="bg-secondary/40 border border-border px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Generated Referral Link</p>
          <p className="text-xs font-mono text-editorial-pink">{buildReferralLink(form.ref_code)}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !form.community_name?.trim() || !form.ref_code?.trim() || !form.contact_person_name?.trim() || !form.email?.trim()}
          className="text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "SAVING..." : isEdit ? "SAVE CHANGES" : "ADD PARTNER"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReferralsSection = () => {
  const [tab, setTab] = useState<"leaderboard" | "partners" | "registrations">("leaderboard");

  // Shared data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [partners, setPartners] = useState<CommunityPartner[]>([]);
  const [registrations, setRegistrations] = useState<ReferralRegistration[]>([]);

  // Loading states
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);

  // Partners tab state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Registrations tab state
  const [regSearch, setRegSearch] = useState("");
  const [regRefFilter, setRegRefFilter] = useState("all");

  const { copied, copy } = useCopy();

  // ── Fetch Functions ─────────────────────────────────────────────────────────

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const { data } = await supabase
      .from("referral_leaderboard")
      .select("*")
      .order("live_referral_count", { ascending: false });
    setLeaderboard((data ?? []) as LeaderboardEntry[]);
    setLoadingLeaderboard(false);
  };

  const fetchPartners = async () => {
    setLoadingPartners(true);
    const { data } = await supabase
      .from("community_partners")
      .select("*")
      .order("created_at", { ascending: false });
    setPartners((data ?? []) as CommunityPartner[]);
    setLoadingPartners(false);
  };

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    const { data } = await supabase
      .from("referral_registrations")
      .select("*")
      .order("registered_at", { ascending: false });
    setRegistrations((data ?? []) as ReferralRegistration[]);
    setLoadingRegistrations(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchPartners();
    fetchRegistrations();
  }, []);

  // ── Partner CRUD ────────────────────────────────────────────────────────────

  const handleSavePartner = async (formData: Partial<CommunityPartner>) => {
    const payload = {
      ...formData,
      referral_link: buildReferralLink(formData.ref_code ?? ""),
      total_referrals: formData.total_referrals ?? 0,
    };
    if (editingPartner?.id) {
      await supabase
        .from("community_partners")
        .update(payload)
        .eq("id", editingPartner.id);
    } else {
      await supabase.from("community_partners").upsert(payload);
    }
    setShowAddForm(false);
    setEditingPartner(null);
    fetchPartners();
    fetchLeaderboard();
  };

  const handleApprove = async (id: string) => {
    await supabase
      .from("community_partners")
      .update({ status: "approved" })
      .eq("id", id);
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
    );
  };

  const handleSuspend = async (id: string) => {
    await supabase
      .from("community_partners")
      .update({ status: "suspended" })
      .eq("id", id);
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "suspended" } : p))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this community partner? This cannot be undone.")) return;
    await supabase.from("community_partners").delete().eq("id", id);
    setPartners((prev) => prev.filter((p) => p.id !== id));
    fetchLeaderboard();
  };

  // ── Derived / Filtered Data ─────────────────────────────────────────────────

  const filteredRegistrations = useMemo(() => {
    let list = [...registrations];
    if (regRefFilter !== "all") list = list.filter((r) => r.ref_code === regRefFilter);
    if (regSearch.trim()) {
      const q = regSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.registrant_email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [registrations, regRefFilter, regSearch]);

  const leaderboardStats = useMemo(() => {
    const approved = partners.filter((p) => p.status === "approved").length;
    const totalRefs = registrations.length;
    const top = leaderboard[0];
    return { approved, totalRefs, top };
  }, [partners, registrations, leaderboard]);

  // ── CSV Exports ─────────────────────────────────────────────────────────────

  const exportLeaderboardCSV = () => {
    const headers = ["Rank", "Community", "Platform", "Contact", "Email", "Total Refs", "Pending", "Shortlisted", "Confirmed", "Status"];
    const rows = leaderboard.map((p, i) => [
      i + 1, p.community_name, p.community_platform ?? "", p.contact_person_name,
      p.email, p.live_referral_count ?? p.total_referrals,
      p.pending_count ?? 0, p.shortlisted_count ?? 0, p.confirmed_count ?? 0, p.status,
    ]);
    downloadCSV([headers, ...rows], "innovahack-referral-leaderboard");
  };

  const exportRegistrationsCSV = () => {
    const headers = ["Name", "Email", "City", "Team Type", "Status", "Community", "Ref Code", "Registered At"];
    const rows = filteredRegistrations.map((r) => [
      r.full_name, r.registrant_email, r.city ?? "", r.team_type ?? "",
      r.registration_status ?? "", r.community_name ?? "", r.ref_code,
      r.registered_at ? new Date(r.registered_at).toLocaleString("en-IN") : "",
    ]);
    downloadCSV([headers, ...rows], "innovahack-referral-registrations");
  };

  const downloadCSV = (rows: (string | number)[][], filename: string) => {
    const csv = rows
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        section="Data"
        title="REFERRALS"
        description="Community partner referral system — leaderboard, partner management, and referral registrations"
      />

      {/* Tab Switcher */}
      <div className="border-b border-border px-4 md:px-6 pt-4 pb-0 flex items-center gap-1">
        {(["leaderboard", "partners", "registrations"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-colors ${
              tab === t
                ? "border-editorial-pink text-editorial-pink"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "leaderboard" && <Trophy size={10} className="inline mr-1.5 mb-0.5" />}
            {t === "partners" && <Users size={10} className="inline mr-1.5 mb-0.5" />}
            {t === "registrations" && <TrendingUp size={10} className="inline mr-1.5 mb-0.5" />}
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-6 flex-1">
        <AnimatePresence mode="wait">
          {/* ════════════════════════════════════════════════════════════════
              TAB 1: LEADERBOARD
          ════════════════════════════════════════════════════════════════ */}
          {tab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border-2 border-border p-4">
                  <p className="text-3xl font-black">{leaderboardStats.approved}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Approved Partners</p>
                </div>
                <div className="border-2 border-border p-4">
                  <p className="text-3xl font-black">{leaderboardStats.totalRefs}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">Total Referral Applications</p>
                </div>
                <div className="border-2 border-editorial-pink/40 bg-editorial-pink/5 p-4">
                  <p className="text-3xl font-black text-editorial-pink">
                    {leaderboardStats.top ? leaderboard[0]?.live_referral_count ?? leaderboard[0]?.total_referrals ?? 0 : "—"}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    Top: {leaderboardStats.top?.community_name ?? "N/A"}
                  </p>
                </div>
              </div>

              {/* Top Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground">{leaderboard.length} partners ranked</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLeaderboard}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button
                    onClick={exportLeaderboardCSV}
                    disabled={leaderboard.length === 0}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-editorial-pink bg-editorial-pink/10 px-3 py-2 hover:bg-editorial-pink/20 transition-colors disabled:opacity-40"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>

              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  <RefreshCw size={14} className="animate-spin mr-2" /> Loading…
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="border-2 border-dashed border-border py-16 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  No leaderboard data yet
                </div>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  {leaderboard.length >= 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {leaderboard.slice(0, 3).map((partner, idx) => {
                        const tierKey = idx === 0 ? "gold" : idx === 1 ? "silver" : "bronze";
                        const tier = TIER_STYLES[tierKey];
                        return (
                          <div
                            key={partner.id}
                            className={`border-2 ${tier.border} ${tier.bg} p-4 relative`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-3xl">{tier.emoji}</span>
                              <StatusBadge status={partner.status} />
                            </div>
                            <p className="text-lg font-black uppercase tracking-tighter leading-tight">
                              {partner.community_name}
                            </p>
                            {partner.community_platform && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                {partner.community_platform}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{partner.contact_person_name}</p>
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className={`text-2xl font-black ${tier.medal}`}>
                                {partner.live_referral_count ?? partner.total_referrals ?? 0}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Referrals</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-yellow-400 font-bold">{partner.pending_count ?? 0} pending</span>
                                <span className="text-[10px] text-blue-400 font-bold">{partner.shortlisted_count ?? 0} shortlisted</span>
                                <span className="text-[10px] text-green-400 font-bold">{partner.confirmed_count ?? 0} confirmed</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rest as table */}
                  {leaderboard.length > 3 && (
                    <div className="border-2 border-border overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-secondary/40">
                            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">#</th>
                            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Community</th>
                            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Platform</th>
                            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Contact</th>
                            <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                            <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Pending</th>
                            <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Shortlisted</th>
                            <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Confirmed</th>
                            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.slice(3).map((partner, idx) => (
                            <tr key={partner.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-2.5 font-black text-muted-foreground">{idx + 4}</td>
                              <td className="px-4 py-2.5 font-bold">{partner.community_name}</td>
                              <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{partner.community_platform ?? "—"}</td>
                              <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{partner.contact_person_name}</td>
                              <td className="px-4 py-2.5 text-right font-black">{partner.live_referral_count ?? partner.total_referrals ?? 0}</td>
                              <td className="px-4 py-2.5 text-right text-yellow-400 hidden lg:table-cell">{partner.pending_count ?? 0}</td>
                              <td className="px-4 py-2.5 text-right text-blue-400 hidden lg:table-cell">{partner.shortlisted_count ?? 0}</td>
                              <td className="px-4 py-2.5 text-right text-green-400 hidden lg:table-cell">{partner.confirmed_count ?? 0}</td>
                              <td className="px-4 py-2.5"><StatusBadge status={partner.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: PARTNERS
          ════════════════════════════════════════════════════════════════ */}
          {tab === "partners" && (
            <motion.div
              key="partners"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Top Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground">{partners.length} total partners</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowProposalModal(true)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
                  >
                    <Award size={13} /> APPROVE FROM PROPOSAL
                  </button>
                  <button
                    onClick={fetchPartners}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button
                    onClick={() => { setShowAddForm((v) => !v); setEditingPartner(null); }}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-3 py-2 hover:opacity-90 transition-opacity"
                  >
                    {showAddForm ? <X size={13} /> : <Plus size={13} />}
                    {showAddForm ? "CANCEL" : "+ ADD PARTNER"}
                  </button>
                </div>
              </div>

              {/* Add Form */}
              <AnimatePresence>
                {showAddForm && !editingPartner && (
                  <motion.div
                    key="add-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <PartnerForm
                      onSave={handleSavePartner}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Form */}
              <AnimatePresence>
                {editingPartner && (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <PartnerForm
                      initial={editingPartner}
                      onSave={handleSavePartner}
                      onCancel={() => setEditingPartner(null)}
                      isEdit
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Partners Table */}
              {loadingPartners ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  <RefreshCw size={14} className="animate-spin mr-2" /> Loading…
                </div>
              ) : partners.length === 0 ? (
                <div className="border-2 border-dashed border-border py-16 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  No community partners yet
                </div>
              ) : (
                <div className="border-2 border-border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Community</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Platform</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Contact</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Email</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Ref Code</th>
                        <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground">Refs</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="px-4 py-2.5 text-right font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map((partner) => {
                        const referralLink = buildReferralLink(partner.ref_code);
                        const copyId = `link-${partner.id}`;
                        const refCopyId = `ref-${partner.id}`;
                        return (
                          <tr key={partner.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold leading-tight">{partner.community_name}</p>
                              {partner.community_size && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">{partner.community_size} members</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{partner.community_platform ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{partner.contact_person_name}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{partner.email}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <code className="font-mono text-editorial-pink bg-editorial-pink/10 px-1.5 py-0.5 text-[10px]">
                                  {partner.ref_code}
                                </code>
                                <button
                                  onClick={() => copy(referralLink, copyId)}
                                  title="Copy referral link"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {copied === copyId ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-black">
                              {partner.live_referral_count ?? partner.total_referrals ?? 0}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={partner.status} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {partner.status === "pending" && (
                                  <button
                                    onClick={() => handleApprove(partner.id)}
                                    title="Approve"
                                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                                  >
                                    Approve
                                  </button>
                                )}
                                {partner.status === "approved" && (
                                  <button
                                    onClick={() => handleSuspend(partner.id)}
                                    title="Suspend"
                                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                                  >
                                    Suspend
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditingPartner(partner); setShowAddForm(false); }}
                                  title="Edit"
                                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() => copy(referralLink, copyId)}
                                  title="Copy link"
                                  className="p-1.5 text-muted-foreground hover:text-editorial-pink transition-colors"
                                >
                                  {copied === copyId ? <Check size={12} className="text-green-400" /> : <Link size={12} />}
                                </button>
                                <button
                                  onClick={() => handleDelete(partner.id)}
                                  title="Delete"
                                  className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: REGISTRATIONS
          ════════════════════════════════════════════════════════════════ */}
          {tab === "registrations" && (
            <motion.div
              key="registrations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Controls */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  {registrations.length} total · {filteredRegistrations.length} shown
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRegistrations}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                  <button
                    onClick={exportRegistrationsCSV}
                    disabled={filteredRegistrations.length === 0}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-editorial-pink bg-editorial-pink/10 px-3 py-2 hover:bg-editorial-pink/20 transition-colors disabled:opacity-40"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Search name or email…"
                    className="pl-8 bg-secondary border-border rounded-none text-xs focus:border-editorial-pink"
                  />
                </div>
                <select
                  value={regRefFilter}
                  onChange={(e) => setRegRefFilter(e.target.value)}
                  className="bg-secondary border border-border px-3 py-2 text-xs focus:outline-none focus:border-editorial-pink transition-colors"
                >
                  <option value="all">All Ref Codes</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.ref_code}>
                      {p.ref_code} — {p.community_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              {loadingRegistrations ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  <RefreshCw size={14} className="animate-spin mr-2" /> Loading…
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="border-2 border-dashed border-border py-16 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  No referral registrations found
                </div>
              ) : (
                <div className="border-2 border-border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Name</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Email</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">City</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Team</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground">Community</th>
                        <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Registered At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.registration_id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-bold">{reg.full_name}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{reg.registrant_email}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{reg.city ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{reg.team_type ?? "—"}</td>
                          <td className="px-4 py-3">
                            {reg.registration_status ? (
                              <StatusBadge status={reg.registration_status} />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {reg.community_name ? (
                              <div>
                                <p className="font-bold leading-tight">{reg.community_name}</p>
                                <code className="text-[10px] font-mono text-editorial-pink">{reg.ref_code}</code>
                              </div>
                            ) : (
                              <code className="text-[10px] font-mono text-editorial-pink">{reg.ref_code}</code>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                            {reg.registered_at ? fmtDate(reg.registered_at) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Approve From Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <ApproveFromProposalModal
            onClose={() => setShowProposalModal(false)}
            onSuccess={() => { fetchPartners(); fetchLeaderboard(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferralsSection;
