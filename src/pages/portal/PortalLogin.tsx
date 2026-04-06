import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Check, LogIn, Users, Building2, GraduationCap, Briefcase } from "lucide-react";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WHO_CAN_LOGIN = [
  {
    icon: Users,
    label: "Registered Participants",
    desc: "Applied via /register",
    color: "text-editorial-pink",
    border: "border-editorial-pink",
  },
  {
    icon: Building2,
    label: "Community Partners",
    desc: "Approved community orgs",
    color: "text-editorial-blue",
    border: "border-editorial-blue",
  },
  {
    icon: GraduationCap,
    label: "College Partners",
    desc: "College partnership proposals",
    color: "text-editorial-purple",
    border: "border-editorial-purple",
  },
  {
    icon: Briefcase,
    label: "Sponsors & Hiring Partners",
    desc: "Submitted a sponsor proposal",
    color: "text-editorial-orange",
    border: "border-editorial-orange",
  },
];

const PortalLogin = () => {
  const { signIn } = usePortalAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim().toLowerCase());

    if (signInError) {
      // Supabase returns "Signups not allowed for otp" when shouldCreateUser=false
      // and the email doesn't exist. Give a friendlier message.
      if (
        signInError.toLowerCase().includes("signups not allowed") ||
        signInError.toLowerCase().includes("not allowed") ||
        signInError.toLowerCase().includes("user not found")
      ) {
        setError(
          "We couldn't find an account with this email. Make sure you're using the same email you registered or applied with."
        );
      } else {
        setError(signInError);
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            BACK TO HOME
          </Link>

          <AnimatePresence mode="wait">
            {/* ── Sent state ───────────────────────────────────────────── */}
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                {/* Big mail icon */}
                <div className="w-20 h-20 bg-editorial-pink flex items-center justify-center mx-auto mb-6">
                  <Mail size={36} className="text-background" />
                </div>

                {/* Heading */}
                <div className="border-2 border-foreground px-6 py-1 inline-block mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-editorial-pink">
                    MAGIC LINK SENT
                  </p>
                </div>

                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
                  CHECK YOUR EMAIL
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  We've sent a magic link to
                </p>
                <p className="text-base font-black text-editorial-pink mb-6 break-all">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Click the link in your email to sign in instantly — no password needed.
                  The link expires in <strong className="text-foreground">10 minutes</strong>.
                </p>

                {/* Steps */}
                <div className="border border-border p-4 text-left space-y-3 mb-8">
                  {[
                    "Open your email inbox",
                    'Find the email from "InnovaHack"',
                    "Click the magic link button",
                    "You'll be signed in automatically",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-editorial-pink flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Check size={10} className="text-background" />
                      </div>
                      <p className="text-xs text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Use a different email
                </button>
              </motion.div>
            ) : (
              /* ── Form state ─────────────────────────────────────────── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                {/* Eyebrow + heading */}
                <div className="mb-8">
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
                    PARTICIPANT & PARTNER PORTAL
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
                    SIGN IN
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter the email you used to register or submit your partnership
                    proposal. We'll send you a magic link —{" "}
                    <strong className="text-foreground">no password needed</strong>.
                  </p>
                </div>

                {/* Who can login chips */}
                <div className="grid grid-cols-2 gap-2 mb-8">
                  {WHO_CAN_LOGIN.map(({ icon: Icon, label, desc, color, border }) => (
                    <div
                      key={label}
                      className={`border ${border} bg-secondary/40 px-3 py-2.5`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon size={13} className={color} />
                        <span className={`text-xs font-black uppercase tracking-tight ${color}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-1 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="you@example.com"
                        className="bg-secondary border-border pl-9 font-mono text-sm"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="border-2 border-red-500 bg-red-500/10 px-4 py-3 text-xs text-red-400 leading-relaxed"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        <LogIn size={15} />
                        SEND MAGIC LINK
                      </>
                    )}
                  </button>
                </form>

                {/* Footer note */}
                <div className="mt-8 border-t border-border pt-6 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Don't have an account?</strong>{" "}
                    Register as a participant at{" "}
                    <Link
                      to="/register"
                      className="text-editorial-pink hover:underline font-bold"
                    >
                      /register
                    </Link>{" "}
                    or submit a partnership proposal at{" "}
                    <Link
                      to="/partner"
                      className="text-editorial-pink hover:underline font-bold"
                    >
                      /partner
                    </Link>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Having trouble?</strong>{" "}
                    Email us at{" "}
                    <a
                      href="mailto:hello@eliteforums.in"
                      className="text-editorial-blue hover:underline font-bold"
                    >
                      hello@eliteforums.in
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PortalLogin;
