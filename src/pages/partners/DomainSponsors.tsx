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

const DomainSponsors = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    company_website: "",
    contact_person_name: "",
    designation: "",
    work_email: "",
    phone_number: "",
    preferred_domain_track: "",
    sponsorship_budget: "",
    custom_challenge: "",
    custom_challenge_description: "",
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
      proposal_type: "domain_sponsor",
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
              <div className="w-3 h-10 bg-editorial-purple" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                PARTNERSHIP TYPE 04
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              DOMAIN
              <br />
              <span className="text-editorial-purple">SPONSORS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
              Exclusively brand a hackathon domain track aligned with your
              industry. Get direct access to participants building in your domain
              and set custom challenges.
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
              DOMAIN SPONSOR FORM
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
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-purple mb-6">
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
                    className="bg-secondary border-border focus:border-editorial-purple"
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Industry <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.industry}
                    onChange={(e) => update("industry", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-purple"
                    placeholder="e.g. AI/ML, FinTech, Healthcare, Blockchain"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Company Website <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="url"
                    value={form.company_website}
                    onChange={(e) => update("company_website", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-purple"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-purple mb-6">
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
                    className="bg-secondary border-border focus:border-editorial-purple"
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
                    className="bg-secondary border-border focus:border-editorial-purple"
                    placeholder="e.g. CMO, Head of Partnerships"
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
                    className="bg-secondary border-border focus:border-editorial-purple"
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
                    className="bg-secondary border-border focus:border-editorial-purple"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Sponsorship Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-purple mb-6">
                03 — SPONSORSHIP DETAILS
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Preferred Domain Track{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.preferred_domain_track}
                    onChange={(e) =>
                      update("preferred_domain_track", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-purple"
                  >
                    <option value="">Select a track</option>
                    <option value="Generative AI Track">
                      Generative AI Track
                    </option>
                    <option value="FinTech Track">FinTech Track</option>
                    <option value="HealthTech Track">HealthTech Track</option>
                    <option value="Blockchain Track">Blockchain Track</option>
                    <option value="Startup Track - Open Innovation">
                      Startup Track — Open Innovation
                    </option>
                    <option value="Open to Suggestions">
                      Open to Suggestions
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Sponsorship Budget{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.sponsorship_budget}
                    onChange={(e) =>
                      update("sponsorship_budget", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-purple"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under ₹50,000">Under ₹50,000</option>
                    <option value="₹50,000 – ₹1,00,000">
                      ₹50,000 – ₹1,00,000
                    </option>
                    <option value="₹1,00,000 – ₹2,50,000">
                      ₹1,00,000 – ₹2,50,000
                    </option>
                    <option value="₹2,50,000+">₹2,50,000+</option>
                    <option value="Custom / Let's Discuss">
                      Custom / Let's Discuss
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Do you want to set a custom challenge?{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.custom_challenge}
                    onChange={(e) =>
                      update("custom_challenge", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-purple"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Maybe - tell me more">
                      Maybe — tell me more
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Custom Challenge Description
                  </Label>
                  <Textarea
                    rows={3}
                    value={form.custom_challenge_description}
                    onChange={(e) =>
                      update("custom_challenge_description", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-purple resize-none"
                    placeholder="Describe the problem statement or challenge you'd like participants to solve..."
                  />
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
                    className="bg-secondary border-border focus:border-editorial-purple resize-none"
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
                    SUBMIT DOMAIN SPONSOR PROPOSAL
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

export default DomainSponsors;
