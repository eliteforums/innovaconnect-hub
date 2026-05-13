import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, fetchRegistrations, updateRegistrationStatus } from "@/lib/supabase";
import type { Registration } from "@/lib/supabase";
import { csvFileSchema } from "@/lib/hmsValidation";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShortlistSummary {
  shortlisted: number;
  unmatched: number;
  skippedDuplicates: number;
  unmatchedEmails?: string[];
}

// ─── CSV Parsing Utility ──────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

// ─── Summary Modal ────────────────────────────────────────────────────────────

const SummaryModal = ({
  summary,
  onClose,
}: {
  summary: ShortlistSummary;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <motion.div
      className="bg-background border-2 border-foreground w-full max-w-md"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="border-b-2 border-foreground px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
            SHORTLISTING
          </p>
          <h3 className="text-xl font-black uppercase tracking-tighter">
            ACTION SUMMARY
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="border-2 border-border p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-400 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                NEWLY SHORTLISTED
              </p>
              <p className="text-2xl font-black">{summary.shortlisted}</p>
            </div>
          </div>

          <div className="border-2 border-border p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                UNMATCHED EMAILS
              </p>
              <p className="text-2xl font-black">{summary.unmatched}</p>
            </div>
          </div>

          <div className="border-2 border-border p-4 flex items-center gap-3">
            <FileSpreadsheet size={20} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                SKIPPED DUPLICATES
              </p>
              <p className="text-2xl font-black">{summary.skippedDuplicates}</p>
            </div>
          </div>
        </div>

        {summary.unmatchedEmails && summary.unmatchedEmails.length > 0 && (
          <div className="border-2 border-border">
            <div className="bg-secondary/40 border-b border-border px-4 py-2.5">
              <p className="text-xs font-bold uppercase tracking-widest">
                UNMATCHED EMAILS
              </p>
            </div>
            <div className="p-4 max-h-32 overflow-y-auto">
              {summary.unmatchedEmails.map((email) => (
                <p key={email} className="text-xs text-muted-foreground py-0.5">
                  {email}
                </p>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-xs font-black uppercase tracking-wider px-4 py-3 bg-editorial-pink text-background hover:opacity-90 transition-opacity"
        >
          CLOSE
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ShortlistingSection = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState<ShortlistSummary | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [csvProcessing, setCsvProcessing] = useState(false);

  // Fetch pending registrations
  const { data: queryResult, isLoading, refetch } = useQuery({
    queryKey: ["registrations", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Registration[];
    },
  });

  const pendingRegistrations = queryResult ?? [];

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return pendingRegistrations;
    const q = search.toLowerCase();
    return pendingRegistrations.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.organisation_name?.toLowerCase().includes(q)
    );
  }, [pendingRegistrations, search]);

  // Manual shortlist mutation
  const shortlistMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      let shortlisted = 0;
      let skippedDuplicates = 0;

      for (const id of ids) {
        const reg = pendingRegistrations.find((r) => r.id === id);
        if (!reg) continue;

        if (reg.status === "shortlisted") {
          skippedDuplicates++;
          continue;
        }

        const { error } = await updateRegistrationStatus(id, "shortlisted");
        if (!error) {
          shortlisted++;
        }
      }

      return { shortlisted, unmatched: 0, skippedDuplicates } as ShortlistSummary;
    },
    onSuccess: (result) => {
      setSummary(result);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success(`${result.shortlisted} registration(s) shortlisted`);
    },
    onError: () => {
      toast.error("Failed to shortlist registrations");
    },
  });

  // CSV processing
  const processCSV = useCallback(
    async (file: File) => {
      setCsvError(null);
      setCsvProcessing(true);

      try {
        const text = await file.text();
        const { headers, rows } = parseCSV(text);

        // Validate using Zod schema
        const validation = csvFileSchema.safeParse({ headers, rows });
        if (!validation.success) {
          const errorMsg = validation.error.errors[0]?.message ?? "Invalid CSV file";
          setCsvError(errorMsg);
          setCsvProcessing(false);
          return;
        }

        // Extract emails from CSV
        const csvEmails = rows
          .map((row) => row.email?.trim().toLowerCase())
          .filter((email): email is string => !!email);

        // Fetch all pending registrations to match against
        const { data: allPending, error: fetchError } = await supabase
          .from("registrations")
          .select("id, email, status")
          .eq("status", "pending");

        if (fetchError) {
          setCsvError("Failed to fetch registrations for matching");
          setCsvProcessing(false);
          return;
        }

        const pendingMap = new Map(
          (allPending ?? []).map((r) => [r.email.toLowerCase(), r])
        );

        let shortlisted = 0;
        let unmatched = 0;
        let skippedDuplicates = 0;
        const unmatchedEmails: string[] = [];

        for (const email of csvEmails) {
          const reg = pendingMap.get(email);
          if (!reg) {
            unmatched++;
            unmatchedEmails.push(email);
            continue;
          }

          if (reg.status === "shortlisted") {
            skippedDuplicates++;
            continue;
          }

          const { error } = await updateRegistrationStatus(reg.id, "shortlisted");
          if (!error) {
            shortlisted++;
          }
        }

        setSummary({ shortlisted, unmatched, skippedDuplicates, unmatchedEmails });
        queryClient.invalidateQueries({ queryKey: ["registrations"] });
        toast.success(`CSV processed: ${shortlisted} shortlisted`);
      } catch {
        setCsvError("Failed to parse CSV file");
      } finally {
        setCsvProcessing(false);
      }
    },
    [queryClient]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
        processCSV(file);
      } else {
        setCsvError("Please upload a valid CSV file");
      }
    },
    [processCSV]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processCSV(file);
      }
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    },
    [processCSV]
  );

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id!)));
    }
  };

  const handleShortlistSelected = () => {
    if (selectedIds.size === 0) return;
    shortlistMutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
          HMS — SHORTLISTING
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          SHORTLIST REGISTRATIONS
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select pending registrations to shortlist manually, or upload a CSV of emails.
        </p>
      </div>

      {/* CSV Upload Area */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-widest">
            CSV BULK SHORTLIST
          </p>
        </div>
        <div className="p-4 md:p-5 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? "border-editorial-pink bg-editorial-pink/5"
                : "border-border hover:border-editorial-pink/50"
            }`}
            onClick={() => document.getElementById("csv-file-input")?.click()}
          >
            {csvProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-editorial-pink" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  PROCESSING CSV...
                </p>
              </div>
            ) : (
              <>
                <Upload
                  size={24}
                  className={`mx-auto mb-2 ${
                    isDragOver ? "text-editorial-pink" : "text-muted-foreground"
                  }`}
                />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  DRAG & DROP CSV FILE HERE
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  or click to browse · requires "email" column · max 1,000 rows
                </p>
              </>
            )}
          </div>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />

          {csvError && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 border border-red-400/30 bg-red-400/5 px-3 py-2">
              <AlertCircle size={14} />
              {csvError}
            </div>
          )}
        </div>
      </div>

      {/* Manual Selection */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest">
            PENDING REGISTRATIONS
          </p>
          <span className="text-xs text-muted-foreground">
            {pendingRegistrations.length} pending · {selectedIds.size} selected
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Search + Actions */}
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
            <button
              onClick={handleShortlistSelected}
              disabled={selectedIds.size === 0 || shortlistMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {shortlistMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle size={13} />
              )}
              SHORTLIST SELECTED ({selectedIds.size})
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
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
                {search
                  ? "NO MATCHING PENDING REGISTRATIONS"
                  : "NO PENDING REGISTRATIONS"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 text-xs font-bold uppercase tracking-wider text-editorial-pink hover:underline"
                >
                  CLEAR SEARCH
                </button>
              )}
            </div>
          ) : (
            <div className="border-2 border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="text-left px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filtered.length > 0 &&
                          selectedIds.size === filtered.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-editorial-pink cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Name
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
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg) => (
                    <tr
                      key={reg.id}
                      className={`border-b border-border last:border-b-0 transition-colors cursor-pointer ${
                        selectedIds.has(reg.id!)
                          ? "bg-editorial-pink/5"
                          : "hover:bg-secondary/20"
                      }`}
                      onClick={() => toggleSelect(reg.id!)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(reg.id!)}
                          onChange={() => toggleSelect(reg.id!)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-editorial-pink cursor-pointer"
                        />
                      </td>
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
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {reg.created_at
                          ? new Date(reg.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {summary && (
          <SummaryModal summary={summary} onClose={() => setSummary(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShortlistingSection;
