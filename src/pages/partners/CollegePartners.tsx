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

const CollegePartners = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    college_university_name: "",
    city: "",
    state: "",
    college_website: "",
    contact_person_name: "",
    designation: "",
    work_email: "",
    phone_number: "",
    estimated_student_participation: "",
    technical_coding_club: "",
    club_society_name: "",
    how_will_you_promote: "",
    additional_message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("partner_proposals").insert({
      college_university_name: form.college_university_name,
      city: form.city,
      state: form.state,
      college_website: form.college_website,
      contact_person_name: form.contact_person_name,
      designation: form.designation,
      work_email: form.work_email,
      phone_number: form.phone_number,
      estimated_student_participation: form.estimated_student_participation,
      technical_coding_club: form.technical_coding_club,
      club_society_name: form.club_society_name,
      how_will_you_promote: form.how_will_you_promote,
      additional_message: form.additional_message,
      proposal_type: "college_partner",
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
                PARTNERSHIP TYPE 05
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              COLLEGE
              <br />
              <span className="text-editorial-green">PARTNERS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
              Partner with InnovaHack and drive participation from your campus.
              Top 3 colleges get cash sponsorship for their next event and
              featured placement on our website.
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
          {/* Rewards Banner */}
          <div className="border-2 border-foreground p-6 md:p-8 mb-10">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-5">
              🏆 TOP COLLEGE REWARDS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-yellow-500 bg-yellow-500/10 p-5">
                <p className="text-base font-black uppercase tracking-tight mb-1">
                  🥇 1st Place
                </p>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  1,000+ Applications
                </p>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  ₹20,000 for your next event + website highlight
                </p>
              </div>
              <div className="border-2 border-gray-400 bg-gray-300/10 p-5">
                <p className="text-base font-black uppercase tracking-tight mb-1">
                  🥈 2nd Place
                </p>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  825+ Applications
                </p>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  ₹15,000 for your next event + website highlight
                </p>
              </div>
              <div className="border-2 border-orange-400 bg-orange-500/10 p-5">
                <p className="text-base font-black uppercase tracking-tight mb-1">
                  🥉 3rd Place
                </p>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  650+ Applications
                </p>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  ₹10,000 for your next event + website highlight
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border mb-10 pb-6">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SUBMIT YOUR PROPOSAL
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              COLLEGE PARTNER FORM
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
            {/* College Information */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-6">
                01 — COLLEGE INFORMATION
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    College / University Name{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.college_university_name}
                    onChange={(e) =>
                      update("college_university_name", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="Full name of your college or university"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    City <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    State <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    College Website
                  </Label>
                  <Input
                    type="url"
                    value={form.college_website}
                    onChange={(e) => update("college_website", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="https://yourcollege.edu.in"
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
                    placeholder="Faculty coordinator or student representative"
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
                    placeholder="e.g. Professor, Student Council President"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Work / College Email{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="email"
                    value={form.work_email}
                    onChange={(e) => update("work_email", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-green"
                    placeholder="you@college.edu.in"
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

            {/* Participation Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-6">
                03 — PARTICIPATION DETAILS
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Estimated Student Participation{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.estimated_student_participation}
                    onChange={(e) =>
                      update("estimated_student_participation", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-green"
                  >
                    <option value="">Select estimated participation</option>
                    <option value="Under 50">Under 50</option>
                    <option value="50–100">50–100</option>
                    <option value="100–250">100–250</option>
                    <option value="250–500">250–500</option>
                    <option value="500–1000">500–1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Do you have a Technical / Coding Club?{" "}
                      <span className="text-editorial-pink">*</span>
                    </Label>
                    <select
                      required
                      value={form.technical_coding_club}
                      onChange={(e) =>
                        update("technical_coding_club", e.target.value)
                      }
                      className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-green"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Club / Society Name
                    </Label>
                    <Input
                      value={form.club_society_name}
                      onChange={(e) =>
                        update("club_society_name", e.target.value)
                      }
                      className="bg-secondary border-border focus:border-editorial-green"
                      placeholder="e.g. CodeChef Chapter, GDG Campus, ACM Club"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    How will you promote InnovaHack?{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Textarea
                    required
                    rows={3}
                    value={form.how_will_you_promote}
                    onChange={(e) =>
                      update("how_will_you_promote", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-green resize-none"
                    placeholder="e.g. Email blasts, notice boards, social media posts, classroom announcements..."
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
                    SUBMIT COLLEGE PARTNER PROPOSAL
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

export default CollegePartners;
