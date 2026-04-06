import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/admin/AdminEditorLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartnerProposal = {
  id: string;
  proposal_type: string;
  created_at: string;
  contact_person_name?: string;
  work_email?: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
  organisation_name?: string;
  community_name?: string;
  college_university_name?: string;
  website?: string;
  company_website?: string;
  additional_message?: string;
  status?: string;
  notes?: string;
  [key: string]: unknown;
};

type ProposalStatus = "new" | "reviewed" | "contacted" | "converted" | "rejected";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEmail = (p: PartnerProposal) => p.work_email || p.email || "";
const getName  = (p: PartnerProposal) => p.contact_person_name || "";
const getOrg   = (p: PartnerProposal) =>
  p.company_name ||
  p.organisation_name ||
  p.community_name ||
  (p as Record<string, unknown>).college_university_name as string ||
  "";

const PROPOSAL_TYPES: Record<
  string,
  { label: string; textClass: string; bgClass: string }
> = {
  hiring_partner:    { label: "HIRING PARTNER",    textClass: "text-editorial-blue",   bgClass: "bg-editorial-blue/20"   },
  tech_partner:      { label: "TECH PARTNER",      textClass: "text-editorial-blue",   bgClass: "bg-editorial-blue/20"   },
  education_partner: { label: "EDUCATION PARTNER", textClass: "text-editorial-green",  bgClass: "bg-editorial-green/20"  },
  domain_sponsor:    { label: "DOMAIN SPONSOR",    textClass: "text-editorial-purple", bgClass: "bg-editorial-purple/20" },
  college_partner:   { label: "COLLEGE PARTNER",   textClass: "text-editorial-green",  bgClass: "bg-editorial-green/20"  },
  community_partner: { label: "COMMUNITY PARTNER", textClass: "text-editorial-orange", bgClass: "bg-editorial-orange/20" },
};

const STATUS_STYLES: Record<string, string> = {
  new:       "bg-editorial-pink/20 text-editorial-pink border-editorial-pink/40",
  reviewed:  "bg-editorial-blue/20 text-editorial-blue border-editorial-blue/40",
  contacted: "bg-editorial-purple/20 text-editorial-purple border-editorial-purple/40",
  converted: "bg-green-500/20 text-green-400 border-green-500/40",
  rejected:  "bg-red-500/20 text-red-400 border-red-500/40",
};

const SKIP_FIELDS = new Set(["id", "created_at", "updated_at", "proposal_type", "status", "notes"]);

const prettyKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: string }) => {
  const def = PROPOSAL_TYPES[type] ?? {
    label: type.replace(/_/g, " ").toUpperCase(),
    textClass: "text-muted-foreground",
    bgClass: "bg-secondary",
  };
  return (
    <span
      className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 border border-current/20 ${def.textClass} ${def.bgClass}`}
    >
      {def.label}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status?: string }) => {
  const s = status ?? "new";
  return (
    <span
      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
        STATUS_STYLES[s] ?? "bg-secondary text-muted-foreground border-border"
      }`}
    >
      {s}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
  proposal,
  onClose,
  onUpdate,
}: {
  proposal: PartnerProposal;
  onClose: () => void;
  onUpdate: (id: string, status: ProposalStatus, notes: string) => Promise<void>;
}) => {
  const [notes, setNotes]   = useState(proposal.notes ?? "");
  const [saving, setSaving] = useState(false);

  const email = getEmail(proposal);

  const handleSave = async (status: ProposalStatus) => {
    setSaving(true);
    await onUpdate(proposal.id, status, notes);
    setSaving(false);
  };

  // All renderable fields, excluding system/meta fields
  const fieldEntries = Object.entries(proposal).filter(
    ([key, value]) =>
      !SKIP_FIELDS.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <motion.div
        className="bg-background border-2 border-foreground w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="border-b-2 border-foreground px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
              PARTNER PROPOSAL DETAIL
            </p>
            <TypeBadge type={proposal.proposal_type} />
            <h3 className="text-xl font-black uppercase tracking-tighter break-words mt-1">
              {getName(proposal) || getOrg(proposal) || "—"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[72vh]">

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>
              Submitted:{" "}
              <span className="text-foreground font-bold">
                {proposal.created_at
                  ? new Date(proposal.created_at).toLocaleString("en-IN")
                  : "—"}
              </span>
            </span>
            <span>
              Status: <StatusBadge status={proposal.status} />
            </span>
          </div>

          {/* All Form Fields */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2.5 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                SUBMISSION FIELDS
              </p>
            </div>
            <div className="divide-y divide-border">
              {fieldEntries.length === 0 ? (
                <p className="px-4 py-4 text-xs text-muted-foreground">
                  No fields available.
                </p>
              ) : (
                fieldEntries.map(([key, value]) => {
                  const displayValue =
                    typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value);
                  const isEmail =
                    key.toLowerCase().includes("email") &&
                    typeof value === "string" &&
                    value.includes("@");
                  const isUrl =
                    (key.toLowerCase().includes("website") ||
                      key.toLowerCase().includes("link") ||
                      key.toLowerCase().includes("url")) &&
                    typeof value === "string" &&
                    value.startsWith("http");

                  return (
                    <div
                      key={key}
                      className="flex items-start justify-between px-4 py-2.5 gap-4"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0 mt-0.5 min-w-[140px]">
                        {prettyKey(key)}
                      </span>
                      {isEmail ? (
                        <a
                          href={`mailto:${displayValue}`}
                          className="text-sm text-editorial-blue hover:underline text-right break-all"
                        >
                          {displayValue}
                        </a>
                      ) : isUrl ? (
                        <a
                          href={displayValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-editorial-blue hover:underline text-right break-all"
                        >
                          {displayValue}
                        </a>
                      ) : (
                        <span className="text-sm text-right break-words whitespace-pre-wrap">
                          {displayValue}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2.5 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                ADMIN ACTIONS
              </p>
            </div>
            <div className="p-4 space-y-5">

              {/* Status update */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "reviewed", "contacted", "converted", "rejected"] as ProposalStatus[]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => handleSave(s)}
                        disabled={saving || proposal.status === s}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          proposal.status === s
                            ? "border-editorial-pink bg-editorial-pink/10"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Internal Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this proposal..."
                  rows={3}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm resize-none rounded-none focus:outline-none focus:border-editorial-pink transition-colors"
                />
                <button
                  onClick={() => handleSave((proposal.status as ProposalStatus) ?? "new")}
                  disabled={saving}
                  className="mt-2 text-xs font-black uppercase tracking-wider px-4 py-2 bg-editorial-pink text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE NOTES"}
                </button>
              </div>

              {/* Reply Email */}
              {email && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Reply
                  </p>
                  <a
                    href={`mailto:${email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-editorial-blue/20 border border-editorial-blue/40 text-editorial-blue px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-editorial-blue/30 transition-colors"
                  >
                    SEND REPLY EMAIL →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProposalsSection = () => {
  const [proposals, setProposals]       = useState<PartnerProposal[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected]         = useState<PartnerProposal | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partner_proposals")
      .select("*")
      .order("created_at", { ascending: false });
    setProposals((data ?? []) as PartnerProposal[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ── Update ───────────────────────────────────────────────────────────────

  const handleUpdate = async (id: string, status: ProposalStatus, notes: string) => {
    await supabase
      .from("partner_proposals")
      .update({ status, notes })
      .eq("id", id);
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, notes } : p))
    );
    setSelected((prev) => (prev?.id === id ? { ...prev, status, notes } : prev));
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this proposal? This cannot be undone."
      )
    )
      return;
    await supabase.from("partner_proposals").delete().eq("id", id);
    setProposals((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // ── Filtered list ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...proposals];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          getName(p).toLowerCase().includes(q) ||
          getEmail(p).toLowerCase().includes(q) ||
          getOrg(p).toLowerCase().includes(q) ||
          p.phone_number?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      list = list.filter((p) => p.proposal_type === typeFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => (p.status ?? "new") === statusFilter);
    }
    return list;
  }, [proposals, search, typeFilter, statusFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of Object.keys(PROPOSAL_TYPES)) counts[key] = 0;
    for (const p of proposals) {
      if (counts[p.proposal_type] !== undefined) counts[p.proposal_type]++;
    }
    return counts;
  }, [proposals]);

  // ── CSV Export ───────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = [
      "Type", "Name", "Organisation", "Email", "Phone",
      "Status", "Website", "Additional Message", "Submitted At",
    ];
    const rows = filtered.map((p) => [
      PROPOSAL_TYPES[p.proposal_type]?.label ?? p.proposal_type,
      getName(p),
      getOrg(p),
      getEmail(p),
      p.phone_number ?? "",
      p.status ?? "new",
      p.website ?? p.company_website ?? "",
      p.additional_message ?? "",
      p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `innovahack-proposals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full">
      {/* Section Header */}
      <SectionHeader
        section="Data"
        title="PARTNER PROPOSALS"
        description="All partner & sponsor proposal form submissions"
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* ── Top bar ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {proposals.length} total · {filtered.length} shown
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-editorial-pink bg-editorial-pink/10 px-3 py-2 hover:bg-editorial-pink/20 transition-colors disabled:opacity-40"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(PROPOSAL_TYPES).map(([key, def]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? "all" : key)}
              className={`border-2 p-3 text-left transition-all hover:border-foreground ${
                typeFilter === key
                  ? "border-foreground bg-secondary/60"
                  : "border-border"
              }`}
            >
              <p className={`text-xl font-black ${def.textClass}`}>
                {typeCounts[key] ?? 0}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 leading-tight">
                {def.label}
              </p>
            </button>
          ))}
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, company..."
              className="pl-9 bg-secondary border-border text-sm h-9"
            />
          </div>

          {/* Filter icon */}
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            <Filter size={13} />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-secondary border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-editorial-pink"
          >
            <option value="all">ALL TYPES</option>
            {Object.entries(PROPOSAL_TYPES).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-editorial-pink"
          >
            <option value="all">ALL STATUS</option>
            <option value="new">NEW</option>
            <option value="reviewed">REVIEWED</option>
            <option value="contacted">CONTACTED</option>
            <option value="converted">CONVERTED</option>
            <option value="rejected">REJECTED</option>
          </select>

          {/* Clear filters */}
          {(search || typeFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* ── Table / Empty / Loading ─────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                LOADING...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-border p-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO PROPOSALS FOUND
            </p>
            {(search || typeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <div className="border-2 border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Name / Org
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((proposal) => {
                    const name = getName(proposal);
                    const org  = getOrg(proposal);
                    return (
                      <motion.tr
                        key={proposal.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                      >
                        {/* Type */}
                        <td className="px-4 py-3">
                          <TypeBadge type={proposal.proposal_type} />
                        </td>

                        {/* Name / Org */}
                        <td className="px-4 py-3">
                          {name && (
                            <p className="font-bold text-sm">{name}</p>
                          )}
                          {org && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {org}
                            </p>
                          )}
                          {!name && !org && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell break-all max-w-[200px]">
                          {getEmail(proposal) || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={proposal.status} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                          {proposal.created_at
                            ? new Date(proposal.created_at).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelected(proposal)}
                              className="text-xs font-bold uppercase tracking-wider text-editorial-blue hover:underline flex items-center gap-1"
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => handleDelete(proposal.id)}
                              className="text-xs font-bold uppercase tracking-wider text-red-400 hover:underline flex items-center gap-1"
                            >
                              <X size={12} /> Del
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Hint ────────────────────────────────────────────────── */}
        {filtered.length > 0 && !loading && (
          <p className="text-xs text-muted-foreground">
            Click <span className="font-bold text-editorial-blue">View</span> on
            any row to see all submission fields, update status, add notes, or
            reply by email.
          </p>
        )}
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            proposal={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalsSection;
