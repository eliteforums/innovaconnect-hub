import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const HiringPartners = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    industry_sector: "",
    company_website: "",
    contact_person_name: "",
    designation: "",
    work_email: "",
    phone_number: "",
    number_of_roles: "",
    roles_job_profiles: "",
    hiring_timeline: "",
    assured_hiring_commitment: "",
    additional_message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("partner_proposals").insert({
      company_name: form.company_name,
      industry_sector: form.industry_sector,
      company_website: form.company_website,
      contact_person_name: form.contact_person_name,
      designation: form.designation,
      work_email: form.work_email,
      phone_number: form.phone_number,
      number_of_roles: form.number_of_roles,
      roles_job_profiles: form.roles_job_profiles,
      hiring_timeline: form.hiring_timeline,
      assured_hiring_commitment: form.assured_hiring_commitment,
      additional_message: form.additional_message,
      proposal_type: "hiring_partner",
    });
    if (error) {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            to="/partner"
            className="text-sm font-black uppercase tracking-wider flex items-center gap-2"
          >
            <ArrowLeft size={16} /> BACK
          </Link>
          <span className="text-xl font-black uppercase tracking-tighter">
            INNOVA<span className="text-editorial-pink">HACK</span>
          </span>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">
            PROPOSAL
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
              PROPOSAL SUBMITTED!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Thank you! Our partnerships team will review your proposal and get
              back to you within 48 hours.
            </p>
            <Link
              to="/partner"
              className="inline-flex items-center gap-2 bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              BACK TO PARTNER PAGE
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          to="/partner"
          className="text-sm font-black uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft size={16} /> BACK
        </Link>
        <span className="text-xl font-black uppercase tracking-tighter">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </span>
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          PROPOSAL
        </span>
      </div>

      {/* Hero Banner */}
      <section className="border-b-2 border-foreground">
        <div className="px-4 md:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-10 bg-editorial-blue" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                PARTNERSHIP TYPE 01
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              HIRING
              <br />
              <span className="text-editorial-blue">PARTNERS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
              Join InnovaHack as a hiring partner and get direct access to
              India's top 1% pre-screened builders. No recruitment fees — just
              direct talent access.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-4 md:px-8 py-12 md:py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b border-border mb-10 pb-6">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SUBMIT YOUR PROPOSAL
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              HIRING PARTNER FORM
            </h2>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border-2 border-destructive bg-destructive/10 px-4 py-3 mb-8 text-sm text-destructive font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-6">
                01 — COMPANY INFORMATION
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Company Name <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.company_name}
                    onChange={(e) => update("company_name", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Industry / Sector{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.industry_sector}
                    onChange={(e) => update("industry_sector", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="e.g. FinTech, SaaS, E-commerce"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Company Website{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="url"
                    value={form.company_website}
                    onChange={(e) => update("company_website", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-6">
                02 — CONTACT DETAILS
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Contact Person Name{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.contact_person_name}
                    onChange={(e) =>
                      update("contact_person_name", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Designation <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.designation}
                    onChange={(e) => update("designation", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="e.g. HR Manager, CTO"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Work Email <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="email"
                    value={form.work_email}
                    onChange={(e) => update("work_email", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Phone Number <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => update("phone_number", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Hiring Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-6">
                03 — HIRING DETAILS
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Number of Roles to Fill{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.number_of_roles}
                    onChange={(e) => update("number_of_roles", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-blue"
                    placeholder="e.g. 5 software engineers, 2 designers"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Roles / Job Profiles{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Textarea
                    required
                    rows={3}
                    value={form.roles_job_profiles}
                    onChange={(e) =>
                      update("roles_job_profiles", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-blue resize-none"
                    placeholder="Describe the roles you're looking to hire for..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Hiring Timeline{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.hiring_timeline}
                    onChange={(e) => update("hiring_timeline", e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-blue"
                  >
                    <option value="">Select hiring timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="After the event">After the event</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Are you providing an assured hiring commitment?{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.assured_hiring_commitment}
                    onChange={(e) =>
                      update("assured_hiring_commitment", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-blue"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes – we commit to hiring">
                      Yes – we commit to hiring
                    </option>
                    <option value="We will try our best">
                      We will try our best
                    </option>
                    <option value="Just exploring">Just exploring</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Additional Message
                  </Label>
                  <Textarea
                    rows={3}
                    value={form.additional_message}
                    onChange={(e) =>
                      update("additional_message", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-blue resize-none"
                    placeholder="Any other information you'd like to share..."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-editorial-pink py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <span className="animate-pulse">SUBMITTING...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    SUBMIT HIRING PARTNER PROPOSAL
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Our partnerships team will review your proposal and respond
                within 48 hours.
              </p>
            </div>
          </form>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default HiringPartners;
