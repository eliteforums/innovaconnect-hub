import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Clock, AlertTriangle } from "lucide-react";
import { useFinalistContext } from "./FinalistLayout";
import { fetchProblemStatements, type ProblemStatement } from "@/lib/hms";
import { supabase } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(deadline: string | null): string {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function getTimeRemaining(deadline: string | null): string {
  if (!deadline) return "";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Deadline passed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinalistProblemStatements = () => {
  const { team } = useFinalistContext();

  const { data: problemStatements, isLoading } = useQuery({
    queryKey: ["finalist-problem-statements", team?.domain],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await fetchProblemStatements(team.domain);
      return data ?? [];
    },
    enabled: !!team,
  });

  if (!team) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
          <FileText size={16} className="text-background" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
            {team.domain.toUpperCase()}
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight">
            PROBLEM STATEMENTS
          </h1>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="border-2 border-foreground p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            LOADING...
          </p>
        </div>
      ) : !problemStatements || problemStatements.length === 0 ? (
        <div className="border-2 border-foreground p-8 text-center">
          <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-bold uppercase tracking-wider">
            No Problem Statements Released
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Problem statements for your domain will appear here once released.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {problemStatements.map((ps) => (
            <ProblemStatementCard key={ps.id} statement={ps} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Problem Statement Card ───────────────────────────────────────────────────

function ProblemStatementCard({ statement }: { statement: ProblemStatement }) {
  const deadlinePassed = isDeadlinePassed(statement.deadline);

  const handleDownload = async (resourceUrl: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("finalist-assets")
      .createSignedUrl(resourceUrl, 60 * 60); // 1 hour expiry

    if (data?.signedUrl) {
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = fileName;
      link.target = "_blank";
      link.click();
    }
  };

  return (
    <div className="border-2 border-foreground p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-black uppercase tracking-tight">
              {statement.title}
            </h2>
            {statement.is_updated && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-editorial-pink text-background px-2 py-0.5">
                UPDATED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {statement.description}
      </div>

      {/* Deadline */}
      {statement.deadline && (
        <div
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-2 border ${
            deadlinePassed
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-border bg-secondary text-muted-foreground"
          }`}
        >
          {deadlinePassed ? (
            <AlertTriangle size={14} />
          ) : (
            <Clock size={14} />
          )}
          <span>Deadline: {formatDeadline(statement.deadline)}</span>
          {!deadlinePassed && (
            <span className="ml-auto text-editorial-pink">
              {getTimeRemaining(statement.deadline)}
            </span>
          )}
        </div>
      )}

      {/* Resources */}
      {statement.resources && statement.resources.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            RESOURCES
          </p>
          <div className="space-y-1">
            {statement.resources.map((resource, idx) => (
              <button
                key={idx}
                onClick={() => handleDownload(resource.url, resource.name)}
                className="w-full flex items-center gap-3 px-3 py-2 border border-border hover:border-editorial-pink hover:bg-editorial-pink/5 transition-all text-left group"
              >
                <Download
                  size={14}
                  className="text-muted-foreground group-hover:text-editorial-pink shrink-0"
                />
                <span className="text-xs font-bold flex-1 truncate">
                  {resource.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {resource.type} • {(resource.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinalistProblemStatements;
