import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, Check, ShieldAlert, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PortalResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Supabase embeds the access token in the URL hash after the redirect.
  // onAuthStateChange fires with event=PASSWORD_RECOVERY when the token is consumed.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );

    // Also check if there's already a session (user landed here with a valid token)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    // If no token in URL after a short wait, show error
    const timer = setTimeout(() => {
      if (!sessionReady) setSessionError(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    // Auto-redirect to portal after 3 seconds
    setTimeout(() => navigate("/portal"), 3000);
  };

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 6) return { label: "TOO SHORT", color: "bg-red-500", width: "25%" };
    if (pw.length < 8) return { label: "WEAK", color: "bg-red-400", width: "40%" };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
      return { label: "FAIR", color: "bg-yellow-500", width: "60%" };
    if (pw.length >= 10 && /[^A-Za-z0-9]/.test(pw))
      return { label: "STRONG", color: "bg-editorial-green", width: "100%" };
    return { label: "GOOD", color: "bg-editorial-green", width: "80%" };
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-black uppercase tracking-tighter"
        >
          INNOVA<span className="text-editorial-pink">HACK</span>
        </Link>
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          PORTAL
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* ── Loading / waiting for session ─────────────────────────── */}
            {!sessionReady && !sessionError && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-10 h-10 border-2 border-editorial-pink border-t-transparent rounded-full animate-spin mx-auto mb-5" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  VERIFYING RESET LINK...
                </p>
              </motion.div>
            )}

            {/* ── Invalid / expired link ────────────────────────────────── */}
            {sessionError && !sessionReady && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div className="w-16 h-16 border-2 border-red-500 bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                  <ShieldAlert size={28} className="text-red-400" />
                </div>
                <div className="border-2 border-foreground px-5 py-1 inline-block mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                    INVALID OR EXPIRED LINK
                  </p>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
                  LINK EXPIRED
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
                  This password reset link has expired or is invalid. Reset
                  links are only valid for 1 hour. Please request a new one.
                </p>
                <Link
                  to="/portal/login"
                  className="inline-flex items-center gap-2 bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
                >
                  REQUEST NEW LINK →
                </Link>
              </motion.div>
            )}

            {/* ── Success — password updated ─────────────────────────────── */}
            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-editorial-pink flex items-center justify-center mx-auto mb-6">
                  <Check size={38} className="text-background" />
                </div>
                <div className="border-2 border-foreground px-5 py-1 inline-block mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-editorial-pink">
                    PASSWORD UPDATED
                  </p>
                </div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
                  ALL DONE!
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Your password has been updated successfully.
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  Redirecting you to your portal in a moment…
                </p>
                <div className="w-full h-1 bg-secondary rounded overflow-hidden mb-8">
                  <motion.div
                    className="h-1 bg-editorial-pink"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 border-2 border-foreground px-8 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
                >
                  <LogIn size={14} /> GO TO MY PORTAL
                </Link>
              </motion.div>
            )}

            {/* ── Reset form ────────────────────────────────────────────── */}
            {sessionReady && !done && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Heading */}
                <div className="mb-8">
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
                    ACCOUNT RECOVERY
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
                    SET NEW
                    <br />
                    PASSWORD
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose a strong password for your InnovaHack portal account.
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-5">
                  {/* New password */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      New Password
                    </Label>
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
                        placeholder="Minimum 8 characters"
                        className="bg-secondary border-border pl-9 pr-10 text-sm"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="h-1 bg-secondary rounded overflow-hidden">
                          <motion.div
                            className={`h-1 rounded ${strength.color}`}
                            animate={{ width: strength.width }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        {strength.label && (
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                            strength.label === "TOO SHORT" || strength.label === "WEAK"
                              ? "text-red-400"
                              : strength.label === "FAIR"
                              ? "text-yellow-400"
                              : "text-editorial-green"
                          }`}>
                            {strength.label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest mb-1.5 block">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <KeyRound
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Re-enter your new password"
                        className={`bg-secondary pl-9 pr-10 text-sm ${
                          confirmPassword.length > 0
                            ? confirmPassword === password
                              ? "border-editorial-green"
                              : "border-red-500"
                            : "border-border"
                        }`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && confirmPassword !== password && (
                      <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-red-400">
                        PASSWORDS DO NOT MATCH
                      </p>
                    )}
                    {confirmPassword.length > 0 && confirmPassword === password && (
                      <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-editorial-green">
                        PASSWORDS MATCH ✓
                      </p>
                    )}
                  </div>

                  {/* Password rules */}
                  <div className="border border-border bg-secondary/30 px-4 py-3 space-y-1.5">
                    {[
                      { rule: "At least 8 characters", met: password.length >= 8 },
                      { rule: "At least one uppercase letter", met: /[A-Z]/.test(password) },
                      { rule: "At least one number", met: /[0-9]/.test(password) },
                    ].map(({ rule, met }) => (
                      <div key={rule} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 flex items-center justify-center rounded-full shrink-0 ${
                          met ? "bg-editorial-green" : "bg-secondary border border-border"
                        }`}>
                          {met && <Check size={8} className="text-background" />}
                        </div>
                        <p className={`text-[11px] ${met ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                          {rule}
                        </p>
                      </div>
                    ))}
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
                        <ShieldAlert size={15} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      password.length < 8 ||
                      password !== confirmPassword
                    }
                    className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        UPDATING...
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        SET NEW PASSWORD
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                  Remember to store your password somewhere safe. You can always
                  reset it again from the{" "}
                  <Link
                    to="/portal/login"
                    className="text-editorial-pink font-bold hover:underline"
                  >
                    sign in page
                  </Link>
                  .
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PortalResetPassword;
