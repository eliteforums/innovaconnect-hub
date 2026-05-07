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

const EducationPartners = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    organisation_name: "",
    type_of_organisation: "",
    website: "",
    contact_person_name: "",
    designation: "",
    work_email: "",
    phone_number: "",
    what_are_you_offering: "",
    number_of_beneficiaries: "",
    collaboration_type: "",
    additional_message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("partner_proposals").insert({
      ...form,
      proposal_type: "education_partner",
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
              <div className="w-3 h-10 bg-editorial-green" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                PARTNERSHIP TYPE 03
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              EDUCATION
              <br />
              <span className="text-editorial-green">PARTNERS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
              Offer your courses, certifications, and scholarships to 10,000+
              ambitious students and professionals. Build brand recall among
              India's next generation of builders.
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
              EDUCATION PARTNER FORM
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
            {/* Organisation Information */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-6">
                01 — ORGANISATION INFORMATION
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Organisation Name{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.organisation_name}
                    onChange={(e) => update("organisation_name", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="Your organisation name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Type of Organisation{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.type_of_organisation}
                    onChange={(e) =>
                      update("type_of_organisation", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-green"
                  >
                    <option value="">Select type</option>
                    <option value="EdTech Platform">EdTech Platform</option>
                    <option value="University / College">
                      University / College
                    </option>
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Certification Body">Certification Body</option>
                    <option value="Online Course Provider">
                      Online Course Provider
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Website <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="https://yourorganisation.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-6">
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
                    className="bg-secondary border-border focus:border-editorial-green"
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
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="e.g. Partnerships Manager, Head of Growth"
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
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="you@organisation.com"
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
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Partnership Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-6">
                03 — PARTNERSHIP DETAILS
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    What are you offering?{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Textarea
                    required
                    rows={3}
                    value={form.what_are_you_offering}
                    onChange={(e) =>
                      update("what_are_you_offering", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-green resize-none"
                    placeholder="e.g. Free 3-month subscription, discount codes, certifications for winners..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Number of Beneficiaries{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.number_of_beneficiaries}
                    onChange={(e) =>
                      update("number_of_beneficiaries", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="e.g. All 10,000 applicants / Top 100 finalists"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Collaboration Type{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.collaboration_type}
                    onChange={(e) =>
                      update("collaboration_type", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-green"
                  >
                    <option value="">Select collaboration type</option>
                    <option value="Free courses/resources">
                      Free courses / resources
                    </option>
                    <option value="Discounted access">Discounted access</option>
                    <option value="Workshop/Webinar">Workshop / Webinar</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Co-branded content">Co-branded content</option>
                    <option value="Other">Other</option>
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
                    className="bg-secondary border-border focus:border-editorial-green resize-none"
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
                  <span className="animate-pulse">SUBMITTING...</span>
                ) : (
                  <>
                    <Send size={16} />
                    SUBMIT EDUCATION PARTNER PROPOSAL
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

export default EducationPartners;
