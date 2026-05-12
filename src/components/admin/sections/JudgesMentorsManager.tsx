import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ExternalLink, Pencil, Check, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchAllJudgesMentors,
  upsertJudgeMentor,
  deleteJudgeMentor,
  uploadJudgeMentorImage,
} from "@/lib/supabase";
import type { JudgeMentor } from "@/lib/supabase";
import { SectionHeader } from "@/components/admin/AdminEditorLayout";
import { ImageCropper } from "./ImageCropper";

const ROW_PLACEMENTS = [
  { value: "none", label: "Not on About page marquee" },
  { value: "upper_row", label: "Upper Row (scrolls left)" },
  { value: "lower_row", label: "Lower Row (scrolls right)" },
];

const emptyPerson = (): Omit<JudgeMentor, "id"> => ({
  name: "",
  role: "",
  image_url: "",
  linkedin_url: "",
  track: "upper_row",
  is_active: true,
  sort_order: 0,
});

type PersonFormProps = {
  person: Partial<JudgeMentor>;
  onSave: (p: Partial<JudgeMentor>) => Promise<void>;
  onCancel: () => void;
};

const PersonForm = ({ person, onSave, onCancel }: PersonFormProps) => {
  const [form, setForm] = useState<Partial<JudgeMentor>>(person);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const upd = <K extends keyof JudgeMentor>(key: K, val: JudgeMentor[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    setCropImageSrc(null);
    setUploading(true);
    const file = new File([blob], selectedFileName, { type: "image/png" });
    const tempId = form.id ?? `person-${Date.now()}`;
    const { url, error } = await uploadJudgeMentorImage(file, tempId);
    if (url) upd("image_url", url);
    else if (error) alert("Image upload failed: " + error.message);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.role) {
      alert("Name and Role are required.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      className="border-2 border-foreground p-5 space-y-4 bg-background"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink">
        {form.id ? "EDIT JUDGE/MENTOR" : "ADD NEW JUDGE/MENTOR"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Full Name *
          </Label>
          <Input
            value={form.name ?? ""}
            onChange={(e) => upd("name", e.target.value)}
            placeholder="e.g. John Doe"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Role / Company *
          </Label>
          <Input
            value={form.role ?? ""}
            onChange={(e) => upd("role", e.target.value)}
            placeholder="e.g. Senior Architect at Microsoft"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            LinkedIn URL
          </Label>
          <Input
            value={form.linkedin_url ?? ""}
            onChange={(e) => upd("linkedin_url", e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Marquee Row
          </Label>
          <select
            value={form.track ?? "none"}
            onChange={(e) => upd("track", e.target.value)}
            className="mt-1 w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-pink"
          >
            {ROW_PLACEMENTS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Profile Image
          </Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="file"
              ref={fileRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-2 bg-secondary border border-border text-xs font-bold hover:border-editorial-pink transition-colors"
            >
              {uploading ? "UPLOADING..." : "SELECT PHOTO"}
            </button>
            {form.image_url && (
              <img
                src={form.image_url}
                alt="preview"
                className="w-10 h-10 object-cover rounded-full border border-border"
              />
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Sort Order
          </Label>
          <Input
            type="number"
            value={form.sort_order ?? 0}
            onChange={(e) => upd("sort_order", parseInt(e.target.value) || 0)}
            className="mt-1 bg-secondary border-border"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.is_active ?? true}
          onChange={(e) => upd("is_active", e.target.checked)}
          className="w-4 h-4 accent-pink-500"
        />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Active (visible on website)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 bg-editorial-pink text-background px-5 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {saving ? "SAVING..." : "SAVE EXPERT"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors"
        >
          CANCEL
        </button>
      </div>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </motion.div>
  );
};

const JudgesMentorsManager = () => {
  const [people, setPeople] = useState<JudgeMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllJudgesMentors();
    setPeople((data ?? []) as JudgeMentor[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (personData: Partial<JudgeMentor>) => {
    const { data, error } = await upsertJudgeMentor(personData as JudgeMentor);
    if (error) {
      alert("Error saving: " + error.message);
      return;
    }
    if (data) {
      const saved = data as JudgeMentor;
      setPeople((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
    }
    setAddingNew(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    await deleteJudgeMentor(id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleActive = async (person: JudgeMentor) => {
    const updated = { ...person, is_active: !person.is_active };
    await upsertJudgeMentor(updated);
    setPeople((prev) => prev.map((p) => (p.id === person.id ? updated : p)));
  };

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        section="judges"
        title="JUDGES & MENTORS"
        description="Manage the expert panel that appears on the About page."
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
          >
            <RefreshCw size={13} /> Refresh List
          </button>
          <button
            onClick={() => {
              setAddingNew(true);
              setEditingId(null);
            }}
            className="flex items-center gap-1.5 bg-editorial-pink text-background px-4 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> ADD EXPERT
          </button>
        </div>

        <AnimatePresence>
          {addingNew && (
            <PersonForm
              person={emptyPerson()}
              onSave={handleSave}
              onCancel={() => setAddingNew(false)}
            />
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : people.length === 0 ? (
          <div className="border-2 border-dashed border-border p-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO EXPERTS ADDED YET
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((person) => (
              <div key={person.id}>
                <AnimatePresence mode="wait">
                  {editingId === person.id ? (
                    <PersonForm
                      key="edit"
                      person={person}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <motion.div
                      key="card"
                      layout
                      className={`border-2 transition-colors ${
                        person.is_active
                          ? "border-border"
                          : "border-border/30 opacity-50"
                      }`}
                    >
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center overflow-hidden bg-secondary shrink-0">
                          {person.image_url ? (
                            <img
                              src={person.image_url}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40 font-black">
                              PHOTO
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight truncate">
                            {person.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">
                            {person.role}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 ${
                                person.is_active
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {person.is_active ? "ACTIVE" : "HIDDEN"}
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">
                              Track: {person.track?.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border px-3 py-2 flex items-center gap-3">
                        <button
                          onClick={() => setEditingId(person.id!)}
                          className="text-xs font-bold uppercase tracking-wider text-editorial-blue hover:underline flex items-center gap-1"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(person)}
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          {person.is_active ? "Hide" : "Show"}
                        </button>
                        {person.linkedin_url && (
                          <a
                            href={person.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <ExternalLink size={11} /> Profile
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(person.id!)}
                          className="ml-auto text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgesMentorsManager;