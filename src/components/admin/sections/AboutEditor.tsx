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

type Stat = {
  number: string;
  label: string;
};

type TransparencyItem = {
  title: string;
  desc: string;
  accent: string;
};

type AboutContent = {
  mission_title_line1: string;
  mission_title_line2: string;
  what_is_title: string;
  what_is_body: string[];
  org_title: string;
  org_body: string[];
  stats: Stat[];
  transparency: TransparencyItem[];
};

const ACCENT_OPTIONS = [
  { value: "border-editorial-blue", label: "Blue" },
  { value: "border-editorial-green", label: "Green" },
  { value: "border-editorial-purple", label: "Purple" },
  { value: "border-editorial-pink", label: "Pink" },
  { value: "border-editorial-orange", label: "Orange" },
];

const AboutEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<AboutContent>("about");

  const setField = (field: keyof AboutContent, value: string) =>
    update((prev) => ({ ...prev, [field]: value }));

  // ── what_is_body paragraphs ──────────────────────────────────────────────
  const updateWhatIsBody = (index: number, value: string) =>
    update((prev) => {
      const arr = [...(prev.what_is_body ?? [])];
      arr[index] = value;
      return { ...prev, what_is_body: arr };
    });
  const removeWhatIsBody = (index: number) =>
    update((prev) => ({
      ...prev,
      what_is_body: (prev.what_is_body ?? []).filter((_, i) => i !== index),
    }));
  const addWhatIsBody = () =>
    update((prev) => ({
      ...prev,
      what_is_body: [...(prev.what_is_body ?? []), ""],
    }));

  // ── org_body paragraphs ──────────────────────────────────────────────────
  const updateOrgBody = (index: number, value: string) =>
    update((prev) => {
      const arr = [...(prev.org_body ?? [])];
      arr[index] = value;
      return { ...prev, org_body: arr };
    });
  const removeOrgBody = (index: number) =>
    update((prev) => ({
      ...prev,
      org_body: (prev.org_body ?? []).filter((_, i) => i !== index),
    }));
  const addOrgBody = () =>
    update((prev) => ({
      ...prev,
      org_body: [...(prev.org_body ?? []), ""],
    }));

  // ── stats ────────────────────────────────────────────────────────────────
  const updateStat = (index: number, field: keyof Stat, value: string) =>
    update((prev) => {
      const arr = [...(prev.stats ?? [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, stats: arr };
    });
  const removeStat = (index: number) =>
    update((prev) => ({
      ...prev,
      stats: (prev.stats ?? []).filter((_, i) => i !== index),
    }));
  const addStat = () =>
    update((prev) => ({
      ...prev,
      stats: [...(prev.stats ?? []), { number: "", label: "" }],
    }));
  const moveStat = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const arr = [...(prev.stats ?? [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, stats: arr };
    });

  // ── transparency items ───────────────────────────────────────────────────
  const updateTransparency = (
    index: number,
    field: keyof TransparencyItem,
    value: string
  ) =>
    update((prev) => {
      const arr = [...(prev.transparency ?? [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, transparency: arr };
    });
  const removeTransparency = (index: number) =>
    update((prev) => ({
      ...prev,
      transparency: (prev.transparency ?? []).filter((_, i) => i !== index),
    }));
  const addTransparency = () =>
    update((prev) => ({
      ...prev,
      transparency: [
        ...(prev.transparency ?? []),
        { title: "", desc: "", accent: "border-editorial-blue" },
      ],
    }));
  const moveTransparency = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const arr = [...(prev.transparency ?? [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, transparency: arr };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="about"
        title="ABOUT PAGE"
        description="Edit the content shown on the /about page — mission, org info, stats, and transparency promise."
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* Hero headline */}
        <EditorCard title="HERO HEADLINE">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            The large headline at the top of the About page. Line 2 is shown in{" "}
            <span className="text-editorial-pink font-bold">pink</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="First line of the hero headline">
                Headline Line 1
              </FieldLabel>
              <TextInput
                value={data.mission_title_line1 ?? ""}
                onChange={(v) => setField("mission_title_line1", v)}
                placeholder="THE"
              />
            </div>
            <div>
              <FieldLabel hint="Second line — shown in pink">
                Headline Line 2 (Pink)
              </FieldLabel>
              <TextInput
                value={data.mission_title_line2 ?? ""}
                onChange={(v) => setField("mission_title_line2", v)}
                placeholder="MISSION"
              />
            </div>
          </div>

          {/* Mini preview */}
          <div className="mt-2 border border-border bg-secondary/20 px-5 py-4">
            <p className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">
              {data.mission_title_line1 || "THE"}
              <br />
              <span className="text-editorial-pink">
                {data.mission_title_line2 || "MISSION"}
              </span>
            </p>
          </div>
        </EditorCard>

        {/* What is InnovaHack */}
        <EditorCard title="WHAT IS INNOVAHACK?">
          <div>
            <FieldLabel hint="Section title shown above the body paragraphs">
              Section Title
            </FieldLabel>
            <TextInput
              value={data.what_is_title ?? ""}
              onChange={(v) => setField("what_is_title", v)}
              placeholder="INDIA'S LARGEST HIRING & STARTUP HACKATHON"
            />
          </div>

          <div className="space-y-3 mt-2">
            <FieldLabel hint="Each paragraph appears as a separate block of text">
              Body Paragraphs
            </FieldLabel>
            {(data.what_is_body ?? []).map((para, i) => (
              <div key={i} className="flex gap-2 items-start">
                <TextArea
                  value={para}
                  onChange={(v) => updateWhatIsBody(i, v)}
                  rows={2}
                  placeholder={`Paragraph ${i + 1}...`}
                  className="flex-1"
                />
                <button
                  onClick={() => removeWhatIsBody(i)}
                  className="shrink-0 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-2 transition-colors mt-0"
                >
                  ✕
                </button>
              </div>
            ))}
            <AddItemButton onClick={addWhatIsBody} label="ADD PARAGRAPH" />
          </div>
        </EditorCard>

        {/* Organized by */}
        <EditorCard title="ORGANIZED BY (ELITE FORUMS)">
          <div>
            <FieldLabel hint="Title of this column (e.g. ELITE FORUMS)">
              Organisation Title
            </FieldLabel>
            <TextInput
              value={data.org_title ?? ""}
              onChange={(v) => setField("org_title", v)}
              placeholder="ELITE FORUMS"
            />
          </div>

          <div className="space-y-3 mt-2">
            <FieldLabel hint="Body paragraphs for the organiser section">
              Body Paragraphs
            </FieldLabel>
            {(data.org_body ?? []).map((para, i) => (
              <div key={i} className="flex gap-2 items-start">
                <TextArea
                  value={para}
                  onChange={(v) => updateOrgBody(i, v)}
                  rows={2}
                  placeholder={`Paragraph ${i + 1}...`}
                  className="flex-1"
                />
                <button
                  onClick={() => removeOrgBody(i)}
                  className="shrink-0 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <AddItemButton onClick={addOrgBody} label="ADD PARAGRAPH" />
          </div>
        </EditorCard>

        {/* Stats */}
        <EditorCard title="STATS ROW">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These numbers appear as a horizontal row of stats on the About page (and are also used on the homepage hero).
          </p>
          <div className="space-y-3">
            {(data.stats ?? []).length === 0 && (
              <div className="border-2 border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No stats yet. Add one below.
              </div>
            )}
            {(data.stats ?? []).map((stat, i) => (
              <ArrayItem
                key={i}
                index={i}
                onRemove={() => removeStat(i)}
                onMoveUp={() => moveStat(i, "up")}
                onMoveDown={() => moveStat(i, "down")}
                isFirst={i === 0}
                isLast={i === (data.stats ?? []).length - 1}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel hint="The large number or value (e.g. 10,000+ or TOP 200–250)">
                      Number / Value
                    </FieldLabel>
                    <TextInput
                      value={stat.number}
                      onChange={(v) => updateStat(i, "number", v)}
                      placeholder="10,000+"
                    />
                  </div>
                  <div>
                    <FieldLabel hint="Small label below the number">
                      Label
                    </FieldLabel>
                    <TextInput
                      value={stat.label}
                      onChange={(v) => updateStat(i, "label", v)}
                      placeholder="APPLICANTS EXPECTED"
                    />
                  </div>
                </div>
              </ArrayItem>
            ))}
          </div>
          <AddItemButton onClick={addStat} label="ADD STAT" />
        </EditorCard>

        {/* Transparency Promise */}
        <EditorCard title="TRANSPARENCY PROMISE CARDS">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These appear as the three highlighted cards in the "Transparency First" section.
          </p>
          <div className="space-y-4">
            {(data.transparency ?? []).length === 0 && (
              <div className="border-2 border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No transparency items yet. Add one below.
              </div>
            )}
            {(data.transparency ?? []).map((item, i) => (
              <ArrayItem
                key={i}
                index={i}
                onRemove={() => removeTransparency(i)}
                onMoveUp={() => moveTransparency(i, "up")}
                onMoveDown={() => moveTransparency(i, "down")}
                isFirst={i === 0}
                isLast={i === (data.transparency ?? []).length - 1}
              >
                <div>
                  <FieldLabel>Card Title</FieldLabel>
                  <TextInput
                    value={item.title}
                    onChange={(v) => updateTransparency(i, "title", v)}
                    placeholder="DATA ACCESS"
                  />
                </div>
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <TextArea
                    value={item.desc}
                    onChange={(v) => updateTransparency(i, "desc", v)}
                    rows={2}
                    placeholder="We assure complete transparency..."
                  />
                </div>
                <div>
                  <FieldLabel hint="Left border accent color for this card">
                    Accent Color
                  </FieldLabel>
                  <select
                    value={item.accent}
                    onChange={(e) => updateTransparency(i, "accent", e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink text-foreground"
                  >
                    {ACCENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </ArrayItem>
            ))}
          </div>
          <AddItemButton onClick={addTransparency} label="ADD TRANSPARENCY CARD" />
        </EditorCard>

        {/* Notes */}
        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              Changes here only affect the{" "}
              <code className="bg-secondary px-1">/about</code> page.
            </li>
            <li>
              Stats on this page are separate from the Hero section's Key Facts.
              Update both if you want consistency.
            </li>
            <li>
              The "Why ₹100?" section on the About page is currently hardcoded.
              Contact your developer to make it editable.
            </li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default AboutEditor;
