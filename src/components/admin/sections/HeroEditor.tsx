import { useEditor, SaveBar, SectionHeader, EditorCard, FieldLabel, TextInput, TextArea, ArrayItem, AddItemButton } from "@/components/admin/AdminEditorLayout";

type KeyFact = { number: string; label: string; highlight?: boolean };

type HeroContent = {
  chapter: string;
  title_line1: string;
  title_line2: string;
  tagline: string;
  description: string;
  prize_pool: string;
  prize_label: string;
  placement_text: string;
  ticker_text: string;
  key_facts: KeyFact[];
  cta_primary: string;
  cta_secondary: string;
};

const HeroEditor = () => {
  const { data, update, reset, save, saveState, dirty } = useEditor<HeroContent>("hero");

  const setField = (field: keyof HeroContent, value: string) =>
    update((prev) => ({ ...prev, [field]: value }));

  const updateFact = (index: number, field: keyof KeyFact, value: string | boolean) =>
    update((prev) => {
      const facts = [...prev.key_facts];
      facts[index] = { ...facts[index], [field]: value };
      return { ...prev, key_facts: facts };
    });

  const removeFact = (index: number) =>
    update((prev) => ({
      ...prev,
      key_facts: prev.key_facts.filter((_, i) => i !== index),
    }));

  const addFact = () =>
    update((prev) => ({
      ...prev,
      key_facts: [...prev.key_facts, { number: "", label: "", highlight: false }],
    }));

  const moveFact = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const facts = [...prev.key_facts];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= facts.length) return prev;
      [facts[index], facts[target]] = [facts[target], facts[index]];
      return { ...prev, key_facts: facts };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="hero"
        title="HERO SECTION"
        description="Edit the main hero section that appears at the top of the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* Title & Branding */}
        <EditorCard title="TITLE & BRANDING">
          <div>
            <FieldLabel hint="Small text above the main title (e.g. 'CHAPTER 01 — 2026')">
              Chapter / Eyebrow Text
            </FieldLabel>
            <TextInput
              value={data.chapter}
              onChange={(v) => setField("chapter", v)}
              placeholder="CHAPTER 01 — 2026"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="First line of the giant headline">Title Line 1</FieldLabel>
              <TextInput
                value={data.title_line1}
                onChange={(v) => setField("title_line1", v)}
                placeholder="INNOVA"
              />
            </div>
            <div>
              <FieldLabel hint="Second line — displayed in pink">Title Line 2 (Pink)</FieldLabel>
              <TextInput
                value={data.title_line2}
                onChange={(v) => setField("title_line2", v)}
                placeholder="HACK"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Tagline</FieldLabel>
            <TextInput
              value={data.tagline}
              onChange={(v) => setField("tagline", v)}
              placeholder="India's Largest Hiring & Startup Hackathon"
            />
          </div>
          <div>
            <FieldLabel>Description Paragraph</FieldLabel>
            <TextArea
              value={data.description}
              onChange={(v) => setField("description", v)}
              rows={3}
              placeholder="Hack. Get Hired. Get Funded. ..."
            />
          </div>
        </EditorCard>

        {/* Prize Pool */}
        <EditorCard title="PRIZE POOL BLOCK">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Large prize pool number shown in the pink block">Prize Pool Amount</FieldLabel>
              <TextInput
                value={data.prize_pool}
                onChange={(v) => setField("prize_pool", v)}
                placeholder="₹50 LAKHS+"
              />
            </div>
            <div>
              <FieldLabel hint="Subtitle under the prize pool amount">Prize Pool Label</FieldLabel>
              <TextInput
                value={data.prize_label}
                onChange={(v) => setField("prize_label", v)}
                placeholder="Including Cash Prizes, Goodies & More"
              />
            </div>
          </div>
          <div>
            <FieldLabel hint="Text shown in the blue bordered box below prize pool">Placement Assistance Text</FieldLabel>
            <TextInput
              value={data.placement_text}
              onChange={(v) => setField("placement_text", v)}
              placeholder="Assured Placement Assistance to Top 1% Selected Finalists"
            />
          </div>
        </EditorCard>

        {/* Ticker */}
        <EditorCard title="SCROLLING TICKER">
          <div>
            <FieldLabel hint="Text that scrolls continuously across the pink bar at the bottom of the hero. Repeat items separated by • and end with a trailing space.">
              Ticker Text
            </FieldLabel>
            <TextInput
              value={data.ticker_text}
              onChange={(v) => setField("ticker_text", v)}
              placeholder="GENERATIVE AI • FINTECH • HEALTHTECH • HACK. GET HIRED. GET FUNDED. • "
            />
          </div>
        </EditorCard>

        {/* CTAs */}
        <EditorCard title="CALL-TO-ACTION BUTTONS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Primary button (pink, links to /register)">CTA Primary</FieldLabel>
              <TextInput
                value={data.cta_primary}
                onChange={(v) => setField("cta_primary", v)}
                placeholder="REGISTER NOW →"
              />
            </div>
            <div>
              <FieldLabel hint="Secondary button (outlined, links to /partner)">CTA Secondary</FieldLabel>
              <TextInput
                value={data.cta_secondary}
                onChange={(v) => setField("cta_secondary", v)}
                placeholder="PARTNER WITH US"
              />
            </div>
          </div>
        </EditorCard>

        {/* Key Facts */}
        <EditorCard title="KEY FACTS (RIGHT COLUMN)">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These appear in the right info block on the hero. Toggle "Highlight" to show an item in pink.
          </p>
          <div className="bg-editorial-pink/10 border border-editorial-pink/30 rounded p-3 mb-4">
            <p className="text-xs font-bold text-editorial-pink uppercase tracking-widest">ℹ️ Current Key Facts</p>
            <p className="text-xs text-muted-foreground mt-1">Your hero section should include: 10,000+ Applicants, Top 1% Selected, ₹50 Lakhs+ Prize Pool (highlighted), 30 Hrs, ₹50 Registration Fee, Mumbai Location, R1 Online + R2 Hybrid, and <strong>₹50 Lakhs+ Startup Funding (highlighted)</strong>.</p>
          </div>

          <div className="space-y-3">
            {(data.key_facts ?? []).map((fact, i) => (
              <ArrayItem
                key={i}
                index={i}
                onRemove={() => removeFact(i)}
                onMoveUp={() => moveFact(i, "up")}
                onMoveDown={() => moveFact(i, "down")}
                isFirst={i === 0}
                isLast={i === data.key_facts.length - 1}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Number / Value</FieldLabel>
                    <TextInput
                      value={fact.number}
                      onChange={(v) => updateFact(i, "number", v)}
                      placeholder="10,000+"
                    />
                  </div>
                  <div>
                    <FieldLabel>Label</FieldLabel>
                    <TextInput
                      value={fact.label}
                      onChange={(v) => updateFact(i, "label", v)}
                      placeholder="APPLICANTS"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                  <input
                    type="checkbox"
                    checked={fact.highlight ?? false}
                    onChange={(e) => updateFact(i, "highlight", e.target.checked)}
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Highlight this item in pink
                  </span>
                </label>
              </ArrayItem>
            ))}
          </div>

          <AddItemButton onClick={addFact} label="ADD KEY FACT" />
        </EditorCard>

        {/* Live preview hint */}
        <div className="border border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
          💡 <strong className="text-foreground">Tip:</strong> After saving, hard-refresh the homepage (Ctrl+Shift+R) to see your changes reflected immediately.
        </div>

      </div>
    </div>
  );
};

export default HeroEditor;
