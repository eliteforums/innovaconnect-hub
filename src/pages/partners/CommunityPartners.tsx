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

const CommunityPartners = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    community_name: "",
    community_platform: "",
    community_website: "",
    contact_person_name: "",
    role_in_community: "",
    email: "",
    phone_number: "",
    community_size: "",
    community_focus: "",
    promotion_plan: "",
    open_to_sponsorship_outreach: "",
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
      proposal_type: "community_partner",
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
              <div className="w-3 h-10 bg-editorial-orange" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                PARTNERSHIP TYPE 06
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              COMMUNITY
              <br />
              <span className="text-editorial-orange">PARTNERS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
              Drive participation from your community and earn exclusive rewards.
              Top communities get event invites, mementos, techy gifts, and
              special mentions.
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
              🏆 TOP COMMUNITY REWARDS
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
                  Event invite + Memento &amp; Felicitation + Techy Gifts +
                  Special Mention
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
                  Event invite + Memento + Swags + Special Mention
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
                  Event invite + Memento + Special Mention
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border mb-10 pb-6">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SUBMIT YOUR PROPOSAL
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              COMMUNITY PARTNER FORM
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
            {/* Community Information */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-orange mb-6">
                01 — COMMUNITY INFORMATION
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Community Name{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.community_name}
                    onChange={(e) => update("community_name", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="Your community name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Community Platform{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <select
                    required
                    value={form.community_platform}
                    onChange={(e) =>
                      update("community_platform", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-orange"
                  >
                    <option value="">Select primary platform</option>
                    <option value="Discord">Discord</option>
                    <option value="Slack">Slack</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="LinkedIn Group">LinkedIn Group</option>
                    <option value="Facebook Group">Facebook Group</option>
                    <option value="Twitter/X">Twitter / X</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Multiple Platforms">Multiple Platforms</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Community Website / Link{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="url"
                    value={form.community_website}
                    onChange={(e) =>
                      update("community_website", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="Discord invite / LinkedIn group / website"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-orange mb-6">
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
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Role in Community{" "}
                    <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    value={form.role_in_community}
                    onChange={(e) =>
                      update("role_in_community", e.target.value)
                    }
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="e.g. Admin, Moderator, Founder"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Email <span className="text-editorial-pink">*</span>
                  </Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="you@email.com"
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
                    className="bg-secondary border-border focus:border-editorial-orange"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Community Details */}
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-orange mb-6">
                03 — COMMUNITY DETAILS
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Community Size{" "}
                      <span className="text-editorial-pink">*</span>
                    </Label>
                    <select
                      required
                      value={form.community_size}
                      onChange={(e) =>
                        update("community_size", e.target.value)
                      }
                      className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-orange"
                    >
                      <option value="">Select community size</option>
                      <option value="Under 500">Under 500</option>
                      <option value="500–2,000">500–2,000</option>
                      <option value="2,000–10,000">2,000–10,000</option>
                      <option value="10,000–50,000">10,000–50,000</option>
                      <option value="50,000+">50,000+</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Community Focus{" "}
                      <span className="text-editorial-pink">*</span>
                    </Label>
                    <select
                      required
                      value={form.community_focus}
                      onChange={(e) =>
                        update("community_focus", e.target.value)
                      }
                      className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-orange"
                    >
                      <option value="">Select community focus</option>
                      <option value="Tech / Developers">
                        Tech / Developers
                      </option>
                      <option value="Startups / Entrepreneurship">
                        Startups / Entrepreneurship
                      </option>
                      <option value="Design / Product">Design / Product</option>
                      <option value="Students">Students</option>
                      <option value="Working Professionals">
                        Working Professionals
                      </option>
                      <option value="Mixed / General">Mixed / General</option>
                      <option value="Other">Other</option>
                    </select>
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
                    value={form.promotion_plan}
                    onChange={(e) => update("promotion_plan", e.target.value)}
                    className="bg-secondary border-border focus:border-editorial-orange resize-none"
                    placeholder="e.g. Newsletter, Discord announcements, social media posts, weekly meetup..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Are you open to helping with sponsorship outreach?
                  </Label>
                  <select
                    value={form.open_to_sponsorship_outreach}
                    onChange={(e) =>
                      update("open_to_sponsorship_outreach", e.target.value)
                    }
                    className="w-full bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-editorial-orange"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Maybe">Maybe</option>
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
                    className="bg-secondary border-border focus:border-editorial-orange resize-none"
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
                    SUBMIT COMMUNITY PARTNER PROPOSAL
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

export default CommunityPartners;
