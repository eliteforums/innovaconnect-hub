import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, Clock, CheckCircle, XCircle, Star, TrendingUp, UserCheck } from "lucide-react";
import { fetchRegistrations, fetchContactInquiries } from "@/lib/supabase";
import type { Registration, ContactInquiry } from "@/lib/supabase";

type Stats = {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
  confirmed: number;
  solo: number;
  duo: number;
  trio: number;
  quad: number;
  todayCount: number;
  inquiries: number;
  newInquiries: number;
};

const StatCard = ({
  label,
  value,
  icon,
  accent = "",
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
  delay?: number;
}) => (
  <motion.div
    className={`border-2 border-border p-5 md:p-6 flex flex-col gap-3 hover:bg-secondary/30 transition-colors ${accent}`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <span className="text-muted-foreground">{icon}</span>
    </div>
    <p className="text-3xl md:text-4xl font-black tracking-tighter">{value}</p>
  </motion.div>
);

const OverviewSection = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: regs }, { data: inqs }] = await Promise.all([
        fetchRegistrations(),
        fetchContactInquiries(),
      ]);

      const registrations = (regs ?? []) as Registration[];
      const inquiries = (inqs ?? []) as ContactInquiry[];

      const today = new Date().toDateString();

      const s: Stats = {
        total: registrations.length,
        pending: registrations.filter((r) => r.status === "pending").length,
        shortlisted: registrations.filter((r) => r.status === "shortlisted").length,
        rejected: registrations.filter((r) => r.status === "rejected").length,
        confirmed: registrations.filter((r) => r.status === "confirmed").length,
        solo: registrations.filter((r) => r.team_type === "solo").length,
        duo: registrations.filter((r) => r.team_type === "duo").length,
        trio: registrations.filter((r) => r.team_type === "trio").length,
        quad: registrations.filter((r) => r.team_type === "quad").length,
        todayCount: registrations.filter(
          (r) => r.created_at && new Date(r.created_at).toDateString() === today
        ).length,
        inquiries: inquiries.length,
        newInquiries: inquiries.filter((i) => i.status === "new").length,
      };

      setStats(s);
      setRecentRegistrations(registrations.slice(0, 8));
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            LOADING STATS...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Failed to load statistics.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
          DASHBOARD
        </p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          OVERVIEW
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time snapshot of InnovaHack 2026 registrations and activity.
        </p>
      </div>

      {/* Primary stats */}
      <div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
          REGISTRATIONS
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Registrations"
            value={stats.total}
            icon={<Users size={18} />}
            delay={0}
          />
          <StatCard
            label="Today"
            value={stats.todayCount}
            icon={<TrendingUp size={18} />}
            accent="border-editorial-blue/50"
            delay={0.05}
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock size={18} />}
            delay={0.1}
          />
          <StatCard
            label="Shortlisted"
            value={stats.shortlisted}
            icon={<Star size={18} />}
            accent="border-editorial-pink/50"
            delay={0.15}
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            icon={<CheckCircle size={18} />}
            accent="border-editorial-green/40"
            delay={0.2}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle size={18} />}
            delay={0.25}
          />
          <StatCard
            label="Inquiries"
            value={stats.inquiries}
            icon={<Mail size={18} />}
            delay={0.3}
          />
          <StatCard
            label="New Inquiries"
            value={stats.newInquiries}
            icon={<Mail size={18} />}
            accent="border-editorial-purple/40"
            delay={0.35}
          />
        </div>
      </div>

      {/* Team type breakdown */}
      <div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
          TEAM TYPE BREAKDOWN
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["solo", "duo", "trio", "quad"] as const).map((type, i) => {
            const count = stats[type];
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <motion.div
                key={type}
                className="border-2 border-border p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {type}
                </p>
                <p className="text-3xl font-black">{count}</p>
                <div className="mt-3 h-1 bg-secondary rounded">
                  <div
                    className="h-1 bg-editorial-pink rounded transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status pipeline */}
      <div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
          STATUS PIPELINE
        </p>
        <div className="border-2 border-border">
          {[
            { label: "Pending", count: stats.pending, color: "bg-yellow-500" },
            { label: "Shortlisted", count: stats.shortlisted, color: "bg-editorial-pink" },
            { label: "Confirmed", count: stats.confirmed, color: "bg-editorial-green" },
            { label: "Rejected", count: stats.rejected, color: "bg-red-500" },
          ].map((item, i) => {
            const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                <span className="text-xs font-bold uppercase tracking-widest w-24 shrink-0">
                  {item.label}
                </span>
                <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                  <motion.div
                    className={`h-2 ${item.color} rounded`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-black w-8 text-right shrink-0">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent registrations */}
      {recentRegistrations.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
            RECENT REGISTRATIONS
          </p>
          <div className="border-2 border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Team
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((reg, i) => (
                  <tr
                    key={reg.id ?? i}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{reg.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {reg.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold uppercase border border-border px-2 py-0.5">
                        {reg.team_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-0.5 ${
                          reg.status === "shortlisted"
                            ? "bg-editorial-pink/20 text-editorial-pink"
                            : reg.status === "confirmed"
                              ? "bg-green-500/20 text-green-400"
                              : reg.status === "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {reg.status ?? "pending"}
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
          <p className="text-xs text-muted-foreground mt-2">
            Showing latest 8 registrations. Go to{" "}
            <span className="font-bold text-foreground">Registrations</span> tab for full list.
          </p>
        </div>
      )}

      {stats.total === 0 && (
        <motion.div
          className="border-2 border-dashed border-border p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <UserCheck size={40} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            NO REGISTRATIONS YET
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Registrations will appear here once participants start submitting.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OverviewSection;
