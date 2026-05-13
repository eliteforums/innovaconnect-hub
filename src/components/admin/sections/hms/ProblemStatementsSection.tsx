import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Edit3,
  Upload,
  X,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Badge,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { ProblemStatement, ResourceFile } from "@/lib/hms";
import { problemStatementSchema } from "@/lib/hmsValidation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".zip"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  domain: string;
  release_at: string;
  deadline: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  domain: "",
  release_at: "",
  deadline: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReleaseStatus(ps: ProblemStatement): "Draft" | "Scheduled" | "Released" {
  if (!ps.release_at) return "Draft";
  const releaseDate = new Date(ps.release_at);
  return releaseDate > new Date() ? "Scheduled" : "Released";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Released":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "Scheduled":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function isFileAllowed(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return (
    (ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext)) &&
    file.size <= MAX_FILE_SIZE
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

const ProblemStatementsSection = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────────────────

  const {
    data: problemStatements = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hms", "problem-statements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problem_statements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProblemStatement[];
    },
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: {
      form: FormData;
      resources: ResourceFile[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("problem_statements")
        .insert({
          title: payload.form.title,
          description: payload.form.description,
          domain: payload.form.domain,
          release_at: payload.form.release_at,
          deadline: payload.form.deadline || null,
          resources: payload.resources,
          is_updated: false,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Problem statement created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["hms", "problem-statements"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create problem statement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      form: FormData;
      resources: ResourceFile[];
    }) => {
      const { data, error } = await supabase
        .from("problem_statements")
        .update({
          title: payload.form.title,
          description: payload.form.description,
          domain: payload.form.domain,
          release_at: payload.form.release_at,
          deadline: payload.form.deadline || null,
          resources: payload.resources,
        })
        .eq("id", payload.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Problem statement updated");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["hms", "problem-statements"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update problem statement");
    },
  });

  const toggleUpdatedMutation = useMutation({
    mutationFn: async ({ id, is_updated }: { id: string; is_updated: boolean }) => {
      const { error } = await supabase
        .from("problem_statements")
        .update({ is_updated })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hms", "problem-statements"] });
      toast.success("Updated badge toggled");
    },
    onError: () => {
      toast.error("Failed to toggle updated badge");
    },
  });

  // ─── File Upload Logic ────────────────────────────────────────────────────

  const uploadFiles = async (files: File[]): Promise<ResourceFile[]> => {
    const uploaded: ResourceFile[] = [];

    for (const file of files) {
      const filePath = `problem-statements/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("finalist-assets")
        .upload(filePath, file);

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("finalist-assets")
        .getPublicUrl(filePath);

      uploaded.push({
        name: file.name,
        url: urlData.publicUrl || filePath,
        size: file.size,
        type: file.type,
      });
    }

    return uploaded;
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setPendingFiles([]);
    setFileError(null);
    setUploadProgress(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (ps: ProblemStatement) => {
    setEditingId(ps.id);
    setForm({
      title: ps.title,
      description: ps.description,
      domain: ps.domain,
      release_at: ps.release_at ? new Date(ps.release_at).toISOString().slice(0, 16) : "",
      deadline: ps.deadline ? new Date(ps.deadline).toISOString().slice(0, 16) : "",
    });
    setPendingFiles([]);
    setFormErrors({});
    setFileError(null);
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
    // Validate form
    const validation = problemStatementSchema.safeParse({
      title: form.title,
      description: form.description,
      domain: form.domain,
      release_at: form.release_at,
      deadline: form.deadline || undefined,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    // Validate file count
    const existingResources = editingId
      ? (problemStatements.find((ps) => ps.id === editingId)?.resources ?? [])
      : [];
    if (existingResources.length + pendingFiles.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed. Currently ${existingResources.length} existing.`);
      return;
    }

    setUploadProgress(true);

    try {
      // Upload new files
      let newResources: ResourceFile[] = [];
      if (pendingFiles.length > 0) {
        newResources = await uploadFiles(pendingFiles);
      }

      const allResources = [...existingResources, ...newResources];

      if (editingId) {
        updateMutation.mutate({ id: editingId, form, resources: allResources });
      } else {
        createMutation.mutate({ form, resources: allResources });
      }
    } catch (err: any) {
      toast.error(err.message || "File upload failed");
    } finally {
      setUploadProgress(false);
    }
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────

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
      setFileError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      addFiles(files);
      e.target.value = "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingFiles]
  );

  const addFiles = (files: File[]) => {
    setFileError(null);

    // Check total count
    const existingCount = editingId
      ? (problemStatements.find((ps) => ps.id === editingId)?.resources.length ?? 0)
      : 0;

    if (pendingFiles.length + files.length + existingCount > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed total.`);
      return;
    }

    // Validate each file
    const invalid = files.filter((f) => !isFileAllowed(f));
    if (invalid.length > 0) {
      const names = invalid.map((f) => f.name).join(", ");
      setFileError(
        `Invalid file(s): ${names}. Allowed: PDF, DOCX, PNG, JPG, ZIP (max 50MB each).`
      );
      return;
    }

    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
            HMS — PROBLEM STATEMENTS
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            PROBLEM STATEMENTS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, schedule, and manage problem statements for finalist teams.
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

      {/* Create/Edit Form */}
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
                  {editingId ? "EDIT PROBLEM STATEMENT" : "CREATE PROBLEM STATEMENT"}
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
                    placeholder="Problem statement title (max 200 chars)"
                    maxLength={200}
                    className="bg-secondary border-border"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {form.title.length}/200
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    DESCRIPTION *
                  </label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Full problem statement description (max 5000 chars)"
                    maxLength={5000}
                    rows={6}
                    className="bg-secondary border-border resize-y"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {form.description.length}/5000
                  </p>
                </div>

                {/* Domain + Release At + Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                      DOMAIN *
                    </label>
                    <Input
                      value={form.domain}
                      onChange={(e) => handleFieldChange("domain", e.target.value)}
                      placeholder="e.g., FinTech, HealthTech"
                      className="bg-secondary border-border"
                    />
                    {formErrors.domain && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.domain}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                      RELEASE AT *
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.release_at}
                      onChange={(e) => handleFieldChange("release_at", e.target.value)}
                      className="bg-secondary border-border"
                    />
                    {formErrors.release_at && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.release_at}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                      DEADLINE (OPTIONAL)
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.deadline}
                      onChange={(e) => handleFieldChange("deadline", e.target.value)}
                      className="bg-secondary border-border"
                    />
                    {formErrors.deadline && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.deadline}</p>
                    )}
                  </div>
                </div>

                {/* Resource Files Upload */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    RESOURCE FILES (MAX 10, 50MB EACH)
                  </label>

                  {/* Existing resources when editing */}
                  {editingId && (() => {
                    const existing = problemStatements.find((ps) => ps.id === editingId)?.resources ?? [];
                    if (existing.length === 0) return null;
                    return (
                      <div className="mb-3 space-y-1">
                        <p className="text-xs text-muted-foreground">Existing files:</p>
                        {existing.map((res, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs border border-border px-2 py-1.5">
                            <FileText size={12} className="text-editorial-pink shrink-0" />
                            <span className="truncate flex-1">{res.name}</span>
                            <span className="text-muted-foreground shrink-0">
                              {(res.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("ps-file-input")?.click()}
                    className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                      isDragOver
                        ? "border-editorial-pink bg-editorial-pink/5"
                        : "border-border hover:border-editorial-pink/50"
                    }`}
                  >
                    <Upload
                      size={20}
                      className={`mx-auto mb-2 ${
                        isDragOver ? "text-editorial-pink" : "text-muted-foreground"
                      }`}
                    />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      DRAG & DROP FILES HERE
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      or click to browse · PDF, DOCX, PNG, JPG, ZIP · max 50MB each
                    </p>
                  </div>
                  <input
                    id="ps-file-input"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.zip"
                    className="hidden"
                    onChange={handleFileInput}
                  />

                  {/* Pending files list */}
                  {pendingFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pendingFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs border border-editorial-pink/30 bg-editorial-pink/5 px-2 py-1.5"
                        >
                          <FileText size={12} className="text-editorial-pink shrink-0" />
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(i);
                            }}
                            className="text-red-400 hover:text-red-300 shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {fileError && (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 border border-red-400/30 bg-red-400/5 px-3 py-2 mt-2">
                      <AlertCircle size={14} />
                      {fileError}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      createMutation.isPending ||
                      updateMutation.isPending ||
                      uploadProgress
                    }
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {(createMutation.isPending || updateMutation.isPending || uploadProgress) ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        {uploadProgress ? "UPLOADING..." : "SAVING..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} />
                        {editingId ? "UPDATE" : "CREATE"}
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

      {/* Problem Statements List */}
      <div className="border-2 border-border">
        <div className="bg-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-editorial-pink" />
            <p className="text-xs font-bold uppercase tracking-widest">
              ALL PROBLEM STATEMENTS
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {problemStatements.length} statement{problemStatements.length !== 1 ? "s" : ""}
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
        ) : problemStatements.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO PROBLEM STATEMENTS YET
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Create New" to add the first problem statement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {problemStatements.map((ps) => {
              const status = getReleaseStatus(ps);
              return (
                <div
                  key={ps.id}
                  className="p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm truncate">
                          {ps.title}
                        </h3>
                        {ps.is_updated && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-editorial-pink text-background px-1.5 py-0.5">
                            UPDATED
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${getStatusColor(status)}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {ps.description}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-bold uppercase">Domain:</span> {ps.domain}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Release: {new Date(ps.release_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {ps.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            Deadline: {new Date(ps.deadline).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {ps.resources.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={11} />
                            {ps.resources.length} file{ps.resources.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle Updated Badge */}
                      {status === "Released" && (
                        <button
                          onClick={() =>
                            toggleUpdatedMutation.mutate({
                              id: ps.id,
                              is_updated: !ps.is_updated,
                            })
                          }
                          disabled={toggleUpdatedMutation.isPending}
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 border-2 transition-colors ${
                            ps.is_updated
                              ? "border-editorial-pink text-editorial-pink hover:bg-editorial-pink/10"
                              : "border-border text-muted-foreground hover:border-editorial-pink hover:text-editorial-pink"
                          }`}
                          title={ps.is_updated ? "Remove Updated badge" : "Add Updated badge"}
                        >
                          <Badge size={11} />
                          {ps.is_updated ? "UPDATED" : "MARK UPDATED"}
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(ps)}
                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider border-2 border-border px-2 py-1.5 hover:border-foreground transition-colors"
                      >
                        <Edit3 size={11} /> EDIT
                      </button>
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

export default ProblemStatementsSection;
