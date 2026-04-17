import {
  useEditor,
  SaveBar,
  SectionHeader,
  EditorCard,
  FieldLabel,
  TextInput,
} from "@/components/admin/AdminEditorLayout";

type SettingsContent = {
  sponsor_email: string;
  general_email: string;
  partnerships_email: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  event_date: string;
  event_location: string;
  org_name: string;
  registration_fee: string;
  registration_open: boolean;
};

const SettingsEditor = () => {
  const { data, update, reset, save, saveState, dirty } =
    useEditor<SettingsContent>("settings");

  const setField = (field: keyof SettingsContent, value: string | boolean) =>
    update((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex flex-col min-h-full">
      <SaveBar onSave={save} onReset={reset} saveState={saveState} dirty={dirty} />

      <SectionHeader
        section="settings"
        title="GLOBAL SETTINGS"
        description="Configure site-wide settings — contact emails, social links, event details, and registration status."
      />

      <div className="p-4 md:p-6 space-y-6">

        {/* Registration Toggle */}
        <EditorCard title="REGISTRATION STATUS">
          <div className="flex items-center justify-between gap-4 p-2">
            <div>
              <p className="text-sm font-black uppercase tracking-wide">
                Registration Open
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle whether new registrations are accepted. When off, the Register button is still visible but submissions will not be processed.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {data.registration_open ? "OPEN" : "CLOSED"}
              </span>
              <div
                onClick={() => setField("registration_open", !data.registration_open)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  data.registration_open ? "bg-editorial-pink" : "bg-secondary border-2 border-border"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-background border border-border transition-transform shadow-sm ${
                    data.registration_open ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
          <div className={`mt-3 px-4 py-3 text-xs font-bold uppercase tracking-wider ${
            data.registration_open
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}>
            {data.registration_open
              ? "✓ REGISTRATIONS ARE CURRENTLY OPEN"
              : "✗ REGISTRATIONS ARE CURRENTLY CLOSED"}
          </div>
        </EditorCard>

        {/* Event Info */}
        <EditorCard title="EVENT INFORMATION">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="Year or date of the event (e.g. 2026 or March 2026)">
                Event Date / Year
              </FieldLabel>
              <TextInput
                value={data.event_date ?? ""}
                onChange={(v) => setField("event_date", v)}
                placeholder="2026"
              />
            </div>
            <div>
              <FieldLabel hint="City or venue of the event">
                Event Location
              </FieldLabel>
              <TextInput
                value={data.event_location ?? ""}
                onChange={(v) => setField("event_location", v)}
                placeholder="Mumbai, India"
              />
            </div>
            <div>
              <FieldLabel hint="Name of the organizing team or company">
                Organisation Name
              </FieldLabel>
              <TextInput
                value={data.org_name ?? ""}
                onChange={(v) => setField("org_name", v)}
                placeholder="Elite Forums"
              />
            </div>
            <div>
              <FieldLabel hint="Registration fee displayed across the site">
                Registration Fee
              </FieldLabel>
              <TextInput
                value={data.registration_fee ?? ""}
                onChange={(v) => setField("registration_fee", v)}
                placeholder="₹50"
              />
            </div>
          </div>
        </EditorCard>

        {/* Contact Emails */}
        <EditorCard title="CONTACT EMAIL ADDRESSES">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These email addresses are used in the Contact, Email Us, and Partner pages.
          </p>
          <div className="space-y-4">
            <div>
              <FieldLabel hint="Email for sponsorship inquiries — shown on the Contact and Sponsor Us pages">
                Sponsorship Email
              </FieldLabel>
              <TextInput
                value={data.sponsor_email ?? ""}
                onChange={(v) => setField("sponsor_email", v)}
                placeholder="sponsors@eliteforums.in"
              />
            </div>
            <div>
              <FieldLabel hint="General inquiries email — shown on the Contact page">
                General Inquiries Email
              </FieldLabel>
              <TextInput
                value={data.general_email ?? ""}
                onChange={(v) => setField("general_email", v)}
                placeholder="hello@eliteforums.in"
              />
            </div>
            <div>
              <FieldLabel hint="Email for partnership discussions — shown on the Partner page">
                Partnerships Email
              </FieldLabel>
              <TextInput
                value={data.partnerships_email ?? ""}
                onChange={(v) => setField("partnerships_email", v)}
                placeholder="partnerships@eliteforums.in"
              />
            </div>
          </div>
        </EditorCard>

        {/* Social Media */}
        <EditorCard title="SOCIAL MEDIA LINKS">
          <p className="text-xs text-muted-foreground -mt-2 mb-2">
            These links appear in the Footer and Contact page. Use full URLs (e.g. https://twitter.com/...).
            Enter <code className="bg-secondary px-1">#</code> to show a placeholder link.
          </p>
          <div className="space-y-4">
            <div>
              <FieldLabel hint="Your Twitter / X profile URL">
                Twitter / X
              </FieldLabel>
              <TextInput
                value={data.twitter_url ?? ""}
                onChange={(v) => setField("twitter_url", v)}
                placeholder="https://twitter.com/innovahack"
              />
            </div>
            <div>
              <FieldLabel hint="Your LinkedIn page URL">
                LinkedIn
              </FieldLabel>
              <TextInput
                value={data.linkedin_url ?? ""}
                onChange={(v) => setField("linkedin_url", v)}
                placeholder="https://linkedin.com/company/innovahack"
              />
            </div>
            <div>
              <FieldLabel hint="Your Instagram profile URL">
                Instagram
              </FieldLabel>
              <TextInput
                value={data.instagram_url ?? ""}
                onChange={(v) => setField("instagram_url", v)}
                placeholder="https://instagram.com/innovahack"
              />
            </div>
          </div>
        </EditorCard>

        {/* Preview card */}
        <EditorCard title="CURRENT CONFIGURATION PREVIEW">
          <div className="border-2 border-border divide-y divide-border text-sm">
            {[
              ["Registration", data.registration_open ? "OPEN" : "CLOSED"],
              ["Event Date", data.event_date],
              ["Location", data.event_location],
              ["Organisation", data.org_name],
              ["Fee", data.registration_fee],
              ["Sponsor Email", data.sponsor_email],
              ["General Email", data.general_email],
              ["Partnerships Email", data.partnerships_email],
              ["Twitter", data.twitter_url],
              ["LinkedIn", data.linkedin_url],
              ["Instagram", data.instagram_url],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-2.5 gap-4"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                  {label}
                </span>
                <span
                  className={`text-xs text-right break-all ${
                    label === "Registration"
                      ? value === "OPEN"
                        ? "text-green-400 font-bold"
                        : "text-red-400 font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </EditorCard>

        {/* Notes */}
        <EditorCard title="NOTES">
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              Settings are saved to Supabase and loaded globally on every page refresh.
            </li>
            <li>
              The <strong className="text-foreground">Registration Fee</strong> field
              here is for display purposes only — it does not affect payment processing.
            </li>
            <li>
              Social media links currently only appear in the{" "}
              <strong className="text-foreground">Footer</strong> and{" "}
              <strong className="text-foreground">Contact</strong> page. To add
              them elsewhere, update the respective components.
            </li>
            <li>
              The <strong className="text-foreground">Registration Open</strong> toggle
              requires front-end logic to be wired up in the Register page to
              enforce it. See the developer for implementation.
            </li>
          </ul>
        </EditorCard>

      </div>
    </div>
  );
};

export default SettingsEditor;
