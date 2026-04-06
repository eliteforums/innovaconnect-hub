import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Mail,
  MailOpen,
  CheckCheck,
  Archive,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchContactInquiries, updateInquiryStatus } from "@/lib/supabase";
import type { ContactInquiry } from "@/lib/supabase";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, string> = {
    new: "bg-editorial-pink/20 text-editorial-pink border-editorial-pink/40",
    read: "bg-editorial-blue/20 text-editorial-blue border-editorial-blue/40",
    replied: "bg-green-500/20 text-green-400 border-green-500/40",
    archived: "bg-secondary text-muted-foreground border-border",
  };
  const s = status ?? "new";
  return (
    <span
      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
        map[s] ?? "bg-secondary text-muted-foreground border-border"
      }`}
    >
      {s}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: ContactInquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: ContactInquiry["status"]) => Promise<void>;
}) => {
  const [saving, setSaving] = useState(false);

  const saveStatus = async (status: ContactInquiry["status"]) => {
    if (!inquiry.id) return;
    setSaving(true);
    await onStatusChange(inquiry.id, status);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <motion.div
        className="bg-background border-2 border-foreground w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="border-b-2 border-foreground px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
              INQUIRY DETAIL
            </p>
            <h3 className="text-xl font-black uppercase tracking-tighter break-words">
              {inquiry.subject}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sender info */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                SENDER DETAILS
              </p>
            </div>
            {[
              { label: "Name", value: inquiry.name },
              { label: "Email", value: inquiry.email },
              { label: "Company", value: inquiry.company ?? "—" },
              { label: "Category", value: inquiry.category ?? "—" },
              {
                label: "Received",
                value: inquiry.created_at
                  ? new Date(inquiry.created_at).toLocaleString("en-IN")
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start justify-between px-4 py-2.5 border-b border-border last:border-b-0 gap-4"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                  {label}
                </span>
                {label === "Email" ? (
                  <a
                    href={`mailto:${value}`}
                    className="text-sm text-editorial-blue hover:underline text-right break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm text-right break-words">{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Message */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                MESSAGE
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          </div>

          {/* Quick reply */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                QUICK REPLY
              </p>
            </div>
            <div className="px-4 py-4">
              <a
                href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
                className="inline-flex items-center gap-2 bg-editorial-pink px-5 py-2.5 text-xs font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
                onClick={() => saveStatus("replied")}
              >
                <Mail size={13} /> REPLY VIA EMAIL
              </a>
            </div>
          </div>

          {/* Status update */}
          <div className="border-2 border-border">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest">
                UPDATE STATUS
              </p>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Current:
                </span>
                <StatusBadge status={inquiry.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["new", "read", "replied", "archived"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => saveStatus(s)}
                    disabled={saving || inquiry.status === s}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      inquiry.status === s
                        ? "border-editorial-pink bg-editorial-pink/10"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {saving && inquiry.status !== s ? "..." : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InquiriesSection = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ContactInquiry | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchContactInquiries();
    setInquiries((data ?? []) as ContactInquiry[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: ContactInquiry["status"]
  ) => {
    await updateInquiryStatus(id, status);
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleOpenDetail = async (inquiry: ContactInquiry) => {
    setSelected(inquiry);
    // Auto-mark as read when opened
    if (inquiry.status === "new" && inquiry.id) {
      await handleStatusChange(inquiry.id, "read");
    }
  };

  const filtered = useMemo(() => {
    let list = [...inquiries];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q) ||
          i.company?.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((i) => (i.status ?? "new") === statusFilter);
    }
    return list;
  }, [inquiries, search, statusFilter]);

  const statusCounts = useMemo(() => ({
    new: inquiries.filter((i) => i.status === "new" || !i.status).length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    archived: inquiries.filter((i) => i.status === "archived").length,
  }), [inquiries]);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Category", "Subject", "Message", "Status", "Received At"];
    const rows = filtered.map((i) => [
      i.name, i.email, i.company ?? "", i.category ?? "", i.subject, i.message,
      i.status ?? "new",
      i.created_at ? new Date(i.created_at).toLocaleString("en-IN") : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `innovahack-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            INQUIRIES
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {inquiries.length} total · {filtered.length} shown
          </p>
        </div>
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

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: `ALL (${inquiries.length})`, icon: <Mail size={12} /> },
          { key: "new", label: `NEW (${statusCounts.new})`, icon: <Mail size={12} /> },
          { key: "read", label: `READ (${statusCounts.read})`, icon: <MailOpen size={12} /> },
          { key: "replied", label: `REPLIED (${statusCounts.replied})`, icon: <CheckCheck size={12} /> },
          { key: "archived", label: `ARCHIVED (${statusCounts.archived})`, icon: <Archive size={12} /> },
        ].map((pill) => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(pill.key)}
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 transition-all ${
              statusFilter === pill.key
                ? "border-editorial-pink bg-editorial-pink/10 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {pill.icon}
            {pill.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, subject..."
          className="pl-9 bg-secondary border-border text-sm h-9"
        />
      </div>

      {/* Content */}
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
          <Mail size={36} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            NO INQUIRIES FOUND
          </p>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline"
            >
              CLEAR FILTERS
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 transition-colors hover:border-foreground cursor-pointer ${
                inquiry.status === "new" || !inquiry.status
                  ? "border-editorial-pink/50 bg-editorial-pink/5"
                  : "border-border"
              }`}
              onClick={() => handleOpenDetail(inquiry)}
            >
              <div className="p-4 flex items-start gap-4">
                {/* Unread dot */}
                <div className="pt-1 shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      inquiry.status === "new" || !inquiry.status
                        ? "bg-editorial-pink"
                        : "bg-transparent border border-border"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-black uppercase tracking-wide truncate">
                      {inquiry.subject}
                    </p>
                    <div className="shrink-0 flex items-center gap-2">
                      <StatusBadge status={inquiry.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-bold">{inquiry.name}</span>
                    <span>·</span>
                    <span>{inquiry.email}</span>
                    {inquiry.company && (
                      <>
                        <span>·</span>
                        <span>{inquiry.company}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                    {inquiry.message}
                  </p>
                </div>

                {/* Date */}
                <div className="shrink-0 text-right hidden md:block">
                  <p className="text-xs text-muted-foreground">
                    {inquiry.created_at
                      ? new Date(inquiry.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </p>
                </div>

                {/* Chevron */}
                <div className="shrink-0 text-muted-foreground">
                  <Eye size={15} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions hint */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Click any inquiry to view details, reply, or update its status. New
          inquiries are auto-marked as read when opened.
        </p>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            inquiry={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InquiriesSection;
