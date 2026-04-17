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

type ROIBenefit = {
  benefit: string;
  value: string;
  icon: string;
};

type FeeContent = {
  fee_amount: string;
  fee_label: string;
  location: string;
  mode_r1: string;
  mode_r2: string;
  duration: string;
  roi_total: string;
  roi_multiplier: string;
  roi_benefits: ROIBenefit[];
};

const FeeEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<FeeContent>("fee");

  const setField = (field: keyof FeeContent, value: string) =>
    update((prev) => ({ ...prev, [field]: value }));

  const updateBenefit = (
    index: number,
    field: keyof ROIBenefit,
    value: string
  ) =>
    update((prev) => {
      const updated = [...(prev.roi_benefits ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, roi_benefits: updated };
    });

  const removeBenefit = (index: number) =>
    update((prev) => ({
      ...prev,
      roi_benefits: (prev.roi_benefits ?? []).filter((_, i) => i !== index),
    }));

  const addBenefit = () =>
    update((prev) => ({
      ...prev,
      roi_benefits: [
        ...(prev.roi_benefits ?? []),
        { benefit: "", value: "", icon: "🎯" },
      ],
    }));

  const moveBenefit = (index: number, direction: "up" | "down") =>
    update((prev) => {
      const updated = [...(prev.roi_benefits ?? [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return { ...prev, roi_benefits: updated };
    });

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="fee"
        title="REGISTRATION FEE SECTION"
        description="Edit the registration fee, event details, and ROI breakdown section on the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* Fee & Labels */}
        <EditorCard title="FEE DETAILS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="The large fee amount shown prominently (e.g. ₹50)">
                Fee Amount
              </FieldLabel>
              <TextInput
                value={data.fee_amount ?? ""}
                onChange={(v) => setField("fee_amount", v)}
                placeholder="₹50"
              />
            </div>
            <div>
              <FieldLabel hint="Small label under the fee amount">
                Fee Label
              </FieldLabel>
              <TextInput
                value={data.fee_label ?? ""}
                onChange={(v) => setField("fee_label", v)}
                placeholder="ONE-TIME REGISTRATION FEE (NON-REFUNDABLE)"
              />
            </div>
          </div>
        </EditorCard>

        {/* Event Info */}
        <EditorCard title="EVENT DETAILS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="City or venue of the event">Location</FieldLabel>
              <TextInput
                value={data.location ?? ""}
                onChange={(v) => setField("location", v)}
                placeholder="Mumbai, India"
              />
            </div>
            <div>
              <FieldLabel hint="Duration of the hackathon">Duration</FieldLabel>
              <TextInput
                value={data.duration ?? ""}
                onChange={(v) => setField("duration", v)}
                placeholder="30 Hours of Non-Stop Hacking"
              />
            </div>
            <div>
              <FieldLabel hint="Round 1 mode description">Round 1 Mode</FieldLabel>
              <TextInput
                value={data.mode_r1 ?? ""}
                onChange={(v) => setField("mode_r1", v)}
                placeholder="Fully Online — participate from anywhere"
              />
            </div>
            <div>
              <FieldLabel hint="Round 2 mode description">Round 2 Mode</FieldLabel>
              <TextInput
                value={data.mode_r2 ?? ""}
                onChange={(v) => setField("mode_r2", v)}
                placeholder="Hybrid — in-person in Mumbai or online"
              />
            </div>
          </div>
        </EditorCard>

        {/* ROI Summary */}
        <EditorCard title="ROI SUMMARY">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Total value participants receive (shown in green)">
                Total ROI Value
              </FieldLabel>
              <TextInput
                value={data.roi_total ?? ""}
                onChange={(v) => setField("roi_total", v)}
                placeholder="₹90,000+"
              />
            </div>
            <div>
              <FieldLabel hint="Multiplier tagline (e.g. 900x ROI)">
                ROI Multiplier Text
              </FieldLabel>
              <TextInput
                value={data.roi_multiplier ?? ""}
                onChange={(v) => setField("roi_multiplier", v)}
                placeholder="900x ROI"
              />
            </div>
          </div>
        </EditorCard>

        {/* ROI Benefits List */}
        <EditorCard title="ROI BENEFITS LIST">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            Each benefit appears as a row in the middle column with an icon, description, and value.
          </p>

          <div className="space-y-4">
            {(data.roi_benefits ?? []).length === 0 && (
              <div className="border-2 border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No benefits yet. Add one below.
              </div>
            )}

            {(data.roi_benefits ?? []).map((benefit, i) => (
              <ArrayItem
                key={i}
                index={i}
                onRemove={() => removeBenefit(i)}
                onMoveUp={() => moveBenefit(i, "up")}
                onMoveDown={() => moveBenefit(i, "down")}
                isFirst={i === 0}
                isLast={i === (data.roi_benefits ?? []).length - 1}
              >
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <FieldLabel hint="Single emoji icon">Icon</FieldLabel>
                    <TextInput
                      value={benefit.icon}
                      onChange={(v) => updateBenefit(i, "icon", v)}
                      placeholder="🎓"
                    />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel>Benefit Description</FieldLabel>
                    <TextInput
                      value={benefit.benefit}
                      onChange={(v) => updateBenefit(i, "benefit", v)}
                      placeholder="Certificate of Participation"
                    />
                  </div>
                  <div className="col-span-1">
                    <FieldLabel hint="Value shown on the right (e.g. ₹5,000+ or Priceless)">
                      Value
                    </FieldLabel>
                    <TextInput
                      value={benefit.value}
                      onChange={(v) => updateBenefit(i, "value", v)}
                      placeholder="Priceless"
                    />
                  </div>
                </div>
              </ArrayItem>
            ))}
          </div>

          <AddItemButton onClick={addBenefit} label="ADD BENEFIT" />
        </EditorCard>

        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              The <strong className="text-foreground">Fee Amount</strong> (₹50)
              is displayed prominently in the left column in pink.
            </li>
            <li>
              ROI Benefits appear as a list in the center column. Use a single
              emoji for the icon field.
            </li>
            <li>
              The <strong className="text-foreground">Total ROI Value</strong> and{" "}
              <strong className="text-foreground">ROI Multiplier</strong> appear
              in the green summary box below the benefits list.
            </li>
            <li>
              The right column (policy text) is currently hardcoded. Contact
              your developer to update it.
            </li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default FeeEditor;
