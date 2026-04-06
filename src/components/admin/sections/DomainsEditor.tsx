import {
  useEditor,
  SaveBar,
  SectionHeader,
  EditorCard,
  FieldLabel,
  TextInput,
  TextArea,
  ArrayItem,
  AddItemButton,
} from "@/components/admin/AdminEditorLayout";

type Domain = {
  name: string;
  description: string;
  tag: string;
  color: string;
  accent: string;
};

type DomainsContent = {
  domains: Domain[];
};

const COLOR_OPTIONS = [
  { value: "border-editorial-purple", label: "Purple" },
  { value: "border-editorial-blue", label: "Blue" },
  { value: "border-editorial-green", label: "Green" },
  { value: "border-editorial-orange", label: "Orange" },
  { value: "border-editorial-pink", label: "Pink" },
];

const ACCENT_OPTIONS = [
  { value: "text-editorial-purple", label: "Purple" },
  { value: "text-editorial-blue", label: "Blue" },
  { value: "text-editorial-green", label: "Green" },
  { value: "text-editorial-orange", label: "Orange" },
  { value: "text-editorial-pink", label: "Pink" },
];

const DomainsEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<DomainsContent>("domains");

  const domains = data.domains ?? [];

  const updateDomain = (index: number, field: keyof Domain, value: string) =>
    update((prev) => {
      const updated = [...prev.domains];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, domains: updated };
    });

  const removeDomain = (index: number) =>
    update((prev) => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index),
    }));

  const addDomain = () =>
    update((prev) => ({
      ...prev,
      domains: [
        ...prev.domains,
        {
          name: "",
          description: "",
          tag: "",
          color: "border-editorial-pink",
          accent: "text-editorial-pink",
        },
      ],
    }));

  const moveDomain = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const updated = [...prev.domains];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return { ...prev, domains: updated };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar
        onSave={save}
        onReset={reset}
        saveState={saveState}
        dirty={dirty}
      />

      <SectionHeader
        section="domains"
        title="DOMAINS SECTION"
        description="Edit the hackathon domain tracks shown on the homepage and Tracks page."
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Domain count info */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {domains.length} DOMAIN{domains.length !== 1 ? "S" : ""} CONFIGURED
          </p>
        </div>

        {/* Domain list */}
        <div className="space-y-4">
          {domains.length === 0 && (
            <div className="border-2 border-dashed border-border p-10 text-center text-muted-foreground text-sm">
              No domains yet. Add one below.
            </div>
          )}

          {domains.map((domain, i) => (
            <ArrayItem
              key={i}
              index={i}
              onRemove={() => removeDomain(i)}
              onMoveUp={() => moveDomain(i, "up")}
              onMoveDown={() => moveDomain(i, "down")}
              isFirst={i === 0}
              isLast={i === domains.length - 1}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <FieldLabel hint="Full domain name in uppercase (e.g. GENERATIVE AI)">
                    Domain Name
                  </FieldLabel>
                  <TextInput
                    value={domain.name}
                    onChange={(v) => updateDomain(i, "name", v)}
                    placeholder="GENERATIVE AI"
                  />
                </div>

                {/* Tag */}
                <div>
                  <FieldLabel hint="Short tag displayed on the chip (e.g. AI/ML)">
                    Tag / Short Label
                  </FieldLabel>
                  <TextInput
                    value={domain.tag}
                    onChange={(v) => updateDomain(i, "tag", v)}
                    placeholder="AI/ML"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <FieldLabel hint="Short description paragraph shown in the domain card">
                  Description
                </FieldLabel>
                <TextArea
                  value={domain.description}
                  onChange={(v) => updateDomain(i, "description", v)}
                  rows={2}
                  placeholder="Build the next wave of AI-powered applications..."
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel hint="Border color used for the domain card and tag chip">
                    Border Color
                  </FieldLabel>
                  <select
                    value={domain.color}
                    onChange={(e) => updateDomain(i, "color", e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink text-foreground"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel hint="Text/accent color used for the tag label in the card">
                    Accent Color
                  </FieldLabel>
                  <select
                    value={domain.accent}
                    onChange={(e) => updateDomain(i, "accent", e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink text-foreground"
                  >
                    {ACCENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview chip */}
              <div className="pt-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  PREVIEW
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`border-2 ${domain.color} px-3 py-1 text-xs font-bold tracking-widest uppercase`}
                  >
                    {domain.tag || "TAG"}
                  </span>
                  <span
                    className={`text-xs font-bold tracking-widest uppercase ${domain.accent}`}
                  >
                    {domain.name || "DOMAIN NAME"}
                  </span>
                </div>
              </div>
            </ArrayItem>
          ))}
        </div>

        <AddItemButton onClick={addDomain} label="ADD DOMAIN" />

        {/* Notes */}
        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              Domain changes are reflected on the{" "}
              <strong className="text-foreground">Homepage Domains section</strong>{" "}
              and the <strong className="text-foreground">Tracks page</strong>.
            </li>
            <li>
              The <strong className="text-foreground">Tag</strong> field is shown
              as the colored chip (e.g. AI/ML, FINANCE, WEB3).
            </li>
            <li>
              Colors must match Tailwind class names defined in the project's
              theme (purple, blue, green, orange, pink).
            </li>
            <li>
              Use the arrow buttons to reorder domains. The order here matches
              the order on the site.
            </li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default DomainsEditor;
