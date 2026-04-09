import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Check,
  Clock,
  Star,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  supabase,
  fetchRegistrations,
  fetchAllRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from "@/lib/supabase";
import type { Registration } from "@/lib/supabase";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    shortlisted:
      "bg-editorial-pink/20 text-editorial-pink border-editorial-pink/40",
    confirmed: "bg-green-500/20 text-green-400 border-green-500/40",
    rejected: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  const s = status ?? "pending";
  return (
    <span
      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
        map[s] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      {s}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
  reg,
  onClose,
  onStatusChange,
}: {
  reg: Registration;
  onClose: () => void;
  onStatusChange: (
    id: string,
    status: Registration["status"],
    notes?: string,
  ) => void;
}) => {
  const [notes, setNotes] = useState(reg.notes ?? "");
  const [saving, setSaving] = useState(false);

  const saveStatus = async (status: Registration["status"]) => {
    if (!reg.id) return;
    setSaving(true);
    await onStatusChange(reg.id, status, notes);
    setSaving(false);
  };

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
        <div className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
              REGISTRATION DETAIL
            </p>
            <h3 className="text-xl font-black uppercase tracking-tighter">
              {reg.full_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Personal */}
          <Section title="PERSONAL DETAILS">
            <Row label="Full Name" value={reg.full_name} />
            <Row label="Email" value={reg.email} />
            <Row label="Contact No" value={reg.contact_no} />
            <Row label="City" value={reg.city} />
            {reg.resume_url && (
              <Row
                label="Resume"
                value={
                  <a
                    href={reg.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-editorial-blue hover:underline text-xs"
                  >
                    VIEW RESUME →
                  </a>
                }
              />
            )}
          </Section>

          {/* Academic */}
          <Section title="ACADEMIC DETAILS">
            <Row label="Organisation" value={reg.organisation_name} />
            <Row label="Year / Experience" value={reg.year_or_experience} />
            <Row label="Branch / Dept" value={reg.branch_or_department} />
          </Section>

          {/* Skills */}
          <Section title="SKILLS & LINKS">
            <div className="px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(reg.skills ?? []).length > 0 ? (
                  reg.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-bold uppercase tracking-wider border border-editorial-pink/50 bg-editorial-pink/10 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    None selected
                  </span>
                )}
              </div>
            </div>
            {reg.github_url && (
              <Row label="GitHub" value={reg.github_url} link />
            )}
            {reg.linkedin_url && (
              <Row label="LinkedIn" value={reg.linkedin_url} link />
            )}
          </Section>

          {/* Team */}
          <Section title={`TEAM: ${(reg.team_type ?? "solo").toUpperCase()}`}>
            {(reg.team_members ?? []).length === 0 ? (
              <div className="px-4 py-3 text-xs text-muted-foreground">
                Solo participant — no additional members.
              </div>
            ) : (
              reg.team_members.map((m, i) => (
                <div key={i} className="border-t border-border px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-editorial-pink mb-2">
                    MEMBER {i + 2}
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Name
                    </span>
                    <span>{m.full_name}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Email
                    </span>
                    <span>{m.email}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Contact
                    </span>
                    <span>{m.contact_no}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      City
                    </span>
                    <span>{m.city}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Org
                    </span>
                    <span>{m.organisation_name}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Year/Exp
                    </span>
                    <span>{m.year_or_experience}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Branch
                    </span>
                    <span>{m.branch_or_department}</span>
                    <span className="text-muted-foreground uppercase tracking-wider font-bold">
                      Skills
                    </span>
                    <span>{m.skills?.join(", ") || "—"}</span>
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Admin Actions */}
          <Section title="ADMIN ACTIONS">
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Current Status
                </p>
                <StatusBadge status={reg.status} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["pending", "shortlisted", "confirmed", "rejected"] as const
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => saveStatus(s)}
                      disabled={saving || reg.status === s}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        reg.status === s
                          ? "border-editorial-pink bg-editorial-pink/10"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this applicant..."
                  rows={3}
                  className="w-full bg-secondary border border-border px-3 py-2 text-sm resize-none rounded-none focus:outline-none focus:border-editorial-pink"
                />
                <button
                  onClick={() => saveStatus(reg.status)}
                  disabled={saving}
                  className="mt-2 text-xs font-black uppercase tracking-wider px-4 py-2 bg-editorial-pink text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE NOTES"}
                </button>
              </div>
            </div>
          </Section>

          <div className="text-xs text-muted-foreground">
            Registered:{" "}
            {reg.created_at
              ? new Date(reg.created_at).toLocaleString("en-IN")
              : "—"}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-2 border-border">
    <div className="bg-secondary/40 px-4 py-2 border-b border-border">
      <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

const Row = ({
  label,
  value,
  link = false,
}: {
  label: string;
  value: React.ReactNode;
  link?: boolean;
}) => (
  <div className="flex items-start justify-between px-4 py-2.5 border-b border-border last:border-b-0 gap-4">
    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0 mt-0.5">
      {label}
    </span>
    {link && typeof value === "string" ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-editorial-blue hover:underline text-right break-all"
      >
        {value}
      </a>
    ) : (
      <span className="text-sm text-right break-words">{value || "—"}</span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const RegistrationsSection = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "full_name">(
    "created_at",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 50;

  const load = async (page = 0) => {
    setLoading(true);
    const { data, count } = await fetchRegistrations(page, PAGE_SIZE);
    setRegistrations((data ?? []) as Registration[]);
    setTotalCount(count ?? 0);
    setCurrentPage(page);
    setLoading(false);
  };

  useEffect(() => {
    load(0);
  }, []);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [search, statusFilter, teamFilter]);

  const handleStatusChange = async (
    id: string,
    status: Registration["status"],
    notes?: string,
  ) => {
    await updateRegistrationStatus(id, status, notes);
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, notes: notes ?? r.notes } : r,
      ),
    );
    if (selectedReg?.id === id) {
      setSelectedReg((prev) =>
        prev ? { ...prev, status, notes: notes ?? prev.notes } : prev,
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this registration? This cannot be undone.",
      )
    )
      return;
    await deleteRegistration(id);
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    if (selectedReg?.id === id) setSelectedReg(null);
  };

  const filtered = useMemo(() => {
    let list = [...registrations];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q) ||
          r.organisation_name?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((r) => (r.status ?? "pending") === statusFilter);
    if (teamFilter !== "all")
      list = list.filter((r) => r.team_type === teamFilter);
    list.sort((a, b) => {
      const av =
        sortField === "created_at" ? (a.created_at ?? "") : a.full_name;
      const bv =
        sortField === "created_at" ? (b.created_at ?? "") : b.full_name;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [registrations, search, statusFilter, teamFilter, sortField, sortDir]);

  const exportCSV = async () => {
    // For CSV we need all rows, not just current page
    const { data: allData } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    const headers = [
      "Full Name",
      "Email",
      "Contact No",
      "City",
      "Organisation",
      "Year/Exp",
      "Branch",
      "Skills",
      "GitHub",
      "LinkedIn",
      "Team Type",
      "Team Members Count",
      "Status",
      "Consent",
      "Registered At",
    ];
    const rows = (allData ?? []).map((r: Registration) => [
      r.full_name,
      r.email,
      r.contact_no,
      r.city,
      r.organisation_name,
      r.year_or_experience,
      r.branch_or_department,
      (r.skills ?? []).join("; "),
      r.github_url ?? "",
      r.linkedin_url ?? "",
      r.team_type,
      r.team_members?.length ?? 0,
      r.status ?? "pending",
      r.consent ? "Yes" : "No",
      r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `innovahack-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
            DATA
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            REGISTRATIONS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total · {filtered.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => load(currentPage)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={totalCount === 0}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-editorial-pink bg-editorial-pink/10 px-3 py-2 hover:bg-editorial-pink/20 transition-colors disabled:opacity-40"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, city, org..."
            className="pl-9 bg-secondary border-border text-sm h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Filter size={13} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-secondary border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-editorial-pink"
        >
          <option value="all">ALL STATUS</option>
          <option value="pending">PENDING</option>
          <option value="shortlisted">SHORTLISTED</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="rejected">REJECTED</option>
        </select>

        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-secondary border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-editorial-pink"
        >
          <option value="all">ALL TEAMS</option>
          <option value="solo">SOLO</option>
          <option value="duo">DUO</option>
          <option value="trio">TRIO</option>
          <option value="quad">QUAD</option>
        </select>
      </div>

      {/* Table */}
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
            NO REGISTRATIONS FOUND
          </p>
          {(search || statusFilter !== "all" || teamFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTeamFilter("all");
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
                <th
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("full_name")}
                >
                  <span className="flex items-center gap-1">
                    Name
                    {sortField === "full_name" ? (
                      sortDir === "asc" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )
                    ) : null}
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  City
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Team
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell"
                  onClick={() => toggleSort("created_at")}
                >
                  <span className="flex items-center gap-1">
                    Date
                    {sortField === "created_at" ? (
                      sortDir === "asc" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )
                    ) : null}
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr
                  key={reg.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{reg.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {reg.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {reg.city}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase border border-border px-2 py-0.5">
                      {reg.team_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {reg.created_at
                      ? new Date(reg.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="text-xs font-bold uppercase tracking-wider text-editorial-blue hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={() => handleDelete(reg.id!)}
                        className="text-xs font-bold uppercase tracking-wider text-red-400 hover:underline flex items-center gap-1"
                      >
                        <X size={12} /> Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {currentPage * PAGE_SIZE + 1}–
            {Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} of{" "}
            {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              className="text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              PAGE {currentPage + 1} / {Math.ceil(totalCount / PAGE_SIZE)}
            </span>
            <button
              onClick={() => load(currentPage + 1)}
              disabled={(currentPage + 1) * PAGE_SIZE >= totalCount || loading}
              className="text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-1.5 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}

      {/* Quick status legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[
          {
            icon: <Clock size={12} />,
            label: "Pending",
            color: "text-yellow-400",
          },
          {
            icon: <Star size={12} />,
            label: "Shortlisted",
            color: "text-editorial-pink",
          },
          {
            icon: <Check size={12} />,
            label: "Confirmed",
            color: "text-green-400",
          },
          {
            icon: <XCircle size={12} />,
            label: "Rejected",
            color: "text-red-400",
          },
        ].map((item) => (
          <span
            key={item.label}
            className={`flex items-center gap-1 ${item.color}`}
          >
            {item.icon} {item.label}
          </span>
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedReg && (
          <DetailModal
            reg={selectedReg}
            onClose={() => setSelectedReg(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationsSection;
