import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowLeft,
  Check,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Who can login chips ──────────────────────────────────────────────────────

const WHO_CAN_LOGIN = [
  {
    icon: Users,
    label: "Participants",
    desc: "Applied via /register",
    color: "text-editorial-pink",
    border: "border-editorial-pink/60",
    bg: "bg-editorial-pink/5",
  },
  {
    icon: Building2,
    label: "Community Partners",
    desc: "Approved community orgs",
    color: "text-editorial-blue",
    border: "border-editorial-blue/60",
    bg: "bg-editorial-blue/5",
  },
  {
    icon: GraduationCap,
    label: "College Partners",
    desc: "College proposals submitted",
    color: "text-editorial-purple",
    border: "border-editorial-purple/60",
    bg: "bg-editorial-purple/5",
  },
  {
    icon: Briefcase,
    label: "Sponsors & Hirers",
    desc: "Submitted a sponsor proposal",
    color: "text-editorial-orange",
    border: "border-editorial-orange/60",
    bg: "bg-editorial-orange/5",
  },
];

// ─── View states ──────────────────────────────────────────────────────────────

type View = "login" | "forgot" | "reset_sent";

// ─── Main Component ───────────────────────────────────────────────────────────

const PortalLogin = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<View>("login");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // ── Login handler ─────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("invalid login") ||
        authError.message.toLowerCase().includes("invalid credentials") ||
        authError.message.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "Invalid email or password. If you haven't set a password yet, use 'Forgot Password' below to set one.",
        );
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate("/portal");
    }
    setLoading(false);
  };

  // ── Forgot password handler ────────────────────────────────────────────────

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    setForgotError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      forgotEmail.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/portal/reset-password`,
      },
    );

    if (resetError) {
      setForgotError(resetError.message);
      setForgotLoading(false);
      return;
    }

    setView("reset_sent");
    setForgotLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────

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
            {/* ════════════════════════════════════════════════════════════
                VIEW: LOGIN
            ════════════════════════════════════════════════════════════ */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Eyebrow + heading */}
                <div className="mb-7">
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
                    PARTICIPANT &amp; PARTNER PORTAL
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
                    SIGN IN
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use the email and password linked to your registration or
                    partnership account.
                  </p>
                </div>

                {/* Who can login */}
                <div className="grid grid-cols-2 gap-2 mb-7">
                  {WHO_CAN_LOGIN.map(
                    ({ icon: Icon, label, desc, color, border, bg }) => (
                      <div
                        key={label}
                        className={`border ${border} ${bg} px-3 py-2.5 rounded-none`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon size={12} className={color} />
                          <span
                            className={`text-[11px] font-black uppercase tracking-tight ${color}`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-[18px]">
                          {desc}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
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
                        className="bg-secondary border-border pl-9 text-sm"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-bold uppercase tracking-widest">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setView("forgot");
                          setError(null);
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest text-editorial-pink hover:opacity-80 transition-opacity"
                      >
                        FORGOT PASSWORD?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="••••••••••••"
                        className="bg-secondary border-border pl-9 pr-10 text-sm"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2.5 border-2 border-red-500 bg-red-500/10 px-4 py-3"
                      >
                        <ShieldAlert
                          size={15}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-red-400 leading-relaxed">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password}
                    className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        SIGNING IN...
                      </>
                    ) : (
                      <>
                        <LogIn size={15} />
                        SIGN IN TO PORTAL
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-7 border-t border-border pt-6 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">
                      First time signing in?
                    </strong>{" "}
                    Use{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setView("forgot");
                        setError(null);
                      }}
                      className="text-editorial-pink font-bold hover:underline"
                    >
                      Forgot Password
                    </button>{" "}
                    above to set your password via your registered email.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">No account?</strong>{" "}
                    Register at{" "}
                    <Link
                      to="/register"
                      className="text-editorial-pink font-bold hover:underline"
                    >
                      /register
                    </Link>{" "}
                    or apply as a partner at{" "}
                    <Link
                      to="/partner"
                      className="text-editorial-pink font-bold hover:underline"
                    >
                      /partner
                    </Link>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Need help?</strong>{" "}
                    <a
                      href="mailto:hello@eliteforums.in"
                      className="text-editorial-blue font-bold hover:underline"
                    >
                      hello@eliteforums.in
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                VIEW: FORGOT PASSWORD
            ════════════════════════════════════════════════════════════ */}
            {view === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back to login */}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setForgotError(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                  <ArrowLeft size={13} />
                  BACK TO SIGN IN
                </button>

                {/* Heading */}
                <div className="mb-7">
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
                    ACCOUNT RECOVERY
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
                    FORGOT
                    <br />
                    PASSWORD?
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter the email address linked to your account. We'll send
                    you a secure link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      Registered Email Address
                    </Label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError(null);
                        }}
                        placeholder="you@example.com"
                        className="bg-secondary border-border pl-9 text-sm"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {forgotError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2.5 border-2 border-red-500 bg-red-500/10 px-4 py-3"
                      >
                        <ShieldAlert
                          size={15}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-red-400 leading-relaxed">
                          {forgotError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        <Mail size={15} />
                        SEND RESET LINK
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                  Only email addresses that have a registered account will
                  receive a reset link. Check your spam folder if you don't see
                  the email within a few minutes.
                </p>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                VIEW: RESET LINK SENT
            ════════════════════════════════════════════════════════════ */}
            {view === "reset_sent" && (
              <motion.div
                key="reset_sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="w-20 h-20 bg-editorial-pink flex items-center justify-center mx-auto mb-6">
                  <Mail size={36} className="text-background" />
                </div>

                {/* Badge */}
                <div className="border-2 border-foreground px-5 py-1 inline-block mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-editorial-pink">
                    RESET LINK SENT
                  </p>
                </div>

                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
                  CHECK YOUR
                  <br />
                  INBOX
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  We've sent a password reset link to
                </p>
                <p className="text-base font-black text-editorial-pink mb-6 break-all">
                  {forgotEmail}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Click the link in the email to set a new password. The link
                  expires in <strong className="text-foreground">1 hour</strong>
                  .
                </p>

                {/* Steps */}
                <div className="border-2 border-border p-5 text-left space-y-3 mb-8">
                  {[
                    "Open your email inbox",
                    'Find the email from "InnovaHack / Supabase"',
                    'Click "Reset Password"',
                    "Set your new password",
                    "Sign in with your new password",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-editorial-pink flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Check size={10} className="text-background" />
                      </div>
                      <p className="text-xs text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setForgotError(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 border-2 border-foreground px-6 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
                  >
                    <LogIn size={14} />
                    BACK TO SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setForgotError(null);
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Use a different email
                  </button>
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
