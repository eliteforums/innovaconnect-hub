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

type FAQ = {
  q: string;
  a: string;
};

type FAQContent = {
  faqs: FAQ[];
};

const FAQEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<FAQContent>("faq");

  const faqs = data.faqs ?? [];

  const updateFAQ = (index: number, field: keyof FAQ, value: string) =>
    update((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });

  const removeFAQ = (index: number) =>
    update((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));

  const addFAQ = () =>
    update((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }],
    }));

  const moveFAQ = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const updated = [...prev.faqs];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return { ...prev, faqs: updated };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="faq"
        title="FAQ SECTION"
        description="Edit the frequently asked questions shown on the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">
        <p className="text-xs text-muted-foreground">
          {faqs.length} question{faqs.length !== 1 ? "s" : ""} configured. Questions appear in an accordion — click to expand.
        </p>

        <div className="space-y-4">
          {faqs.length === 0 && (
            <div className="border-2 border-dashed border-border p-10 text-center text-muted-foreground text-sm">
              No FAQs yet. Add one below.
            </div>
          )}

          {faqs.map((faq, i) => (
            <ArrayItem
              key={i}
              index={i}
              onRemove={() => removeFAQ(i)}
              onMoveUp={() => moveFAQ(i, "up")}
              onMoveDown={() => moveFAQ(i, "down")}
              isFirst={i === 0}
              isLast={i === faqs.length - 1}
            >
              <div>
                <FieldLabel hint="The question shown in the accordion header">
                  Question
                </FieldLabel>
                <TextInput
                  value={faq.q}
                  onChange={(v) => updateFAQ(i, "q", v)}
                  placeholder="Who can participate in InnovaHack?"
                />
              </div>
              <div>
                <FieldLabel hint="The answer shown when the accordion is expanded">
                  Answer
                </FieldLabel>
                <TextArea
                  value={faq.a}
                  onChange={(v) => updateFAQ(i, "a", v)}
                  rows={3}
                  placeholder="Any student, working professional..."
                />
              </div>
            </ArrayItem>
          ))}
        </div>

        <AddItemButton onClick={addFAQ} label="ADD FAQ" />

        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>FAQs are displayed as a collapsible accordion on the homepage.</li>
            <li>Keep questions concise — they appear as the clickable header.</li>
            <li>Answers support plain text. Avoid using HTML tags.</li>
            <li>Use the ↑ ↓ arrows to reorder questions.</li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default FAQEditor;
