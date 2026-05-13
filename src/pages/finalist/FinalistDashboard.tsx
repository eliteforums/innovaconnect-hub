import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useFinalistContext } from "./FinalistLayout";
import { fetchSubmission, fetchNotifications, type Submission } from "@/lib/hms";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DELIVERABLE_LABELS: Record<string, string> = {
  github_url: "GitHub Repository",
  pitch_deck_url: "Pitch Deck",
  video_url: "Demo Video",
  documentation_urls: "Documentation",
  pow_urls: "Proof of Work",
};

function getSubmissionProgress(submission: Submission | null): {
  completed: number;
  total: number;
  items: { key: string; label: string; done: boolean }[];
} {
  const total = 5;
  if (!submission) {
    return {
      completed: 0,
      total,
      items: Object.entries(DELIVERABLE_LABELS).map(([key, label]) => ({
        key,
        label,
        done: false,
      })),
    };
  }

  const items = [
    { key: "github_url", label: DELIVERABLE_LABELS.github_url, done: !!submission.github_url },
    { key: "pitch_deck_url", label: DELIVERABLE_LABELS.pitch_deck_url, done: !!submission.pitch_deck_url },
    { key: "video_url", label: DELIVERABLE_LABELS.video_url, done: !!submission.video_url },
    { key: "documentation_urls", label: DELIVERABLE_LABELS.documentation_urls, done: (submission.documentation_urls?.length ?? 0) > 0 },
    { key: "pow_urls", label: DELIVERABLE_LABELS.pow_urls, done: (submission.pow_urls?.length ?? 0) > 0 },
  ];

  const completed = items.filter((i) => i.done).length;
  return { completed, total, items };
}

function formatRelativeTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));

  if (diff < 0) return "Passed";
  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Less than 1h";
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinalistDashboard = () => {
  const { team } = useFinalistContext();

  const { data: submission, isLoading: submissionLoading } = useQuery({
    queryKey: ["finalist-submission", team?.id],
    queryFn: async () => {
      if (!team) return null;
      const { data } = await fetchSubmission(team.id);
      return data;
    },
    enabled: !!team,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["finalist-notifications", team?.domain, team?.team_id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await fetchNotifications(team.domain, team.team_id);
      return data ?? [];
    },
    enabled: !!team,
  });

  if (!team) return null;

  const progress = getSubmissionProgress(submission ?? null);
  const recentAnnouncements = (notifications ?? []).slice(0, 3);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
          <LayoutDashboard size={16} className="text-background" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
            OVERVIEW
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight">
            DASHBOARD
          </h1>
        </div>
      </div>

      {/* Team status card */}
      <div className="border-2 border-foreground p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          TEAM STATUS
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Team</p>
            <p className="text-sm font-bold">{team.team_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Domain</p>
            <p className="text-sm font-bold">{team.domain}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-0.5 ${
                team.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : team.status === "suspended"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {team.status}
            </span>
          </div>
        </div>
      </div>

      {/* Submission progress */}
      <div className="border-2 border-foreground p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            SUBMISSION PROGRESS
          </p>
          <span className="text-xs font-bold text-editorial-pink">
            {progress.completed}/{progress.total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary mb-4">
          <div
            className="h-full bg-editorial-pink transition-all duration-300"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>

        {submissionLoading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {progress.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 text-xs py-1"
              >
                {item.done ? (
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-muted-foreground shrink-0" />
                )}
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links + Recent announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick links */}
        <div className="border-2 border-foreground p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            QUICK LINKS
          </p>
          <div className="space-y-2">
            <Link
              to="/finalist/submissions"
              className="flex items-center gap-3 px-3 py-2.5 border border-border hover:border-editorial-pink hover:bg-editorial-pink/5 transition-all group"
            >
              <Upload size={16} className="text-muted-foreground group-hover:text-editorial-pink" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Submit Deliverables
              </span>
            </Link>
            <Link
              to="/finalist/problem-statements"
              className="flex items-center gap-3 px-3 py-2.5 border border-border hover:border-editorial-pink hover:bg-editorial-pink/5 transition-all group"
            >
              <FileText size={16} className="text-muted-foreground group-hover:text-editorial-pink" />
              <span className="text-xs font-bold uppercase tracking-wider">
                View Problem Statements
              </span>
            </Link>
            <Link
              to="/finalist/announcements"
              className="flex items-center gap-3 px-3 py-2.5 border border-border hover:border-editorial-pink hover:bg-editorial-pink/5 transition-all group"
            >
              <Bell size={16} className="text-muted-foreground group-hover:text-editorial-pink" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Announcements
              </span>
            </Link>
          </div>
        </div>

        {/* Recent announcements */}
        <div className="border-2 border-foreground p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            RECENT ANNOUNCEMENTS
          </p>
          {notificationsLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : recentAnnouncements.length === 0 ? (
            <p className="text-xs text-muted-foreground">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((notif) => (
                <div key={notif.id} className="border-l-2 border-editorial-pink pl-3">
                  <p className="text-sm font-bold">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                  {notif.published_at && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(notif.published_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming deadlines */}
      <div className="border-2 border-foreground p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          UPCOMING DEADLINES
        </p>
        {notificationsLoading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : (
          <DeadlinesList teamDomain={team.domain} />
        )}
      </div>
    </div>
  );
};

// ─── Deadlines Sub-component ──────────────────────────────────────────────────

function DeadlinesList({ teamDomain }: { teamDomain: string }) {
  const { data: problemStatements, isLoading } = useQuery({
    queryKey: ["finalist-deadlines", teamDomain],
    queryFn: async () => {
      const { fetchProblemStatements } = await import("@/lib/hms");
      const { data } = await fetchProblemStatements(teamDomain);
      return data ?? [];
    },
  });

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading...</p>;
  }

  const upcoming = (problemStatements ?? [])
    .filter((ps) => ps.deadline && new Date(ps.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return <p className="text-xs text-muted-foreground">No upcoming deadlines.</p>;
  }

  return (
    <div className="space-y-2">
      {upcoming.map((ps) => (
        <div
          key={ps.id}
          className="flex items-center justify-between px-3 py-2 border border-border"
        >
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-editorial-pink shrink-0" />
            <span className="text-xs font-bold">{ps.title}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(ps.deadline!)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default FinalistDashboard;
