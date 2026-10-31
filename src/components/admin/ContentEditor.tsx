"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Braces,
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { resetSectionAction, saveSectionAction, uploadMediaAction } from "@/app/admin/actions";
import { listTemplates } from "@/lib/content/templates";

type Obj = Record<string, unknown>;
type Path = (string | number)[];
export type ImageOption = { key: string; label: string; group: string; preview: string };

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

// ── Field configuration ─────────────────────────────────────────────────────

const FACT_STATUSES = ["confirmed", "planned", "proposed", "target", "advertised", "reported", "unconfirmed"];
const REG_STATUSES = ["announcement", "interest", "soon", "open", "closed"];
const ILLUSTRATIONS = [
  "taxi", "bus", "train", "heritage", "coast", "vadaPav", "pavBhaji", "misalPav",
  "kalaGhoda", "auto", "station", "ai", "startup", "workstation",
];
const AWARD_KINDS = [
  "cash", "sponsor-benefit", "credits", "hardware", "mentorship", "incubation-consideration", "investor-introduction",
];

function enumFor(path: Path, key: string | number): string[] | null {
  const p = path.map(String);
  if (key === "status") return p.includes("registration") ? REG_STATUSES : FACT_STATUSES;
  if (key === "fit") return ["cover", "contain"];
  if (key === "accent") return ["violet", "burgundy"];
  if (key === "illustration") return ILLUSTRATIONS;
  if (key === "type" && (p.includes("body") || p.includes("article") || p.includes("sections"))) return ["p", "h2", "quote", "list"];
  if (key === "kind" && p.includes("awards")) return AWARD_KINDS;
  if (key === "kind" && p.includes("placeLabels")) return ["water", "area", "outside"];
  if (key === "label" && p.includes("stations")) return ["", "left", "right"];
  return null;
}

/** Keys whose empty value means "not set" (stored as null). */
const NULLABLE = new Set(["value", "date", "publishedOn", "author", "version", "effectiveFrom", "min", "max"]);
const NUMERIC = new Set(["min", "max", "n", "lat", "lon", "rotate", "year", "chapterNumber", "formTeamMemberLimit", "winnerCount"]);
const LONG = new Set([
  "description", "summary", "body", "text", "caption", "context", "note", "a", "deck", "message", "story",
  "pendingBody", "draftNote", "conditions", "eligibility", "challenge",
]);
const TITLE_KEYS = ["title", "name", "label", "headline", "q", "station", "team", "slug", "text", "id", "kicker"];

function isImageField(ctx: Ctx, path: Path, key: string | number) {
  if (ctx.section === "images") return true;
  if (key === "logo") return true;
  if (key === "src") return true;
  return path.length > 0 && key === "src";
}

function humanize(key: string | number) {
  if (typeof key === "number") return `Item ${key + 1}`;
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function itemTitle(item: unknown, index: number) {
  if (isObj(item)) {
    for (const k of TITLE_KEYS) {
      const v = item[k];
      if (typeof v === "string" && v.trim()) return v.length > 70 ? `${v.slice(0, 70)}…` : v;
    }
  }
  if (typeof item === "string" && item.trim()) return item.length > 70 ? `${item.slice(0, 70)}…` : item;
  return `Item ${index + 1}`;
}

function setIn(root: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = root.slice();
    copy[head as number] = setIn(root[head as number], rest, value);
    return copy;
  }
  const obj = isObj(root) ? root : {};
  return { ...obj, [head]: setIn(obj[head as string], rest, value) };
}

/** Combined shape of a list's object items, used to show fields an item doesn't have yet. */
function unionSample(items: unknown[]): Obj | null {
  if (!items.length || !items.every(isObj)) return null;
  const out: Obj = {};
  for (const it of items as Obj[]) for (const [k, v] of Object.entries(it)) if (!(k in out) || out[k] === null) out[k] = v;
  return out;
}

/** A fresh list item: a copy of the sample with free text cleared. */
function blankFrom(sample: unknown, key?: string): unknown {
  if (typeof sample === "string") return key && (enumKeys.has(key) || key === "src") ? sample : "";
  if (typeof sample === "number" || typeof sample === "boolean" || sample === null) return sample;
  if (Array.isArray(sample)) return [];
  if (isObj(sample)) return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankFrom(v, k)]));
  return sample;
}
const enumKeys = new Set(["status", "fit", "accent", "illustration", "type", "kind", "mode", "id"]);

// ── Context ─────────────────────────────────────────────────────────────────

type Ctx = {
  section: string;
  images: ImageOption[];
  addImage: (o: ImageOption) => void;
  templates: Record<string, unknown>;
};
const EditorContext = createContext<Ctx | null>(null);
const useCtx = () => useContext(EditorContext)!;

// ── Editor ──────────────────────────────────────────────────────────────────

export function ContentEditor({
  sectionKey,
  label,
  group,
  description,
  initial,
  updatedAt,
  images: initialImages,
  livePath,
}: {
  sectionKey: string;
  label: string;
  group: string;
  description: string;
  initial: unknown;
  updatedAt: string | null;
  images: ImageOption[];
  livePath: string;
}) {
  const [value, setValue] = useState<unknown>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [lastSaved, setLastSaved] = useState(updatedAt);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");
  const [images, setImages] = useState(initialImages);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(value) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const ctx = useMemo<Ctx>(
    () => ({
      section: sectionKey,
      images,
      addImage: (o) => setImages((list) => [o, ...list]),
      templates: listTemplates,
    }),
    [sectionKey, images],
  );

  function save() {
    let payload = value;
    if (mode === "json") {
      try {
        payload = JSON.parse(jsonText);
      } catch {
        setStatus({ ok: false, message: "The JSON has a syntax error, so nothing was saved." });
        return;
      }
    }
    start(async () => {
      const res = await saveSectionAction(sectionKey, JSON.stringify(payload));
      setStatus({ ok: res.ok, message: res.message });
      if (res.ok) {
        setValue(res.data);
        setSaved(JSON.stringify(res.data));
        setJsonText(JSON.stringify(res.data, null, 2));
        setLastSaved(new Date().toISOString());
      }
    });
  }

  function reset() {
    if (!window.confirm(`Restore "${label}" to the built-in default? Your saved edits to this section will be removed.`)) return;
    start(async () => {
      const res = await resetSectionAction(sectionKey);
      setStatus({ ok: res.ok, message: res.message });
      if (res.ok) {
        setValue(res.data);
        setSaved(JSON.stringify(res.data));
        setJsonText(JSON.stringify(res.data, null, 2));
        setLastSaved(null);
      }
    });
  }

  function toggleMode() {
    if (mode === "form") {
      setJsonText(JSON.stringify(value, null, 2));
      setMode("json");
    } else {
      try {
        setValue(JSON.parse(jsonText));
        setMode("form");
        setStatus(null);
      } catch {
        setStatus({ ok: false, message: "Fix the JSON syntax error before switching back to the form." });
      }
    }
  }

  const isCopy = sectionKey.startsWith("copy.") || ["articles", "faq", "rules", "city", "chapter1", "domains"].includes(sectionKey);

  return (
    <EditorContext value={ctx}>
      <div className="max-w-5xl">
        <p className="kicker text-burgundy">Edit · {group}</p>
        <h1 className="headline mt-2 text-5xl">{label}</h1>
        <p className="mt-2 max-w-3xl text-charcoal">{description}</p>
        <p className="mt-1 text-xs text-muted">
          {lastSaved ? `Last saved ${new Date(lastSaved).toLocaleString("en-IN")}` : "Showing the built-in default — not edited yet."}
        </p>
        {isCopy && (
          <details className="mt-4 border-2 border-ink/30 bg-paper-white px-4 py-3 text-sm">
            <summary className="cursor-pointer font-semibold">Text formatting help</summary>
            <ul className="mt-2 space-y-1 text-charcoal">
              <li>
                <code className="bg-paper-deep px-1">*words*</code> — show words in the accent colour (e.g. the burgundy half of a headline)
              </li>
              <li>
                <code className="bg-paper-deep px-1">[link text](/page)</code> — a link; use full https:// addresses for other sites
              </li>
              <li>A new line in a text box becomes a line break on the page.</li>
              <li>
                <code className="bg-paper-deep px-1">{"{organizer}"}</code>, <code className="bg-paper-deep px-1">{"{year}"}</code>,{" "}
                <code className="bg-paper-deep px-1">{"{fullName}"}</code> — filled in from Event settings.
              </li>
            </ul>
          </details>
        )}

        {/* Toolbar */}
        <div className="sticky top-0 z-20 mt-6 flex flex-wrap items-center gap-2 border-2 border-ink bg-paper-white p-3 shadow-[0_4px_0_0_rgba(23,23,23,0.08)]">
          <button
            type="button"
            onClick={save}
            disabled={pending || (!dirty && mode === "form")}
            className="inline-flex items-center gap-2 border-2 border-burgundy bg-burgundy px-4 py-2 text-sm font-semibold text-paper-white hover:bg-burgundy-deep disabled:opacity-50"
          >
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden className="size-4" />}
            Save & publish
          </button>
          <button
            type="button"
            onClick={() => {
              setValue(JSON.parse(saved));
              setJsonText(JSON.stringify(JSON.parse(saved), null, 2));
              setStatus(null);
            }}
            disabled={!dirty || pending}
            className="inline-flex items-center gap-2 border-2 border-ink px-3 py-2 text-sm font-semibold hover:bg-paper disabled:opacity-40"
          >
            <Undo2 aria-hidden className="size-4" /> Discard changes
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center gap-2 border-2 border-ink px-3 py-2 text-sm font-semibold hover:bg-paper"
          >
            <Braces aria-hidden className="size-4" /> {mode === "form" ? "Edit as JSON" : "Back to form"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending || !lastSaved}
            className="inline-flex items-center gap-2 border-2 border-ink px-3 py-2 text-sm font-semibold hover:bg-paper disabled:opacity-40"
          >
            <RotateCcw aria-hidden className="size-4" /> Reset to default
          </button>
          <a
            href={livePath}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
          >
            View page <ExternalLink aria-hidden className="size-3.5" />
          </a>
          {dirty && <span className="w-full text-xs font-semibold text-burgundy sm:w-auto">Unsaved changes</span>}
        </div>
        {status && (
          <p
            role={status.ok ? "status" : "alert"}
            className={`mt-3 border-2 px-3 py-2 text-sm font-medium ${status.ok ? "border-ink bg-taxi/40" : "border-best bg-best/5"}`}
          >
            {status.message}
          </p>
        )}

        <div className="mt-6">
          {mode === "json" ? (
            <textarea
              aria-label="Section JSON"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              className="h-[70vh] w-full rounded-md border-2 border-ink bg-paper-white p-3 font-mono text-xs"
            />
          ) : (
            <Field fieldKey={label} value={value} path={[]} onChange={(path, v) => setValue((root: unknown) => setIn(root, path, v))} root />
          )}
        </div>
      </div>
    </EditorContext>
  );
}


// ── Fields ──────────────────────────────────────────────────────────────────

type FieldProps = {
  fieldKey: string | number;
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  sample?: unknown;
  root?: boolean;
};

function Field(props: FieldProps) {
  const { value, sample } = props;
  const shape = value === undefined ? sample : value;
  if (Array.isArray(shape)) return <ListField {...props} value={Array.isArray(value) ? value : []} />;
  if (isObj(shape)) return <ObjectField {...props} value={isObj(value) ? value : {}} />;
  return <PrimitiveField {...props} />;
}

function ObjectField({ fieldKey, value, path, onChange, sample, root }: FieldProps & { value: Obj }) {
  const keys = Array.from(new Set([...Object.keys(value), ...(isObj(sample) ? Object.keys(sample) : [])]));
  const body = (
    <div className="grid gap-4">
      {keys.map((k) => (
        <Field
          key={k}
          fieldKey={k}
          value={value[k]}
          sample={isObj(sample) ? sample[k] : undefined}
          path={[...path, k]}
          onChange={onChange}
        />
      ))}
    </div>
  );
  if (root) return body;
  return (
    <fieldset className="min-w-0 border-l-4 border-paper-deep pl-4">
      <legend className="mb-3 label text-[0.75rem] text-burgundy">{humanize(fieldKey)}</legend>
      {body}
    </fieldset>
  );
}

function ListField({ fieldKey, value, path, onChange, root }: FieldProps & { value: unknown[] }) {
  const { templates } = useCtx();
  const sample = unionSample(value);
  const primitive = value.length > 0 ? value.every((v) => !isObj(v) && !Array.isArray(v)) : typeof templates[String(fieldKey)] === "string";

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(path, next);
  };
  const add = () => {
    const template = templates[String(fieldKey)];
    const item =
      value.length > 0 ? blankFrom(sample ?? value[value.length - 1]) : template !== undefined ? structuredClone(template) : "";
    onChange(path, [...value, item]);
  };

  return (
    <div className={root ? "min-w-0" : "min-w-0 border-l-4 border-paper-deep pl-4"}>
      {!root && (
        <p className="mb-2 label text-[0.75rem] text-burgundy">
          {humanize(fieldKey)} <span className="font-normal normal-case tracking-normal text-muted">({value.length})</span>
        </p>
      )}
      <ol className="grid gap-2 [&>li]:min-w-0">
        {value.map((item, i) => {
          const controls = (
            <span className="flex shrink-0 items-center gap-0.5">
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton
                label="Duplicate"
                onClick={() => onChange(path, [...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)])}
              >
                <Copy className="size-3.5" />
              </IconButton>
              <IconButton
                label="Remove"
                danger
                onClick={() => {
                  if (window.confirm("Remove this item?")) onChange(path, value.filter((_, j) => j !== i));
                }}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
            </span>
          );
          if (primitive) {
            return (
              <li key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <PrimitiveField fieldKey={i} value={item} path={[...path, i]} onChange={onChange} bare />
                </div>
                {controls}
              </li>
            );
          }
          return (
            <li key={i}>
              <details className="group border-2 border-ink/25 bg-paper-white open:border-ink/60">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-paper">
                  <span className="min-w-0 truncate text-sm font-semibold">
                    <span className="mr-2 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {itemTitle(item, i)}
                  </span>
                  {controls}
                </summary>
                <div className="border-t border-ink/15 p-4">
                  <Field fieldKey={i} value={item} sample={sample ?? undefined} path={[...path, i]} onChange={onChange} root />
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 border-2 border-dashed border-ink/50 px-3 py-1.5 text-xs font-semibold hover:border-ink hover:bg-paper-white"
      >
        <Plus aria-hidden className="size-3.5" /> Add {primitive ? "line" : "item"}
      </button>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`rounded p-1.5 disabled:opacity-30 ${danger ? "text-best hover:bg-best/10" : "hover:bg-paper-deep"}`}
    >
      {children}
    </button>
  );
}

const inputClass =
  "block w-full rounded-md border-2 border-ink/40 bg-paper-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none";

function PrimitiveField({
  fieldKey,
  value,
  path,
  onChange,
  sample,
  bare = false,
}: FieldProps & { bare?: boolean }) {
  const ctx = useCtx();
  const label = humanize(fieldKey);
  const key = String(fieldKey);
  const parentKey = String(path[path.length - 2] ?? "");
  const options = enumFor(path, typeof fieldKey === "number" ? parentKey : key);
  const type = value === undefined || value === null ? typeof sample : typeof value;
  const id = `f-${path.join("-")}`;
  const wrap = (control: React.ReactNode, hint?: string) =>
    bare ? (
      control
    ) : (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-semibold text-charcoal">
          {label}
          {value === null && <span className="ml-2 font-normal text-muted">(not set)</span>}
        </label>
        {control}
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    );

  if (isImageField(ctx, path, fieldKey) && (type === "string" || value === null || value === undefined)) {
    return wrap(<ImageField id={id} value={(value as string) ?? ""} onChange={(v) => onChange(path, v)} />);
  }

  if (options) {
    const current = (value as string) ?? "";
    const list = options.includes(current) ? options : [current, ...options];
    return wrap(
      <select id={id} value={current} onChange={(e) => onChange(path, e.target.value)} className={inputClass}>
        {list.map((o) => (
          <option key={o} value={o}>
            {o || "—"}
          </option>
        ))}
      </select>,
    );
  }

  if (type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(path, e.target.checked)}
          className="size-4 accent-burgundy"
        />
        {label}
      </label>
    );
  }

  if (type === "number" || (value === null && NUMERIC.has(key))) {
    return wrap(
      <input
        id={id}
        type="number"
        step="any"
        value={value === null || value === undefined ? "" : String(value)}
        placeholder="Not set"
        onChange={(e) => onChange(path, e.target.value === "" ? null : Number(e.target.value))}
        className={inputClass}
      />,
    );
  }

  const text = typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
  const nullable = value === null || NULLABLE.has(key);
  const long = LONG.has(key) || LONG.has(parentKey) || text.length > 90 || text.includes("\n");
  const set = (v: string) => onChange(path, v === "" && nullable ? null : v);
  return wrap(
    long ? (
      <textarea
        id={id}
        value={text}
        rows={Math.min(10, Math.max(2, Math.ceil(text.length / 90) + text.split("\n").length - 1))}
        onChange={(e) => set(e.target.value)}
        placeholder={nullable ? "Leave empty for “to be announced”" : undefined}
        className={inputClass}
      />
    ) : (
      <input
        id={id}
        value={text}
        onChange={(e) => set(e.target.value)}
        placeholder={nullable ? "Leave empty for “to be announced”" : undefined}
        className={inputClass}
      />
    ),
    key === "date" || key === "publishedOn" || key === "opensOn" ? "Use a date like 2027-02-01." : undefined,
  );
}

function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const { images, addImage } = useCtx();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = images.find((i) => i.key === value);
  const preview = current?.preview ?? (value.startsWith("/") || value.startsWith("http") ? value : null);
  const groups = Array.from(new Set(images.map((i) => i.group)));

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadMediaAction(fd);
    setUploading(false);
    if (res.ok && res.data) {
      addImage({ key: res.data.url, label: res.data.name, group: "Upload", preview: res.data.url });
      onChange(res.data.url);
    } else setError(res.message);
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-ink/30 bg-paper-deep">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-contain" />
        ) : (
          <span className="px-1 text-center text-[0.625rem] text-muted">No image</span>
        )}
      </div>
      <div className="grid min-w-[220px] flex-1 gap-2">
        <select id={id} value={current ? value : ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">{current || !value ? "— Choose an image —" : "Custom URL (below)"}</option>
          {groups.map((g) => (
            <optgroup key={g} label={g === "Upload" ? "Uploaded" : `${g}s`}>
              {images
                .filter((i) => i.group === g)
                .map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <input
          aria-label="Image key or URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Library key or https:// URL"
          className={`${inputClass} font-mono text-xs`}
        />
        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 border-2 border-ink/50 px-3 py-1.5 text-xs font-semibold hover:bg-paper-white">
          {uploading ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : <ImagePlus aria-hidden className="size-3.5" />}
          Upload new image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </label>
        {error && <p className="text-xs font-medium text-best">{error}</p>}
      </div>
    </div>
  );
}
