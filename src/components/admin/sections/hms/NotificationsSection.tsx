import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  Loader2,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Mail,
  Users,
  Globe,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Notification, NotificationAudienceType } from "@/lib/hms";
import { notificationSchema } from "@/lib/hmsValidation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  message: string;
  audience_type: NotificationAudienceType;
  audience_value: string;
  scheduled_at: string;
}

const emptyForm: FormData = {
  title: "",
  message: "",
  audience_type: "all",
  audience_value: "",
  scheduled_at: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNotificationStatus(
  notif: Notification
): "Draft" | "Published" | "Scheduled" {
  if (notif.published_at) return "Published";
  if (notif.scheduled_at && new Date(notif.scheduled_at) > new Date())
    return "Scheduled";
  return "Draft";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Published":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "Scheduled":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function getAudienceIcon(type: NotificationAudienceType) {
  switch (type) {
    case "all":
      return <Globe size={11} />;
    case "domain":
      return <Users size={11} />;
    case "team":
      return <User size={11} />;
  }
}

function getAudienceLabel(notif: Notification): string {
  switch (notif.audience_type) {
    case "all":
      return "All Teams";
    case "domain":
      return `Domain: ${notif.audience_value}`;
    case "team":
      return `Team: ${notif.audience_value}`;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NotificationsSection = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [publishMode, setPublishMode] = useState<"immediate" | "scheduled">(
    "immediate"
  );

  // ─── Queries ──────────────────────────────────────────────────────────────

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hms", "notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: {
      form: FormData;
      publishNow: boolean;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const now = new Date().toISOString();

      const insertData: Record<string, unknown> = {
        title: payload.form.title,
        message: payload.form.message,
        audience_type: payload.form.audience_type,
        audience_value:
          payload.form.audience_type === "all"
            ? null
            : payload.form.audience_value || null,
        scheduled_at: payload.publishNow
          ? null
          : payload.form.scheduled_at || null,
        published_at: payload.publishNow ? now : null,
        created_by: userId,
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { notification: data as Notification, publishNow: payload.publishNow };
    },
    onSuccess: async (result) => {
      toast.success(
        result.publishNow
          ? "Notification published"
          : "Notification scheduled"
      );
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["hms", "notifications"] });

      // Trigger email notification if published immediately
      if (result.publishNow) {
        await triggerEmailNotification(result.notification);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create notification");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("notifications")
        .update({ published_at: now })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Notification;
    },
    onSuccess: async (notif) => {
      toast.success("Notification published");
      queryClient.invalidateQueries({ queryKey: ["hms", "notifications"] });
      await triggerEmailNotification(notif);
    },
    onError: () => {
      toast.error("Failed to publish notification");
    },
  });

  // ─── Email Trigger ────────────────────────────────────────────────────────

  const triggerEmailNotification = async (notif: Notification) => {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: "__broadcast__",
          template: "announcement",
          data: {
            title: notif.title,
            message: notif.message,
            audience_type: notif.audience_type,
            audience_value: notif.audience_value || "",
          },
        },
      });

      if (error) {
        toast.error("Notification published but email delivery failed");
      } else {
        toast.success("Email notifications queued");
      }
    } catch {
      toast.error("Notification published but email trigger failed");
    }
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────

  const resetForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setFormErrors({});
    setPublishMode("immediate");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    // Build validation payload
    const validationPayload = {
      title: form.title,
      message: form.message,
      audience_type: form.audience_type,
      audience_value:
        form.audience_type === "all" ? null : form.audience_value || null,
      scheduled_at:
        publishMode === "scheduled" && form.scheduled_at
          ? form.scheduled_at
          : null,
    };

    const validation = notificationSchema.safeParse(validationPayload);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    // Additional validation: audience_value required for domain/team
    if (form.audience_type !== "all" && !form.audience_value.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        audience_value: `Please specify the ${form.audience_type === "domain" ? "domain name" : "team ID"}`,
      }));
      return;
    }

    // Additional validation: scheduled_at required when scheduling
    if (publishMode === "scheduled" && !form.scheduled_at) {
      setFormErrors((prev) => ({
        ...prev,
        scheduled_at: "Please select a scheduled date and time",
      }));
      return;
    }

    // Validate scheduled time is in the future
    if (publishMode === "scheduled" && form.scheduled_at) {
      if (new Date(form.scheduled_at) <= new Date()) {
        setFormErrors((prev) => ({
          ...prev,
          scheduled_at: "Scheduled time must be in the future",
        }));
        return;
      }
    }

    createMutation.mutate({
      form,
      publishNow: publishMode === "immediate",
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
            HMS — NOTIFICATIONS
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            ANNOUNCEMENTS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and send announcements to finalist teams.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
          >
            <RefreshCw size={13} /> REFRESH
          </button>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={13} /> CREATE NEW
          </button>
        </div>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-2 border-editorial-pink/50">
              <div className="bg-editorial-pink/5 border-b border-editorial-pink/50 px-4 py-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-editorial-pink">
                  CREATE ANNOUNCEMENT
                </p>
                <button
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 md:p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    TITLE *
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Announcement title (1-200 chars)"
                    maxLength={200}
                    className="bg-secondary border-border"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.title}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {form.title.length}/200
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    MESSAGE *
                  </label>
                  <Textarea
                    value={form.message}
                    onChange={(e) =>
                      handleFieldChange("message", e.target.value)
                    }
                    placeholder="Announcement message body (1-5000 chars)"
                    maxLength={5000}
                    rows={6}
                    className="bg-secondary border-border resize-y"
                  />
                  {formErrors.message && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {form.message.length}/5000
                  </p>
                </div>

                {/* Audience Type + Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                      AUDIENCE *
                    </label>
                    <div className="flex gap-2">
                      {(
                        [
                          { value: "all", label: "ALL TEAMS", icon: Globe },
                          { value: "domain", label: "DOMAIN", icon: Users },
                          { value: "team", label: "TEAM", icon: User },
                        ] as const
                      ).map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            handleFieldChange("audience_type", value);
                            if (value === "all") {
                              handleFieldChange("audience_value", "");
                            }
                          }}
                          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 transition-colors ${
                            form.audience_type === value
                              ? "border-editorial-pink text-editorial-pink bg-editorial-pink/5"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          <Icon size={12} />
                          {label}
                        </button>
                      ))}
                    </div>
                    {formErrors.audience_type && (
                      <p className="text-xs text-red-400 mt-1">
                        {formErrors.audience_type}
                      </p>
                    )}
                  </div>

                  {form.audience_type !== "all" && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                        {form.audience_type === "domain"
                          ? "DOMAIN NAME *"
                          : "TEAM ID *"}
                      </label>
                      <Input
                        value={form.audience_value}
                        onChange={(e) =>
                          handleFieldChange("audience_value", e.target.value)
                        }
                        placeholder={
                          form.audience_type === "domain"
                            ? "e.g., FinTech"
                            : "e.g., IH-0042"
                        }
                        className="bg-secondary border-border"
                      />
                      {formErrors.audience_value && (
                        <p className="text-xs text-red-400 mt-1">
                          {formErrors.audience_value}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Publish Mode */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    DELIVERY
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPublishMode("immediate")}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 transition-colors ${
                        publishMode === "immediate"
                          ? "border-editorial-pink text-editorial-pink bg-editorial-pink/5"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Send size={12} />
                      PUBLISH NOW
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishMode("scheduled")}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 border-2 transition-colors ${
                        publishMode === "scheduled"
                          ? "border-editorial-pink text-editorial-pink bg-editorial-pink/5"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      <Clock size={12} />
                      SCHEDULE
                    </button>
                  </div>
                </div>

                {/* Scheduled At */}
                {publishMode === "scheduled" && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                      SCHEDULED DATE & TIME *
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) =>
                        handleFieldChange("scheduled_at", e.target.value)
                      }
                      className="bg-secondary border-border"
                    />
                    {formErrors.scheduled_at && (
                      <p className="text-xs text-red-400 mt-1">
                        {formErrors.scheduled_at}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        SAVING...
                      </>
                    ) : (
                      <>
                        {publishMode === "immediate" ? (
                          <Send size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {publishMode === "immediate"
                          ? "PUBLISH NOW"
                          : "SCHEDULE"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-editorial-pink" />
            <p className="text-xs font-bold uppercase tracking-widest">
              ALL NOTIFICATIONS
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                LOADING...
              </p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO NOTIFICATIONS YET
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Create New" to send your first announcement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
              const status = getNotificationStatus(notif);
              return (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm truncate">
                          {notif.title}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${getStatusColor(status)}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {getAudienceIcon(notif.audience_type)}
                          {getAudienceLabel(notif)}
                        </span>
                        {notif.published_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={11} className="text-green-400" />
                            Published:{" "}
                            {new Date(notif.published_at).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                        {notif.scheduled_at && !notif.published_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-yellow-400" />
                            Scheduled:{" "}
                            {new Date(notif.scheduled_at).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Created:{" "}
                          {new Date(notif.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Publish button for draft/scheduled notifications */}
                      {status !== "Published" && (
                        <button
                          onClick={() => publishMutation.mutate(notif.id)}
                          disabled={publishMutation.isPending}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 border-2 border-editorial-pink text-editorial-pink hover:bg-editorial-pink/10 transition-colors disabled:opacity-40"
                          title="Publish now"
                        >
                          {publishMutation.isPending ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Send size={11} />
                          )}
                          PUBLISH
                        </button>
                      )}
                      {/* Send email button for published notifications */}
                      {status === "Published" && (
                        <button
                          onClick={() => triggerEmailNotification(notif)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 border-2 border-border text-muted-foreground hover:border-editorial-pink hover:text-editorial-pink transition-colors"
                          title="Resend email notification"
                        >
                          <Mail size={11} />
                          EMAIL
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;
