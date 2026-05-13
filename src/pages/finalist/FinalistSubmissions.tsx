import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Github,
  Video,
  FileText,
  Image,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinalistContext } from "./FinalistLayout";
import {
  fetchSubmission,
  fetchProblemStatements,
  upsertSubmission,
  type Submission,
} from "@/lib/hms";
import { githubUrlSchema, videoUrlSchema } from "@/lib/hmsValidation";
import { supabase } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const PITCH_DECK_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const PITCH_DECK_TYPES = [".pdf", ".pptx"];
const DOC_MAX_SIZE = 25 * 1024 * 1024; // 25MB
const DOC_MAX_COUNT = 5;
const DOC_TYPES = [".pdf", ".docx"];
const POW_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const POW_MAX_COUNT = 10;
const POW_TYPES = [".png", ".jpg", ".jpeg", ".webp"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function getDeliverableStatus(submission: Submission | null) {
  return [
    { key: "github_url", label: "GitHub Repository", icon: Github, done: !!submission?.github_url },
    { key: "pitch_deck_url", label: "Pitch Deck", icon: FileText, done: !!submission?.pitch_deck_url },
    { key: "video_url", label: "Demo Video", icon: Video, done: !!submission?.video_url },
    { key: "documentation_urls", label: "Documentation", icon: FileText, done: (submission?.documentation_urls?.length ?? 0) > 0 },
    { key: "pow_urls", label: "Proof of Work", icon: Image, done: (submission?.pow_urls?.length ?? 0) > 0 },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinalistSubmissions = () => {
  const { team } = useFinalistContext();
  const queryClient = useQueryClient();

  // Form state
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubError, setGithubError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch submission
  const { data: submission, isLoading: submissionLoading } = useQuery({
    queryKey: ["finalist-submission", team?.id],
    queryFn: async () => {
      if (!team) return null;
      const { data } = await fetchSubmission(team.id);
      return data;
    },
    enabled: !!team,
    onSuccess: (data: Submission | null) => {
      if (data) {
        setGithubUrl(data.github_url ?? "");
        setVideoUrl(data.video_url ?? "");
      }
    },
  });

  // Initialize form from submission data
  if (submission && !githubUrl && submission.github_url) {
    setGithubUrl(submission.github_url);
  }
  if (submission && !videoUrl && submission.video_url) {
    setVideoUrl(submission.video_url);
  }

  // Fetch deadline from problem statements
  const { data: deadline } = useQuery({
    queryKey: ["finalist-deadline", team?.domain],
    queryFn: async () => {
      if (!team) return null;
      const { data } = await fetchProblemStatements(team.domain);
      if (!data || data.length === 0) return null;
      // Use the earliest deadline from problem statements
      const deadlines = data
        .filter((ps) => ps.deadline)
        .map((ps) => new Date(ps.deadline!).getTime());
      if (deadlines.length === 0) return null;
      return new Date(Math.min(...deadlines)).toISOString();
    },
    enabled: !!team,
  });

  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;

  // Upsert mutation for URL fields
  const urlMutation = useMutation({
    mutationFn: async (updates: Partial<Submission>) => {
      if (!team) throw new Error("No team");
      const { error } = await upsertSubmission({ team_id: team.id, ...updates });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finalist-submission"] });
    },
  });

  // Save GitHub URL
  const handleSaveGithub = () => {
    setGithubError(null);
    if (!githubUrl.trim()) {
      urlMutation.mutate({ github_url: null });
      return;
    }
    const result = githubUrlSchema.safeParse(githubUrl.trim());
    if (!result.success) {
      setGithubError(result.error.errors[0].message);
      return;
    }
    urlMutation.mutate({ github_url: githubUrl.trim() });
  };

  // Save Video URL
  const handleSaveVideo = () => {
    setVideoError(null);
    if (!videoUrl.trim()) {
      urlMutation.mutate({ video_url: null });
      return;
    }
    const result = videoUrlSchema.safeParse(videoUrl.trim());
    if (!result.success) {
      setVideoError(result.error.errors[0].message);
      return;
    }
    urlMutation.mutate({ video_url: videoUrl.trim() });
  };

  // File upload handler
  const handleFileUpload = async (
    files: FileList | null,
    bucket: string,
    field: "pitch_deck_url" | "documentation_urls" | "pow_urls",
    maxSize: number,
    allowedTypes: string[],
    maxCount: number = 1,
  ) => {
    if (!files || !team) return;
    setUploadError(null);
    setUploadingField(field);

    try {
      const fileArray = Array.from(files);

      // Validate count
      if (field === "documentation_urls") {
        const existing = submission?.documentation_urls?.length ?? 0;
        if (existing + fileArray.length > maxCount) {
          throw new Error(`Maximum ${maxCount} files allowed. You have ${existing} already.`);
        }
      } else if (field === "pow_urls") {
        const existing = submission?.pow_urls?.length ?? 0;
        if (existing + fileArray.length > maxCount) {
          throw new Error(`Maximum ${maxCount} files allowed. You have ${existing} already.`);
        }
      }

      // Validate each file
      for (const file of fileArray) {
        const ext = getFileExtension(file.name);
        if (!allowedTypes.includes(ext)) {
          throw new Error(`Invalid file type: ${ext}. Allowed: ${allowedTypes.join(", ")}`);
        }
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" exceeds max size of ${formatFileSize(maxSize)}`);
        }
      }

      const uploadedPaths: string[] = [];

      for (const file of fileArray) {
        const timestamp = Date.now();
        const path = `${team.id}/${timestamp}-${file.name}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: true });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        uploadedPaths.push(path);
      }

      // Update submission record
      if (field === "pitch_deck_url") {
        await upsertSubmission({ team_id: team.id, pitch_deck_url: uploadedPaths[0] });
      } else if (field === "documentation_urls") {
        const existing = submission?.documentation_urls ?? [];
        await upsertSubmission({
          team_id: team.id,
          documentation_urls: [...existing, ...uploadedPaths],
        });
      } else if (field === "pow_urls") {
        const existing = submission?.pow_urls ?? [];
        await upsertSubmission({
          team_id: team.id,
          pow_urls: [...existing, ...uploadedPaths],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["finalist-submission"] });
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Remove a file from multi-file fields
  const handleRemoveFile = async (
    field: "documentation_urls" | "pow_urls",
    index: number,
  ) => {
    if (!team || !submission) return;
    const current = field === "documentation_urls"
      ? [...(submission.documentation_urls ?? [])]
      : [...(submission.pow_urls ?? [])];
    current.splice(index, 1);
    await upsertSubmission({ team_id: team.id, [field]: current });
    queryClient.invalidateQueries({ queryKey: ["finalist-submission"] });
  };

  // Replace pitch deck
  const handleReplacePitchDeck = async () => {
    if (!team) return;
    await upsertSubmission({ team_id: team.id, pitch_deck_url: null });
    queryClient.invalidateQueries({ queryKey: ["finalist-submission"] });
  };

  if (!team) return null;

  const deliverables = getDeliverableStatus(submission ?? null);
  const completedCount = deliverables.filter((d) => d.done).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
          <Upload size={16} className="text-background" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
            DELIVERABLES
          </p>
          <h1 className="text-xl font-black uppercase tracking-tight">
            SUBMISSIONS
          </h1>
        </div>
      </div>

      {/* Deadline warning */}
      {isDeadlinePassed && (
        <div className="border-2 border-red-500 bg-red-500/10 p-4 flex items-center gap-3">
          <Lock size={18} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400 uppercase">
              Submissions Closed
            </p>
            <p className="text-xs text-red-400/80">
              The submission deadline has passed. No further changes can be made.
            </p>
          </div>
        </div>
      )}

      {/* Progress tracker */}
      <div className="border-2 border-foreground p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            PROGRESS
          </p>
          <span className="text-xs font-bold text-editorial-pink">
            {completedCount}/5 COMPLETE
          </span>
        </div>
        <div className="w-full h-2 bg-secondary mb-4">
          <div
            className="h-full bg-editorial-pink transition-all duration-300"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {deliverables.map((d) => (
            <div
              key={d.key}
              className={`flex flex-col items-center gap-1 p-2 border text-center ${
                d.done ? "border-green-500/50 bg-green-500/5" : "border-border"
              }`}
            >
              {d.done ? (
                <CheckCircle2 size={16} className="text-green-400" />
              ) : (
                <d.icon size={16} className="text-muted-foreground" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {submissionLoading ? (
        <div className="border-2 border-foreground p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            LOADING...
          </p>
        </div>
      ) : (
        <>
          {/* Upload error */}
          {uploadError && (
            <div className="border-2 border-red-500 bg-red-500/10 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {uploadError}
            </div>
          )}

          {/* GitHub URL */}
          <div className="border-2 border-foreground p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              GITHUB REPOSITORY
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setGithubError(null);
                  }}
                  placeholder="https://github.com/username/repository"
                  className="bg-secondary border-border"
                  disabled={isDeadlinePassed}
                />
                {githubError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {githubError}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveGithub}
                disabled={isDeadlinePassed || urlMutation.isPending}
                className="px-4 py-2 bg-editorial-pink text-background text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SAVE
              </button>
            </div>
          </div>

          {/* Pitch Deck */}
          <div className="border-2 border-foreground p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              PITCH DECK
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              PDF or PPTX, max 50MB
            </p>
            {submission?.pitch_deck_url ? (
              <div className="flex items-center gap-3 px-3 py-2 border border-green-500/50 bg-green-500/5">
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                <span className="text-xs font-bold flex-1 truncate">
                  {submission.pitch_deck_url.split("/").pop()}
                </span>
                {!isDeadlinePassed && (
                  <button
                    onClick={handleReplacePitchDeck}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Replace
                  </button>
                )}
              </div>
            ) : (
              <FileUploadZone
                accept={PITCH_DECK_TYPES.join(",")}
                disabled={isDeadlinePassed || uploadingField === "pitch_deck_url"}
                uploading={uploadingField === "pitch_deck_url"}
                onFiles={(files) =>
                  handleFileUpload(files, "pitch-decks", "pitch_deck_url", PITCH_DECK_MAX_SIZE, PITCH_DECK_TYPES)
                }
              />
            )}
          </div>

          {/* Demo Video */}
          <div className="border-2 border-foreground p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              DEMO VIDEO
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              YouTube, Vimeo, or Google Drive URL
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoError(null);
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-secondary border-border"
                  disabled={isDeadlinePassed}
                />
                {videoError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {videoError}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveVideo}
                disabled={isDeadlinePassed || urlMutation.isPending}
                className="px-4 py-2 bg-editorial-pink text-background text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SAVE
              </button>
            </div>
          </div>

          {/* Documentation */}
          <div className="border-2 border-foreground p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              DOCUMENTATION
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Up to {DOC_MAX_COUNT} files (PDF/DOCX), max 25MB each
            </p>
            {/* Existing files */}
            {(submission?.documentation_urls ?? []).length > 0 && (
              <div className="space-y-1 mb-3">
                {submission!.documentation_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2 border border-border"
                  >
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-xs font-bold flex-1 truncate">
                      {url.split("/").pop()}
                    </span>
                    {!isDeadlinePassed && (
                      <button
                        onClick={() => handleRemoveFile("documentation_urls", idx)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(submission?.documentation_urls?.length ?? 0) < DOC_MAX_COUNT && (
              <FileUploadZone
                accept={DOC_TYPES.join(",")}
                multiple
                disabled={isDeadlinePassed || uploadingField === "documentation_urls"}
                uploading={uploadingField === "documentation_urls"}
                onFiles={(files) =>
                  handleFileUpload(files, "documentation", "documentation_urls", DOC_MAX_SIZE, DOC_TYPES, DOC_MAX_COUNT)
                }
              />
            )}
          </div>

          {/* Proof of Work */}
          <div className="border-2 border-foreground p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              PROOF OF WORK
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Up to {POW_MAX_COUNT} images (PNG/JPG/WEBP), max 10MB each
            </p>
            {/* Existing files */}
            {(submission?.pow_urls ?? []).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                {submission!.pow_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative border border-border p-2 group"
                  >
                    <Image size={20} className="mx-auto text-muted-foreground" />
                    <p className="text-[9px] text-center text-muted-foreground truncate mt-1">
                      {url.split("/").pop()}
                    </p>
                    {!isDeadlinePassed && (
                      <button
                        onClick={() => handleRemoveFile("pow_urls", idx)}
                        className="absolute top-1 right-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(submission?.pow_urls?.length ?? 0) < POW_MAX_COUNT && (
              <FileUploadZone
                accept={POW_TYPES.join(",")}
                multiple
                disabled={isDeadlinePassed || uploadingField === "pow_urls"}
                uploading={uploadingField === "pow_urls"}
                onFiles={(files) =>
                  handleFileUpload(files, "proof-of-work", "pow_urls", POW_MAX_SIZE, POW_TYPES, POW_MAX_COUNT)
                }
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileUploadZone({
  accept,
  multiple = false,
  disabled = false,
  uploading = false,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  uploading?: boolean;
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      onFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
        disabled
          ? "border-border opacity-50 cursor-not-allowed"
          : dragOver
          ? "border-editorial-pink bg-editorial-pink/5"
          : "border-border hover:border-editorial-pink"
      }`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => onFiles(e.target.files)}
      />
      {uploading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-editorial-pink" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            UPLOADING...
          </span>
        </div>
      ) : (
        <>
          <Upload size={20} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {disabled ? "UPLOADS DISABLED" : "DROP FILES OR CLICK TO UPLOAD"}
          </p>
        </>
      )}
    </div>
  );
}

export default FinalistSubmissions;
