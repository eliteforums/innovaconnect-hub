import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Activity,
  FileText,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { fetchAnalytics } from "@/lib/hms";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalTeams: number;
  activeTeams: number;
  totalSubmissions: number;
  completionRate: number;
  domainBreakdown: Record<string, { teams: number; submissions: number }>;
}

interface TimelineDataPoint {
  date: string;
  submissions: number;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchSubmissionTimeline(): Promise<TimelineDataPoint[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // Group submissions by day
  const grouped: Record<string, number> = {};
  data.forEach((row: { created_at: string }) => {
    const day = row.created_at.split("T")[0]; // YYYY-MM-DD
    grouped[day] = (grouped[day] || 0) + 1;
  });

  // Fill in missing days between first and last submission
  const days = Object.keys(grouped).sort();
  if (days.length === 0) return [];

  const start = new Date(days[0]);
  const end = new Date(days[days.length - 1]);
  const timeline: TimelineDataPoint[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    timeline.push({
      date: key,
      submissions: grouped[key] || 0,
    });
  }

  return timeline;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard = ({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
}) => (
  <div className="border-2 border-border p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className="text-editorial-pink" />
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
    <p className="text-3xl font-black tracking-tight">
      {value}
      {suffix && (
        <span className="text-lg text-muted-foreground ml-0.5">{suffix}</span>
      )}
    </p>
  </div>
);

// ─── Zero State ───────────────────────────────────────────────────────────────

const ZeroState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <AlertTriangle size={20} className="text-muted-foreground mb-2" />
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
      {message}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AnalyticsSection = () => {
  // Fetch analytics data on mount
  const {
    data: analyticsResult,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useQuery({
    queryKey: ["hms", "analytics"],
    queryFn: async () => {
      const result = await fetchAnalytics();
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    retry: false,
  });

  // Fetch timeline data on mount
  const {
    data: timeline = [],
    isLoading: isLoadingTimeline,
  } = useQuery({
    queryKey: ["hms", "analytics", "timeline"],
    queryFn: fetchSubmissionTimeline,
    retry: false,
  });

  const analytics: AnalyticsData | null = analyticsResult?.data ?? null;

  // Convert domain breakdown to sorted array for table
  const domainRows = useMemo(() => {
    if (!analytics?.domainBreakdown) return [];
    return Object.entries(analytics.domainBreakdown)
      .map(([domain, stats]) => ({ domain, ...stats }))
      .sort((a, b) => b.teams - a.teams);
  }, [analytics]);

  // Format timeline dates for chart display
  const formattedTimeline = useMemo(() => {
    return timeline.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));
  }, [timeline]);

  if (isLoadingAnalytics) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin mx-auto mb-4 text-editorial-pink" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            LOADING ANALYTICS...
          </p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle size={24} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            FAILED TO LOAD ANALYTICS
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(analyticsError as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
          HMS
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          ANALYTICS
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate statistics on finalist participation and submissions
        </p>
      </div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {analytics && analytics.totalTeams > 0 ? (
          <>
            <MetricCard
              icon={Users}
              label="Total Finalist Teams"
              value={analytics.totalTeams}
            />
            <MetricCard
              icon={Activity}
              label="Active Teams (48h)"
              value={analytics.activeTeams}
            />
            <MetricCard
              icon={FileText}
              label="Total Submissions"
              value={analytics.totalSubmissions}
            />
            <MetricCard
              icon={TrendingUp}
              label="Completion Rate"
              value={analytics.completionRate}
              suffix="%"
            />
          </>
        ) : (
          <div className="col-span-full">
            <ZeroState message="No finalist teams registered yet. Metrics will appear once teams are onboarded." />
          </div>
        )}
      </motion.div>

      {/* Domain Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-2 border-border"
      >
        <div className="bg-secondary/40 border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest">
            DOMAIN-WISE BREAKDOWN
          </p>
        </div>

        {domainRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Domain
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Teams
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Submissions
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Submission Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {domainRows.map((row) => {
                  const rate =
                    row.teams > 0
                      ? Math.round((row.submissions / row.teams) * 100)
                      : 0;
                  return (
                    <tr
                      key={row.domain}
                      className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium">{row.domain}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-bold border border-editorial-pink/50 bg-editorial-pink/10 px-2 py-0.5">
                          {row.teams}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{row.submissions}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary border border-border overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                rate === 100
                                  ? "bg-green-400"
                                  : rate >= 50
                                  ? "bg-yellow-400"
                                  : "bg-editorial-pink"
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ZeroState message="No domain data available yet. Teams will appear here once onboarded." />
        )}
      </motion.div>

      {/* Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-2 border-border"
      >
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-editorial-pink" />
          <p className="text-xs font-bold uppercase tracking-widest">
            SUBMISSIONS TIMELINE
          </p>
        </div>

        {isLoadingTimeline ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : formattedTimeline.length > 0 ? (
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={formattedTimeline}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--secondary))",
                    border: "2px solid hsl(var(--border))",
                    borderRadius: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  cursor={{ fill: "hsl(var(--secondary))", opacity: 0.5 }}
                />
                <Bar
                  dataKey="submissions"
                  name="Submissions"
                  fill="hsl(var(--editorial-pink, 346 77% 50%))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ZeroState message="No submissions recorded yet. The timeline chart will populate as teams submit deliverables." />
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsSection;
