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

type Step = {
  num: string;
  title: string;
  desc: string;
};

type ProcessContent = {
  steps: Step[];
};

const ProcessEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<ProcessContent>("process");

  const steps = data.steps ?? [];

  const updateStep = (index: number, field: keyof Step, value: string) =>
    update((prev) => {
      const updated = [...prev.steps];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, steps: updated };
    });

  const removeStep = (index: number) =>
    update((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));

  const addStep = () =>
    update((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          num: String(prev.steps.length + 1).padStart(2, "0"),
          title: "",
          desc: "",
        },
      ],
    }));

  const moveStep = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const updated = [...prev.steps];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return { ...prev, steps: updated };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="process"
        title="PROCESS STEPS"
        description="Edit the step-by-step process section shown on the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">
        <p className="text-xs text-muted-foreground">
          {steps.length} step{steps.length !== 1 ? "s" : ""} configured. Steps are displayed left-to-right with an arrow between each.
        </p>

        <div className="space-y-4">
          {steps.length === 0 && (
            <div className="border-2 border-dashed border-border p-10 text-center text-muted-foreground text-sm">
              No steps yet. Add one below.
            </div>
          )}

          {steps.map((step, i) => (
            <ArrayItem
              key={i}
              index={i}
              onRemove={() => removeStep(i)}
              onMoveUp={() => moveStep(i, "up")}
              onMoveDown={() => moveStep(i, "down")}
              isFirst={i === 0}
              isLast={i === steps.length - 1}
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <FieldLabel hint="Display number (e.g. 01)">Step No.</FieldLabel>
                  <TextInput
                    value={step.num}
                    onChange={(v) => updateStep(i, "num", v)}
                    placeholder="01"
                  />
                </div>
                <div className="col-span-3">
                  <FieldLabel>Step Title</FieldLabel>
                  <TextInput
                    value={step.title}
                    onChange={(v) => updateStep(i, "title", v)}
                    placeholder="APPLY"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <TextArea
                  value={step.desc}
                  onChange={(v) => updateStep(i, "desc", v)}
                  rows={2}
                  placeholder="Describe this step..."
                />
              </div>
            </ArrayItem>
          ))}
        </div>

        <AddItemButton onClick={addStep} label="ADD STEP" />

        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Steps appear in a horizontal grid on desktop, vertical on mobile.</li>
            <li>A pink arrow (→) is automatically added between steps.</li>
            <li>Use the Step No. field for display only (e.g. 01, 02). It does not affect order.</li>
            <li>Reorder using the ↑ ↓ arrows on each item.</li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default ProcessEditor;
