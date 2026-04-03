import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const SKILLS = [
  "React", "Node.js", "Python", "Machine Learning", "Blockchain",
  "Flutter", "AWS", "Figma", "Rust", "Go", "TypeScript", "Solidity",
  "TensorFlow", "Docker", "Kubernetes", "Swift", "Kotlin", "Java",
];

const STEPS = [
  "PERSONAL",
  "ACADEMIC",
  "SKILLS",
  "TEAM",
  "CONFIRM",
];

type FormData = {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  skills: string[];
  github: string;
  linkedin: string;
  teamType: "solo" | "duo" | "trio" | "quad";
  teamMembers: string;
  consent: boolean;
};

const Register = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    skills: [],
    github: "",
    linkedin: "",
    teamType: "solo",
    teamMembers: "",
    consent: false,
  });

  const update = (field: keyof FormData, value: string | string[] | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const next = () => step < STEPS.length - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
          <ArrowLeft size={16} /> BACK
        </Link>
        <span className="text-xl font-black uppercase tracking-tighter">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </span>
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          REGISTRATION
        </span>
      </div>

      {/* Progress bar */}
      <div className="border-b border-border">
        <div className="flex">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 py-3 text-center text-xs font-bold tracking-widest uppercase border-r border-border last:border-r-0 transition-colors ${
                i === step
                  ? "bg-editorial-pink text-background"
                  : i < step
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="hidden sm:inline">{s}</span>
              <span className="sm:hidden">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  PERSONAL DETAILS
                </h2>
                <p className="text-sm text-muted-foreground">Tell us who you are.</p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your full name"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.com"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  ACADEMIC INFO
                </h2>
                <p className="text-sm text-muted-foreground">Where do you study or work?</p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">College / Company</Label>
                    <Input
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      placeholder="Your institution or company name"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">Year / Experience</Label>
                    <Input
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                      placeholder="e.g. 3rd Year, 2 years experience"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  SKILLS & LINKS
                </h2>
                <p className="text-sm text-muted-foreground">What can you build with?</p>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest mb-3 block">
                    Skills (select all that apply)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                          form.skills.includes(skill)
                            ? "border-editorial-pink bg-editorial-pink/20 text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">GitHub URL</Label>
                  <Input
                    value={form.github}
                    onChange={(e) => update("github", e.target.value)}
                    placeholder="https://github.com/you"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">LinkedIn URL</Label>
                  <Input
                    value={form.linkedin}
                    onChange={(e) => update("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/you"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  TEAM TYPE
                </h2>
                <p className="text-sm text-muted-foreground">How do you want to participate?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["solo", "duo", "trio", "quad"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => update("teamType", type)}
                      className={`border-2 p-4 text-center uppercase font-black text-sm tracking-wider transition-all ${
                        form.teamType === type
                          ? "border-editorial-pink bg-editorial-pink/10"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {type}
                      <span className="block text-xs font-normal text-muted-foreground mt-1">
                        {type === "solo" ? "1 person" : type === "duo" ? "2 people" : type === "trio" ? "3 people" : "4 people"}
                      </span>
                    </button>
                  ))}
                </div>
                {form.teamType !== "solo" && (
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Team Member Emails (comma-separated)
                    </Label>
                    <Input
                      value={form.teamMembers}
                      onChange={(e) => update("teamMembers", e.target.value)}
                      placeholder="member1@email.com, member2@email.com"
                      className="mt-1 bg-secondary border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Or leave blank for random team allocation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  CONFIRM
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review your details and submit. Every participant receives a <strong className="text-foreground">Certificate of Participation</strong> and <strong className="text-foreground">access to workshops &amp; mentorship</strong> in exchange for the ₹100 registration fee.
                </p>

                <div className="border-2 border-foreground divide-y divide-border">
                  {[
                    ["NAME", form.name],
                    ["EMAIL", form.email],
                    ["PHONE", form.phone],
                    ["COLLEGE/COMPANY", form.college],
                    ["YEAR/EXP", form.year],
                    ["SKILLS", form.skills.join(", ")],
                    ["GITHUB", form.github],
                    ["LINKEDIN", form.linkedin],
                    ["TEAM TYPE", form.teamType.toUpperCase()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-right max-w-[60%] truncate">
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={form.consent}
                    onCheckedChange={(checked) => update("consent", !!checked)}
                    id="consent"
                  />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
                    I consent to sharing my profile data with InnovaHack sponsor
                    companies for hiring and partnership opportunities.
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-10">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-2 border-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-all"
          >
            <ArrowLeft size={14} /> BACK
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider bg-editorial-pink hover:opacity-90 transition-opacity"
            >
              NEXT <ArrowRight size={14} />
            </button>
          ) : (
            <button
              disabled={!form.consent}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider bg-editorial-pink disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              onClick={() => alert("Application submitted! (Backend not connected yet)")}
            >
              SUBMIT APPLICATION <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
