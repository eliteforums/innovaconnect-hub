import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ExternalLink, Pencil, Check, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchAllSponsors,
  upsertSponsor,
  deleteSponsor,
  uploadSponsorLogo,
} from "@/lib/supabase";
import type { Sponsor } from "@/lib/supabase";
import { SectionHeader } from "@/components/admin/AdminEditorLayout";

const CATEGORIES = [
  { value: "title", label: "Title Sponsor" },
  { value: "gold", label: "Gold Sponsor" },
  { value: "domain_ai", label: "Domain - Gen AI" },
  { value: "domain_fintech", label: "Domain - FinTech" },
  { value: "domain_healthtech", label: "Domain - HealthTech" },
  { value: "domain_blockchain", label: "Domain - Blockchain" },
  { value: "domain_startup", label: "Domain - Startup" },
  { value: "hiring", label: "Hiring Partner" },
  { value: "tech", label: "Tech Partner" },
  { value: "education", label: "Education Partner" },
  { value: "college", label: "College Partner" },
  { value: "community", label: "Community Partner" },
];

const emptySponsor = (): Omit<Sponsor, "id"> => ({
  name: "",
  logo_url: "",
  website_url: "",
  category: "gold",
  track: "",
  is_active: true,
  sort_order: 0,
});

type SponsorFormProps = {
  sponsor: Partial<Sponsor>;
  onSave: (s: Partial<Sponsor>) => Promise<void>;
  onCancel: () => void;
};

const SponsorForm = ({ sponsor, onSave, onCancel }: SponsorFormProps) => {
  const [form, setForm] = useState<Partial<Sponsor>>(sponsor);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (field: keyof Sponsor, value: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const tempId = form.id ?? `temp-${Date.now()}`;
    const { url, error } = await uploadSponsorLogo(file, tempId);
    if (url) upd("logo_url", url);
    else if (error) alert("Logo upload failed: " + error.message);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Sponsor name is required.");
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
        {form.id ? "EDIT SPONSOR" : "ADD NEW SPONSOR"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Name *
          </Label>
          <Input
            value={form.name ?? ""}
            onChange={(e) => upd("name", e.target.value)}
            placeholder="Company Name"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Website URL
          </Label>
          <Input
            value={form.website_url ?? ""}
            onChange={(e) => upd("website_url", e.target.value)}
            placeholder="https://example.com"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-widest">
            Category *
          </Label>
          <select
            value={form.category ?? "gold"}
            onChange={(e) => upd("category", e.target.value)}
            className="mt-1 w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-pink"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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

      <div>
        <Label className="text-xs font-bold uppercase tracking-widest mb-2 block">
          Logo
        </Label>
        <div className="flex flex-wrap items-center gap-3">
          {form.logo_url && (
            <div className="w-14 h-14 border border-border flex items-center justify-center overflow-hidden bg-secondary shrink-0">
              <img
                src={form.logo_url}
                alt="logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors disabled:opacity-50"
          >
            {uploading ? "UPLOADING..." : "UPLOAD LOGO"}
          </button>
          <Input
            value={form.logo_url ?? ""}
            onChange={(e) => upd("logo_url", e.target.value)}
            placeholder="Or paste logo URL directly"
            className="bg-secondary border-border text-sm flex-1 min-w-[160px]"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoUpload(f);
            }}
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
          {saving ? "SAVING..." : "SAVE SPONSOR"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-bold uppercase tracking-wider border-2 border-border px-4 py-2 hover:border-foreground transition-colors"
        >
          CANCEL
        </button>
      </div>
    </motion.div>
  );
};

const SponsorsManager = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllSponsors();
    setSponsors((data ?? []) as Sponsor[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (sponsorData: Partial<Sponsor>) => {
    const { data, error } = await upsertSponsor(sponsorData as Sponsor);
    if (error) {
      alert("Error saving sponsor: " + error.message);
      return;
    }
    if (data) {
      const saved = data as Sponsor;
      setSponsors((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
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
    if (!confirm("Delete this sponsor? This cannot be undone.")) return;
    await deleteSponsor(id);
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    const updated = { ...sponsor, is_active: !sponsor.is_active };
    await upsertSponsor(updated);
    setSponsors((prev) => prev.map((s) => (s.id === sponsor.id ? updated : s)));
  };

  const grouped = sponsors.reduce<Record<string, Sponsor[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const filtered =
    categoryFilter === "all"
      ? sponsors
      : sponsors.filter((s) => s.category === categoryFilter);

  const displayGroups: [string, Sponsor[]][] =
    categoryFilter === "all"
      ? Object.entries(grouped)
      : [[categoryFilter, filtered]];

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        section="sponsors"
        title="SPONSORS MANAGER"
        description="Add, edit, and manage all sponsors and partner logos displayed on the website."
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-secondary border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:outline-none focus:border-editorial-pink"
            >
              <option value="all">ALL CATEGORIES ({sponsors.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} ({grouped[c.value]?.length ?? 0})
                </option>
              ))}
            </select>
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-border px-3 py-2 hover:border-foreground transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <button
            onClick={() => {
              setAddingNew(true);
              setEditingId(null);
            }}
            className="flex items-center gap-1.5 bg-editorial-pink text-background px-4 py-2 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> ADD SPONSOR
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {addingNew && (
            <SponsorForm
              sponsor={emptySponsor()}
              onSave={handleSave}
              onCancel={() => setAddingNew(false)}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                LOADING...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-border p-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              NO SPONSORS YET
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Click "Add Sponsor" above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayGroups.map(([cat, catSponsors]) => {
              const catLabel =
                CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
              return (
                <div key={cat}>
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                    {catLabel} ({catSponsors.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catSponsors.map((sponsor) => (
                      <div key={sponsor.id}>
                        <AnimatePresence mode="wait">
                          {editingId === sponsor.id ? (
                            <SponsorForm
                              key="edit"
                              sponsor={sponsor}
                              onSave={handleSave}
                              onCancel={() => setEditingId(null)}
                            />
                          ) : (
                            <motion.div
                              key="card"
                              layout
                              className={`border-2 transition-colors ${
                                sponsor.is_active
                                  ? "border-border"
                                  : "border-border/30 opacity-50"
                              }`}
                            >
                              <div className="p-4 flex items-start gap-3">
                                <div className="w-12 h-12 border border-border flex items-center justify-center overflow-hidden bg-secondary shrink-0">
                                  {sponsor.logo_url ? (
                                    <img
                                      src={sponsor.logo_url}
                                      alt={sponsor.name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground/40 font-bold">
                                      LOGO
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black uppercase tracking-tight truncate">
                                    {sponsor.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Order: {sponsor.sort_order}
                                  </p>
                                  <span
                                    className={`inline-block mt-1 text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 ${
                                      sponsor.is_active
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                  >
                                    {sponsor.is_active ? "ACTIVE" : "HIDDEN"}
                                  </span>
                                </div>
                              </div>

                              <div className="border-t border-border px-3 py-2 flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    setEditingId(sponsor.id!);
                                    setAddingNew(false);
                                  }}
                                  className="text-xs font-bold uppercase tracking-wider text-editorial-blue hover:underline flex items-center gap-1"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                <button
                                  onClick={() => handleToggleActive(sponsor)}
                                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {sponsor.is_active ? "Hide" : "Show"}
                                </button>
                                {sponsor.website_url && (
                                  <a
                                    href={sponsor.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                  >
                                    <ExternalLink size={11} /> Site
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDelete(sponsor.id!)}
                                  className="ml-auto text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                >
                                  <X size={11} /> Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div className="border border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Storage note:</strong> Logos
          uploaded here are stored in Supabase Storage (
          <code className="bg-secondary px-1">sponsors</code> bucket, public
          access required). See{" "}
          <code className="bg-secondary px-1">supabase/INSTRUCTIONS.md</code>{" "}
          for full storage setup guide.
        </div>
      </div>
    </div>
  );
};

export default SponsorsManager;
