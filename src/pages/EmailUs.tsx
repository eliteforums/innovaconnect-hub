import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Mail } from "lucide-react";

const emailCategories = [
  { value: "sponsorship", label: "SPONSORSHIP INQUIRY" },
  { value: "partnership", label: "PARTNERSHIP OPPORTUNITY" },
  { value: "media", label: "MEDIA & PR" },
  { value: "general", label: "GENERAL QUESTION" },
  { value: "other", label: "OTHER" },
];

const EmailUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    category: "",
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
              REACH OUT TO US
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              EMAIL
              <br />
              <span className="text-editorial-pink">US</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              Have a specific question or want to discuss sponsorship details?
              Send us an email through this form and we'll respond promptly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Email Form */}
      <section className="border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
          {!submitted ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Category *
                  </Label>
                  <div className="mt-1">
                    <select
                      required
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-md text-sm text-foreground"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {emailCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest">
                  Subject *
                </Label>
                <Input
                  required
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="Brief subject of your email"
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
                  placeholder="Write your detailed message here..."
                  rows={8}
                  className="mt-1 bg-secondary border-border resize-none"
                />
              </div>

              <div className="border-2 border-border p-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">NOTE:</span> You
                  can also email us directly at{" "}
                  <a
                    href="mailto:sponsors@eliteforums.in"
                    className="text-editorial-pink hover:underline"
                  >
                    sponsors@eliteforums.in
                  </a>{" "}
                  for sponsorship inquiries or{" "}
                  <a
                    href="mailto:hello@eliteforums.in"
                    className="text-editorial-blue hover:underline"
                  >
                    hello@eliteforums.in
                  </a>{" "}
                  for general questions.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity w-full justify-center"
              >
                SEND EMAIL <Mail size={14} />
              </button>
            </motion.form>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 bg-editorial-pink flex items-center justify-center mb-6">
                <Check size={40} className="text-background" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-3">
                EMAIL SENT!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Thank you for reaching out. Our team will review your email and
                respond within 24 hours. Check your inbox for a confirmation.
              </p>
              <a
                href="/"
                className="mt-8 border-2 border-foreground px-8 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
              >
                BACK TO HOME
              </a>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EmailUs;