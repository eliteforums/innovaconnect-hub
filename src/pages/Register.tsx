import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Upload, X, User } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import {
  submitRegistration,
  uploadResume,
  validateRefCode,
  checkRateLimit,
} from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberDetails = {
  full_name: string;
  email: string;
  contact_no: string;
  city: string;
  organisation_name: string;
  year_or_experience: string;
  branch_or_department: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
};

type TeamType = "solo" | "duo" | "trio" | "quad";

type FormData = {
  // Personal
  full_name: string;
  email: string;
  contact_no: string;
  city: string;
  resume_file: File | null;
  // Academic
  organisation_name: string;
  year_or_experience: string;
  branch_or_department: string;
  // Skills
  skills: string[];
  github_url: string;
  linkedin_url: string;
  // Team
  team_type: TeamType;
  team_members: MemberDetails[];
  // Consent
  consent: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ["PERSONAL", "ACADEMIC", "SKILLS", "TEAM", "CONFIRM"];

const TEAM_SIZE: Record<TeamType, number> = {
  solo: 1,
  duo: 2,
  trio: 3,
  quad: 4,
};

const emptyMember = (): MemberDetails => ({
  full_name: "",
  email: "",
  contact_no: "",
  city: "",
  organisation_name: "",
  year_or_experience: "",
  branch_or_department: "",
  skills: [],
  github_url: "",
  linkedin_url: "",
});

// ─── Skill Selector ───────────────────────────────────────────────────────────

const SkillSelector = memo(
  ({
    selected,
    onChange,
    skills,
  }: {
    selected: string[];
    onChange: (skills: string[]) => void;
    skills: string[];
  }) => {
    const toggle = (skill: string) => {
      onChange(
        selected.includes(skill)
          ? selected.filter((s) => s !== skill)
          : [...selected, skill],
      );
    };

    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggle(skill)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              selected.includes(skill)
                ? "border-editorial-pink bg-editorial-pink/20 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>
    );
  },
);
SkillSelector.displayName = "SkillSelector";

// ─── Member Detail Form ───────────────────────────────────────────────────────

const MemberForm = memo(
  ({
    index,
    member,
    onChange,
    skills,
  }: {
    index: number;
    member: MemberDetails;
    onChange: (updated: MemberDetails) => void;
    skills: string[];
  }) => {
    const upd = (field: keyof MemberDetails, value: string | string[]) =>
      onChange({ ...member, [field]: value });

    return (
      <div className="border-2 border-border p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-editorial-pink flex items-center justify-center">
            <User size={14} className="text-background" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest">
            MEMBER {index + 2} DETAILS
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              Full Name *
            </Label>
            <Input
              value={member.full_name}
              onChange={(e) => upd("full_name", e.target.value)}
              placeholder="Full name"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              Email ID *
            </Label>
            <Input
              type="email"
              value={member.email}
              onChange={(e) => upd("email", e.target.value)}
              placeholder="member@email.com"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              Contact No *
            </Label>
            <Input
              value={member.contact_no}
              onChange={(e) => upd("contact_no", e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              City of Living *
            </Label>
            <Input
              value={member.city}
              onChange={(e) => upd("city", e.target.value)}
              placeholder="e.g. Mumbai"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              Organisation Name *
            </Label>
            <Input
              value={member.organisation_name}
              onChange={(e) => upd("organisation_name", e.target.value)}
              placeholder="College or company"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              Year / Experience *
            </Label>
            <Input
              value={member.year_or_experience}
              onChange={(e) => upd("year_or_experience", e.target.value)}
              placeholder="e.g. 3rd Year or 2 years exp"
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-widest">
              Branch / Department *
            </Label>
            <Input
              value={member.branch_or_department}
              onChange={(e) => upd("branch_or_department", e.target.value)}
              placeholder="e.g. Computer Science"
              className="mt-1 bg-secondary border-border"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold uppercase tracking-widest mb-3 block">
            Skills
          </Label>
          <SkillSelector
            selected={member.skills}
            onChange={(s) => upd("skills", s)}
            skills={skills}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              GitHub URL
            </Label>
            <Input
              value={member.github_url}
              onChange={(e) => upd("github_url", e.target.value)}
              placeholder="https://github.com/..."
              className="mt-1 bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest">
              LinkedIn URL
            </Label>
            <Input
              value={member.linkedin_url}
              onChange={(e) => upd("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="mt-1 bg-secondary border-border"
            />
          </div>
        </div>
      </div>
    );
  },
);
MemberForm.displayName = "MemberForm";

// ─── Main Register Component ──────────────────────────────────────────────────

const Register = () => {
  const { getSection } = useContent();
  const skillsContent = getSection<{ skills: string[] }>("skills_list");
  const SKILLS = skillsContent.skills ?? [];

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchParams] = useSearchParams();
  const refCodeParam = searchParams.get("ref") || "";
  const [refCode, setRefCode] = useState<string>("");
  const [refCodeValid, setRefCodeValid] = useState<boolean | null>(null);
  // null = not checked yet, true = valid, false = invalid

  // Validate ref code on mount if one is present
  useEffect(() => {
    if (!refCodeParam) return;
    validateRefCode(refCodeParam).then((valid) => {
      setRefCode(valid ? refCodeParam.toLowerCase().trim() : "");
      setRefCodeValid(valid);
    });
  }, [refCodeParam]);

  const [form, setForm] = useState<FormData>({
    full_name: "",
    email: "",
    contact_no: "",
    city: "",
    resume_file: null,
    organisation_name: "",
    year_or_experience: "",
    branch_or_department: "",
    skills: [],
    github_url: "",
    linkedin_url: "",
    team_type: "solo",
    team_members: [],
    consent: false,
  });

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSkillsChange = useCallback(
    (s: string[]) => update("skills", s),
    [],
  );

  const handleTeamTypeChange = (type: TeamType) => {
    const count = TEAM_SIZE[type] - 1; // extra members beyond leader
    const current = form.team_members;
    const members =
      count <= 0
        ? []
        : count > current.length
          ? [
              ...current,
              ...Array(count - current.length)
                .fill(null)
                .map(() => emptyMember()),
            ]
          : current.slice(0, count);
    setForm((prev) => ({ ...prev, team_type: type, team_members: members }));
  };

  const updateMember = (index: number, updated: MemberDetails) => {
    setForm((prev) => {
      const members = [...prev.team_members];
      members[index] = updated;
      return { ...prev, team_members: members };
    });
  };

  const next = () => step < STEPS.length - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  const handleSubmit = async () => {
    // Rate limit: prevent resubmission within 30 seconds
    if (!checkRateLimit(`register:${form.email}`, 30_000)) {
      setSubmitError("Please wait before submitting again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // 1. Submit registration (without resume URL first)
      const { data: regData, error: regError } = await submitRegistration({
        full_name: form.full_name,
        email: form.email,
        contact_no: form.contact_no,
        city: form.city,
        organisation_name: form.organisation_name,
        year_or_experience: form.year_or_experience,
        branch_or_department: form.branch_or_department,
        skills: form.skills,
        github_url: form.github_url,
        linkedin_url: form.linkedin_url,
        team_type: form.team_type,
        team_members: form.team_members,
        consent: form.consent,
        status: "pending",
        ref_code: refCode || undefined,
        referral_source: refCodeParam || undefined,
      });

      if (regError) {
        setSubmitError(
          regError.message ?? "Failed to submit. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Upload resume if provided
      if (form.resume_file && regData?.id) {
        await uploadResume(form.resume_file, regData.id);
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submitted State ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm font-black uppercase tracking-wider flex items-center gap-2"
          >
            <ArrowLeft size={16} /> HOME
          </Link>
          <span className="text-xl font-black uppercase tracking-tighter">
            INNOVA<span className="text-editorial-pink">HACK</span>
          </span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">
            REGISTRATION
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-editorial-pink flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-background" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3">
              APPLICATION SUBMITTED!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Thank you,{" "}
              <strong className="text-foreground">{form.full_name}</strong>!
              Your application has been received. We'll review it and get back
              to you at{" "}
              <strong className="text-foreground">{form.email}</strong>.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              BACK TO HOME
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-sm font-black uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft size={16} /> BACK
        </Link>
        <span className="text-xl font-black uppercase tracking-tighter">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </span>
        <span className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          REGISTRATION
          {refCodeParam && refCodeValid === true && (
            <span className="text-[10px] font-bold bg-editorial-green/20 text-editorial-green px-2 py-0.5 tracking-wider">
              REFERRED
            </span>
          )}
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
              <span className="sm:hidden">
                {String(i + 1).padStart(2, "0")}
              </span>
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
            {/* ── STEP 0: Personal Details ─────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  PERSONAL DETAILS
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell us who you are.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Full Name *
                    </Label>
                    <Input
                      value={form.full_name}
                      onChange={(e) => update("full_name", e.target.value)}
                      placeholder="Your full name"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Email ID *
                    </Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.com"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Contact No *
                    </Label>
                    <Input
                      value={form.contact_no}
                      onChange={(e) => update("contact_no", e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      City of Living *
                    </Label>
                    <Input
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="e.g. Mumbai, Bangalore, Delhi"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-2 block">
                      Resume Upload
                    </Label>
                    <div
                      className={`border-2 border-dashed transition-colors cursor-pointer ${
                        form.resume_file
                          ? "border-editorial-pink bg-editorial-pink/5"
                          : "border-border hover:border-foreground"
                      } p-6 flex flex-col items-center justify-center gap-2`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {form.resume_file ? (
                        <>
                          <Check size={24} className="text-editorial-pink" />
                          <p className="text-sm font-bold text-foreground">
                            {form.resume_file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(form.resume_file.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              update("resume_file", null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <X size={12} /> Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-muted-foreground" />
                          <p className="text-sm font-bold uppercase tracking-wider">
                            CLICK TO UPLOAD RESUME
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX — Max 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) update("resume_file", file);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Academic Info ────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  ACADEMIC INFO
                </h2>
                <p className="text-sm text-muted-foreground">
                  Where do you study or work?
                </p>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Organisation Name *
                    </Label>
                    <Input
                      value={form.organisation_name}
                      onChange={(e) =>
                        update("organisation_name", e.target.value)
                      }
                      placeholder="Your college or company name"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Year / Experience *
                    </Label>
                    <Input
                      value={form.year_or_experience}
                      onChange={(e) =>
                        update("year_or_experience", e.target.value)
                      }
                      placeholder="e.g. 3rd Year or 2 years experience"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest">
                      Branch / Department *
                    </Label>
                    <Input
                      value={form.branch_or_department}
                      onChange={(e) =>
                        update("branch_or_department", e.target.value)
                      }
                      placeholder="e.g. Computer Science, Electronics, MBA"
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Skills & Links ───────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  SKILLS & LINKS
                </h2>
                <p className="text-sm text-muted-foreground">
                  What can you build with?
                </p>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest mb-3 block">
                    Skills (select all that apply)
                  </Label>
                  <SkillSelector
                    selected={form.skills}
                    onChange={handleSkillsChange}
                    skills={SKILLS}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    GitHub URL
                  </Label>
                  <Input
                    value={form.github_url}
                    onChange={(e) => update("github_url", e.target.value)}
                    placeholder="https://github.com/you"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    LinkedIn URL
                  </Label>
                  <Input
                    value={form.linkedin_url}
                    onChange={(e) => update("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/you"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: Team ─────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  TEAM TYPE
                </h2>
                <p className="text-sm text-muted-foreground">
                  How do you want to participate? After selecting your team
                  size, fill in each member's details below.
                </p>

                {/* Team type selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["solo", "duo", "trio", "quad"] as TeamType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTeamTypeChange(type)}
                        className={`border-2 p-4 text-center uppercase font-black text-sm tracking-wider transition-all ${
                          form.team_type === type
                            ? "border-editorial-pink bg-editorial-pink/10"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {type}
                        <span className="block text-xs font-normal text-muted-foreground mt-1">
                          {TEAM_SIZE[type]}{" "}
                          {TEAM_SIZE[type] === 1 ? "person" : "people"}
                        </span>
                      </button>
                    ),
                  )}
                </div>

                {/* Member detail forms */}
                {form.team_type !== "solo" && form.team_members.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t-2 border-foreground pt-6">
                      <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-4">
                        FILL IN YOUR TEAM MEMBERS' DETAILS
                      </p>
                      <div className="space-y-6">
                        {form.team_members.map((member, i) => (
                          <MemberForm
                            key={i}
                            index={i}
                            member={member}
                            onChange={(updated) => updateMember(i, updated)}
                            skills={SKILLS}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: Confirm ──────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  CONFIRM
                </h2>
                {refCodeParam && (
                  <div
                    className={`border-2 px-4 py-3 flex items-center gap-3 ${
                      refCodeValid === true
                        ? "border-editorial-green bg-editorial-green/10"
                        : refCodeValid === false
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-secondary/30"
                    }`}
                  >
                    <span className="text-lg">
                      {refCodeValid === true
                        ? "✅"
                        : refCodeValid === false
                          ? "❌"
                          : "⏳"}
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">
                        {refCodeValid === true
                          ? "REFERRED BY COMMUNITY PARTNER"
                          : refCodeValid === false
                            ? "INVALID REFERRAL CODE"
                            : "VALIDATING REFERRAL CODE..."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {refCodeValid === true
                          ? `Code: ${refCodeParam} — This registration will be tracked under the community partner.`
                          : refCodeValid === false
                            ? `Code "${refCodeParam}" is not a valid or active community partner code.`
                            : "Checking referral code validity..."}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Review your details and submit. Every participant receives a{" "}
                  <strong className="text-foreground">
                    Certificate of Participation
                  </strong>{" "}
                  and{" "}
                  <strong className="text-foreground">
                    access to workshops &amp; mentorship
                  </strong>{" "}
                  in exchange for the ₹100 registration fee.
                </p>

                {/* Leader summary */}
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    YOUR DETAILS
                  </p>
                  <div className="border-2 border-foreground divide-y divide-border">
                    {[
                      ["FULL NAME", form.full_name],
                      ["EMAIL ID", form.email],
                      ["CONTACT NO", form.contact_no],
                      ["CITY", form.city],
                      [
                        "RESUME",
                        form.resume_file
                          ? form.resume_file.name
                          : "Not uploaded",
                      ],
                      ["ORGANISATION", form.organisation_name],
                      ["YEAR / EXPERIENCE", form.year_or_experience],
                      ["BRANCH / DEPARTMENT", form.branch_or_department],
                      ["SKILLS", form.skills.join(", ") || "—"],
                      ["GITHUB", form.github_url || "—"],
                      ["LINKEDIN", form.linkedin_url || "—"],
                      ["TEAM TYPE", form.team_type.toUpperCase()],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between px-4 py-3 gap-4"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                          {label}
                        </span>
                        <span className="text-sm font-medium text-right max-w-[60%] break-words">
                          {value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team members summary */}
                {form.team_members.length > 0 && (
                  <div className="space-y-3">
                    {form.team_members.map((m, i) => (
                      <div key={i}>
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-2">
                          MEMBER {i + 2} DETAILS
                        </p>
                        <div className="border-2 border-border divide-y divide-border">
                          {[
                            ["FULL NAME", m.full_name],
                            ["EMAIL", m.email],
                            ["CONTACT NO", m.contact_no],
                            ["CITY", m.city],
                            ["ORGANISATION", m.organisation_name],
                            ["YEAR / EXP", m.year_or_experience],
                            ["BRANCH", m.branch_or_department],
                            ["SKILLS", m.skills.join(", ") || "—"],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="flex justify-between px-4 py-2 gap-4"
                            >
                              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                                {label}
                              </span>
                              <span className="text-xs font-medium text-right max-w-[60%] break-words">
                                {value || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {submitError && (
                  <div className="border-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {submitError}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={form.consent}
                    onCheckedChange={(checked) => update("consent", !!checked)}
                    id="consent"
                  />
                  <label
                    htmlFor="consent"
                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    I consent to sharing my profile data with InnovaHack sponsor
                    companies for hiring and partnership opportunities.
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
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
              disabled={!form.consent || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider bg-editorial-pink disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                "SUBMITTING..."
              ) : (
                <>
                  SUBMIT APPLICATION <Check size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
