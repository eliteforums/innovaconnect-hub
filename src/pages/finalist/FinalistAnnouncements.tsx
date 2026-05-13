import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Clock, Eye } from "lucide-react";
import { useFinalistContext } from "./FinalistLayout";
import {
  fetchNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/hms";
import { supabase } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPublishedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinalistAnnouncements = () => {
  const { team } = useFinalistContext();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["finalist-notifications", team?.domain, team?.team_id],
    queryFn: async () => {
      if (!team) return [];
      const { data } = await fetchNotifications(team.domain, team.team_id);
      return data ?? [];
    },
    enabled: !!team,
  });

  // Fetch read status
  const { data: readIds } = useQuery({
    queryKey: ["finalist-notification-reads", team?.id],
    queryFn: async () => {
      if (!team) return new Set<string>();
      const { data } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("team_id", team.id);
      return new Set((data ?? []).map((r: { notification_id: string }) => r.notification_id));
    },
    enabled: !!team,
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!team) return;
      await markNotificationRead(notificationId, team.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalist-notification-reads"] });
    },
  });

  // Mark all visible notifications as read when page loads
  useEffect(() => {
    if (!team || !notifications || !readIds) return;

    const unread = notifications.filter((n) => !readIds.has(n.id));
    unread.forEach((n) => {
      markReadMutation.mutate(n.id);
    });
    // Only run when notifications or readIds change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications?.length, readIds?.size]);

  if (!team) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
          <Bell size={16} className="text-background" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
            UPDATES
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight">
            ANNOUNCEMENTS
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
      ) : !notifications || notifications.length === 0 ? (
        <div className="border-2 border-foreground p-8 text-center">
          <Bell size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-bold uppercase tracking-wider">
            No Announcements
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Announcements from the organizers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <AnnouncementCard
              key={notification.id}
              notification={notification}
              isRead={readIds?.has(notification.id) ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({
  notification,
  isRead,
}: {
  notification: Notification;
  isRead: boolean;
}) {
  return (
    <div
      className={`border-2 p-5 transition-colors ${
        isRead
          ? "border-border"
          : "border-editorial-pink bg-editorial-pink/5"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-editorial-pink shrink-0" />
            )}
            <h3 className="text-sm font-black uppercase tracking-tight">
              {notification.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isRead && (
            <Eye size={12} className="text-muted-foreground" />
          )}
          {notification.published_at && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              {formatPublishedDate(notification.published_at)}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {notification.message}
      </p>

      {/* Audience badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 text-muted-foreground">
          {notification.audience_type === "all"
            ? "ALL TEAMS"
            : notification.audience_type === "domain"
            ? `DOMAIN: ${notification.audience_value}`
            : `TEAM: ${notification.audience_value}`}
        </span>
      </div>
    </div>
  );
}

export default FinalistAnnouncements;
