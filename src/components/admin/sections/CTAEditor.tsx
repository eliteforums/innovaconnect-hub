import {
  useEditor,
  SaveBar,
  SectionHeader,
  EditorCard,
  FieldLabel,
  TextInput,
} from "@/components/admin/AdminEditorLayout";

type CTAContent = {
  eyebrow: string;
  headline_line1: string;
  headline_line2: string;
  description: string;
  cta_primary: string;
  cta_primary_url: string;
  cta_secondary: string;
  cta_secondary_url: string;
};

const CTAEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<CTAContent>("cta");

  const setField = (field: keyof CTAContent, value: string) =>
    update((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="cta"
        title="CTA SECTION"
        description="Edit the bottom Call-To-Action section shown at the end of the homepage."
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* Eyebrow */}
        <EditorCard title="EYEBROW TEXT">
          <div>
            <FieldLabel hint="Small uppercase text shown above the headline in pink (e.g. LIMITED SEATS • TOP 200–250 TEAMS)">
              Eyebrow / Tag Text
            </FieldLabel>
            <TextInput
              value={data.eyebrow ?? ""}
              onChange={(v) => setField("eyebrow", v)}
              placeholder="LIMITED SEATS • TOP 200–250 TEAMS"
            />
          </div>
        </EditorCard>

        {/* Headline */}
        <EditorCard title="HEADLINE">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            The headline is split across two lines. The second line is displayed
            in <span className="text-editorial-pink font-bold">pink</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="First line of the large headline">
                Headline Line 1
              </FieldLabel>
              <TextInput
                value={data.headline_line1 ?? ""}
                onChange={(v) => setField("headline_line1", v)}
                placeholder="READY TO"
              />
            </div>
            <div>
              <FieldLabel hint="Second line — shown in pink">
                Headline Line 2 (Pink)
              </FieldLabel>
              <TextInput
                value={data.headline_line2 ?? ""}
                onChange={(v) => setField("headline_line2", v)}
                placeholder="BUILD?"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-2 border border-border bg-secondary/20 px-5 py-4">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
              {data.eyebrow || "EYEBROW TEXT"}
            </p>
            <p className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">
              {data.headline_line1 || "READY TO"}
              <br />
              <span className="text-editorial-pink">
                {data.headline_line2 || "BUILD?"}
              </span>
            </p>
          </div>
        </EditorCard>

        {/* Description */}
        <EditorCard title="DESCRIPTION PARAGRAPH">
          <div>
            <FieldLabel hint="Supportive text shown below the headline">
              Description
            </FieldLabel>
            <textarea
              value={data.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="10,000 will apply. 100 will be chosen. Don't just watch from the sidelines..."
              rows={3}
              className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:border-editorial-pink transition-colors rounded-none resize-y"
            />
          </div>
        </EditorCard>

        {/* CTA Buttons */}
        <EditorCard title="CALL-TO-ACTION BUTTONS">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Primary button label (pink background)">
                CTA Primary Label (Pink Button)
              </FieldLabel>
              <TextInput
                value={data.cta_primary ?? ""}
                onChange={(v) => setField("cta_primary", v)}
                placeholder="APPLY NOW →"
              />
            </div>
            <div>
              <FieldLabel hint="Where the primary button should go. Use an internal path like /register, or a full URL like https://forms.gle/abc">
                CTA Primary URL / Link
              </FieldLabel>
              <TextInput
                value={data.cta_primary_url ?? ""}
                onChange={(v) => setField("cta_primary_url", v)}
                placeholder="/register"
              />
            </div>
            <div>
              <FieldLabel hint="Secondary button label (outlined)">
                CTA Secondary Label (Outlined Button)
              </FieldLabel>
              <TextInput
                value={data.cta_secondary ?? ""}
                onChange={(v) => setField("cta_secondary", v)}
                placeholder="PARTNER WITH US"
              />
            </div>
            <div>
              <FieldLabel hint="Where the secondary button should go. Use an internal path like /partner, or a full URL.">
                CTA Secondary URL / Link
              </FieldLabel>
              <TextInput
                value={data.cta_secondary_url ?? ""}
                onChange={(v) => setField("cta_secondary_url", v)}
                placeholder="/partner"
              />
            </div>
          </div>

          {/* Button preview */}
          <div className="mt-2 flex flex-wrap gap-3">
            <div className="bg-editorial-pink px-6 py-2.5 text-xs font-black uppercase tracking-wider text-background pointer-events-none">
              {data.cta_primary || "APPLY NOW →"}
            </div>
            <div className="border-2 border-foreground px-6 py-2.5 text-xs font-black uppercase tracking-wider pointer-events-none">
              {data.cta_secondary || "PARTNER WITH US"}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Current links — Primary:{" "}
            <code className="bg-secondary px-1">
              {data.cta_primary_url || "/register"}
            </code>
            , Secondary:{" "}
            <code className="bg-secondary px-1">
              {data.cta_secondary_url || "/partner"}
            </code>
          </p>
        </EditorCard>

        {/* Notes */}
        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              The CTA section appears at the very bottom of the homepage, just
              before the footer.
            </li>
            <li>
              Both button links are now fully editable. Use internal paths
              (e.g. <code className="bg-secondary px-1">/register</code>,{" "}
              <code className="bg-secondary px-1">/partner</code>) for pages
              inside this site, or a full URL (e.g.{" "}
              <code className="bg-secondary px-1">
                https://forms.gle/your-form
              </code>
              ) to send users to an external form. External links open in a new
              tab automatically.
            </li>
            <li>
              Use the live preview above to check how your headline looks before
              saving.
            </li>
          </ul>
        </EditorCard>
      </div>
    </div>
  );
};

export default CTAEditor;
