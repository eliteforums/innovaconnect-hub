import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Send } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="border-b-2 border-foreground">
        <div className="px-4 md:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-2">
              GET IN TOUCH
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              CONTACT
              <br />
              <span className="text-editorial-pink">US</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              Interested in sponsoring InnovaHack? Have questions about
              partnership opportunities? Fill out the form below and our team
              will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="border-b-2 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Form */}
          <div className="border-b md:border-b-0 md:border-r border-border p-8 md:p-16">
            {!submitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-4">
                    SPONSORSHIP INQUIRY
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-6">
                    SEND US A MESSAGE
                  </h2>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Your Name *
                  </Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Email Address *
                  </Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Company / Organization
                  </Label>
                  <Input
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Your company name"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Subject *
                  </Label>
                  <Input
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    placeholder="e.g. Title Sponsorship Inquiry"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest">
                    Message *
                  </Label>
                  <Textarea
                    required
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us about your sponsorship goals, budget range, and what you're looking for..."
                    rows={5}
                    className="mt-1 bg-secondary border-border resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity w-full justify-center"
                >
                  SEND MESSAGE <Send size={14} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center min-h-[400px] text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 bg-editorial-pink flex items-center justify-center mb-6">
                  <Check size={32} className="text-background" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">
                  MESSAGE SENT!
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Thank you for reaching out. Our sponsorship team will review
                  your message and get back to you within 24 hours.
                </p>
              </motion.div>
            )}
          </div>

          {/* Contact Info */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  CONTACT INFORMATION
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-black uppercase text-sm tracking-wider mb-2">
                  EMAIL
                </h3>
                <a
                  href="mailto:sponsors@eliteforums.in"
                  className="text-editorial-pink text-sm hover:underline"
                >
                  sponsors@eliteforums.in
                </a>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-black uppercase text-sm tracking-wider mb-2">
                  GENERAL INQUIRIES
                </h3>
                <a
                  href="mailto:hello@eliteforums.in"
                  className="text-editorial-blue text-sm hover:underline"
                >
                  hello@eliteforums.in
                </a>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-black uppercase text-sm tracking-wider mb-2">
                  RESPONSE TIME
                </h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours on business days. For
                  urgent inquiries, please mention "URGENT" in the subject line.
                </p>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-black uppercase text-sm tracking-wider mb-2">
                  SOCIAL MEDIA
                </h3>
                <div className="flex gap-4">
                  {["TWITTER", "LINKEDIN", "INSTAGRAM"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors border-2 border-border px-3 py-2 hover:border-foreground"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase text-sm tracking-wider mb-2">
                  ORGANIZED BY
                </h3>
                <p className="text-sm text-muted-foreground">
                  Elite Forums — Building India's largest hackathon ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;