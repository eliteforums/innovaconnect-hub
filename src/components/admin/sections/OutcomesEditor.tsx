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

type Outcome = {
  title: string;
  desc: string;
  accent: string;
};

type OutcomesContent = {
  prize_pool_amount: string;
  prize_pool_sub: string;
  prize_tags: string[];
  outcomes: Outcome[];
};

const ACCENT_OPTIONS = [
  { value: "border-editorial-pink", label: "Pink" },
  { value: "border-editorial-blue", label: "Blue" },
  { value: "border-editorial-purple", label: "Purple" },
  { value: "border-editorial-green", label: "Green" },
  { value: "border-editorial-orange", label: "Orange" },
];

const OutcomesEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<OutcomesContent>("outcomes");

  const setField = (field: keyof OutcomesContent, value: string) =>
    update((prev) => ({ ...prev, [field]: value }));

  const updateTag = (index: number, value: string) =>
    update((prev) => {
      const tags = [...(prev.prize_tags ?? [])];
      tags[index] = value;
      return { ...prev, prize_tags: tags };
    });

  const removeTag = (index: number) =>
    update((prev) => ({
      ...prev,
      prize_tags: (prev.prize_tags ?? []).filter((_, i) => i !== index),
    }));

  const addTag = () =>
    update((prev) => ({
      ...prev,
      prize_tags: [...(prev.prize_tags ?? []), ""],
    }));

  const updateOutcome = (
    index: number,
    field: keyof Outcome,
    value: string
  ) =>
    update((prev) => {
      const updated = [...prev.outcomes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, outcomes: updated };
    });

  const removeOutcome = (index: number) =>
    update((prev) => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index),
    }));

  const addOutcome = () =>
    update((prev) => ({
      ...prev,
      outcomes: [
        ...prev.outcomes,
        { title: "", desc: "", accent: "border-editorial-pink" },
      ],
    }));

  const moveOutcome = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const updated = [...prev.outcomes];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return { ...prev, outcomes: updated };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="outcomes"
        title="OUTCOMES / WHAT YOU GET"
        description="Edit the 'What You Get' section shown on the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Prize pool banner */}
        <EditorCard title="PRIZE POOL BANNER">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Large prize pool amount shown in the pink banner">
                Prize Pool Amount
              </FieldLabel>
              <TextInput
                value={data.prize_pool_amount ?? ""}
                onChange={(v) => setField("prize_pool_amount", v)}
                placeholder="₹3 LAKHS+"
              />
            </div>
            <div>
              <FieldLabel hint="Subtitle under the prize pool number">
                Prize Pool Subtitle
              </FieldLabel>
              <TextInput
                value={data.prize_pool_sub ?? ""}
                onChange={(v) => setField("prize_pool_sub", v)}
                placeholder="Including Cash Prizes, Goodies, Swag Kits & More"
              />
            </div>
          </div>
        </EditorCard>

        {/* Prize tags */}
        <EditorCard title="PRIZE TAGS (chips in the banner)">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These appear as small badge chips inside the prize pool banner.
            Include an emoji at the start (e.g. 💰 Cash Prizes).
          </p>
          <div className="space-y-2">
            {(data.prize_tags ?? []).map((tag, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput
                  value={tag}
                  onChange={(v) => updateTag(i, v)}
                  placeholder="💰 Cash Prizes"
                />
                <button
                  onClick={() => removeTag(i)}
                  className="shrink-0 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <AddItemButton onClick={addTag} label="ADD TAG" />
        </EditorCard>

        {/* Outcomes */}
        <EditorCard title="OUTCOME CARDS">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            The three outcome cards shown below the prize pool banner (Placement,
            Incubation, Investor Access, etc.).
          </p>

          <div className="space-y-4">
            {(data.outcomes ?? []).map((outcome, i) => (
              <ArrayItem
                key={i}
                index={i}
                onRemove={() => removeOutcome(i)}
                onMoveUp={() => moveOutcome(i, "up")}
                onMoveDown={() => moveOutcome(i, "down")}
                isFirst={i === 0}
                isLast={i === (data.outcomes ?? []).length - 1}
              >
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <TextInput
                    value={outcome.title}
                    onChange={(v) => updateOutcome(i, "title", v)}
                    placeholder="ASSURED PLACEMENT ASSISTANCE"
                  />
                </div>
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <TextArea
                    value={outcome.desc}
                    onChange={(v) => updateOutcome(i, "desc", v)}
                    rows={2}
                    placeholder="Top 1% selected finalists receive..."
                  />
                </div>
                <div>
                  <FieldLabel hint="Left border accent color for the outcome card">
                    Accent Color
                  </FieldLabel>
                  <select
                    value={outcome.accent}
                    onChange={(e) => updateOutcome(i, "accent", e.target.value)}
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

          <AddItemButton onClick={addOutcome} label="ADD OUTCOME CARD" />
        </EditorCard>

        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              The first outcome card's content is used for the large prize pool
              banner — it's always shown separately in pink.
            </li>
            <li>
              Remaining outcome cards appear below the banner in a 3-column grid.
            </li>
            <li>Use the accent color to visually distinguish each card.</li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default OutcomesEditor;
