import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { upsertSiteContent } from "@/lib/supabase";
import { useContent } from "@/contexts/ContentContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Save Bar ─────────────────────────────────────────────────────────────────

export const SaveBar = ({
  onSave,
  onReset,
  saveState,
  dirty,
}: {
  onSave: () => void;
  onReset: () => void;
  saveState: SaveState;
  dirty: boolean;
}) => (
  <div className="sticky top-0 z-20 border-b-2 border-foreground bg-background px-4 md:px-6 py-3 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {saveState === "saving" && (
          <motion.div
            key="saving"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <Loader2 size={14} className="animate-spin" />
            SAVING...
          </motion.div>
        )}
        {saveState === "saved" && (
          <motion.div
            key="saved"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <CheckCircle size={14} />
            SAVED SUCCESSFULLY
          </motion.div>
        )}
        {saveState === "error" && (
          <motion.div
            key="error"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <AlertCircle size={14} />
            SAVE FAILED — TRY AGAIN
          </motion.div>
        )}
        {saveState === "idle" && dirty && (
          <motion.div
            key="unsaved"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-400"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            UNSAVED CHANGES
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onReset}
        disabled={!dirty || saveState === "saving"}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCcw size={13} /> Reset
      </button>
      <button
        onClick={onSave}
        disabled={!dirty || saveState === "saving"}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-editorial-pink text-background px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save size={13} />
        {saveState === "saving" ? "SAVING..." : "SAVE CHANGES"}
      </button>
    </div>
  </div>
);

// ─── Field helpers ────────────────────────────────────────────────────────────

export const FieldLabel = ({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="mb-1.5">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
    {hint && (
      <p className="text-xs text-muted-foreground/60 mt-0.5">{hint}</p>
    )}
  </div>
);

export const TextInput = ({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink transition-colors rounded-none ${className}`}
  />
);

export const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink transition-colors rounded-none resize-y ${className}`}
  />
);

export const SectionHeader = ({
  section,
  title,
  description,
}: {
  section: string;
  title: string;
  description?: string;
}) => (
  <div className="border-b border-border px-4 md:px-6 py-5">
    <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
      CONTENT EDITOR — {section.toUpperCase()}
    </p>
    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
      {title}
    </h2>
    {description && (
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    )}
  </div>
);

export const EditorCard = ({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`border-2 border-border ${className}`}>
    {title && (
      <div className="bg-secondary/40 border-b border-border px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
      </div>
    )}
    <div className="p-4 md:p-5 space-y-4">{children}</div>
  </div>
);

// ─── Array Item Wrapper ───────────────────────────────────────────────────────

export const ArrayItem = ({
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  children,
}: {
  index: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
  children: React.ReactNode;
}) => (
  <div className="border-2 border-border">
    <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-secondary/30">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        ITEM {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-1">
        {onMoveUp && (
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            ↑
          </button>
        )}
        {onMoveDown && (
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            ↓
          </button>
        )}
        <button
          onClick={onRemove}
          className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
        >
          REMOVE
        </button>
      </div>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// ─── Add Item Button ──────────────────────────────────────────────────────────

export const AddItemButton = ({
  onClick,
  label = "ADD ITEM",
}: {
  onClick: () => void;
  label?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full border-2 border-dashed border-border py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:border-editorial-pink hover:text-editorial-pink transition-colors"
  >
    + {label}
  </button>
);

// ─── useEditor hook ───────────────────────────────────────────────────────────
// Manages local state, dirty tracking, save, and reset for any content section.

export function useEditor<T extends Record<string, unknown>>(
  sectionKey: string,
  adminEmail?: string
) {
  const { getSection, updateSection } = useContent();
  const defaultData = getSection<T>(sectionKey);

  const [data, setData] = useState<T>(() => JSON.parse(JSON.stringify(defaultData)));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirty, setDirty] = useState(false);

  const update = (updater: (prev: T) => T) => {
    setData((prev) => updater(prev));
    setDirty(true);
    if (saveState === "saved" || saveState === "error") setSaveState("idle");
  };

  const reset = () => {
    setData(JSON.parse(JSON.stringify(getSection<T>(sectionKey))));
    setDirty(false);
    setSaveState("idle");
  };

  const save = async () => {
    setSaveState("saving");
    const { error } = await upsertSiteContent(
      sectionKey,
      data as Record<string, unknown>,
      adminEmail
    );
    if (error) {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } else {
      updateSection(sectionKey, data as Record<string, unknown>);
      setSaveState("saved");
      setDirty(false);
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  return { data, update, reset, save, saveState, dirty };
}
