import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { passwordSchema } from "@/lib/hmsValidation";

// ─────────────────────────────────────────────
// Password Strength Helpers
// ─────────────────────────────────────────────

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One digit", met: /\d/.test(password) },
    {
      label: "One special character",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];
}

function getStrengthPercent(checks: PasswordCheck[]): number {
  const met = checks.filter((c) => c.met).length;
  return Math.round((met / checks.length) * 100);
}

function getStrengthLabel(percent: number): { text: string; color: string } {
  if (percent <= 20) return { text: "VERY WEAK", color: "bg-red-500" };
  if (percent <= 40) return { text: "WEAK", color: "bg-orange-500" };
  if (percent <= 60) return { text: "FAIR", color: "bg-yellow-500" };
  if (percent <= 80) return { text: "GOOD", color: "bg-blue-500" };
  return { text: "STRONG", color: "bg-green-500" };
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const FinalistForcePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const strengthPercent = useMemo(() => getStrengthPercent(checks), [checks]);
  const strengthInfo = useMemo(
    () => getStrengthLabel(strengthPercent),
    [strengthPercent],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    // Validate password with Zod schema
    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      setValidationErrors(result.error.errors.map((err) => err.message));
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setValidationErrors(["Passwords do not match."]);
      return;
    }

    setLoading(true);

    try {
      // Update password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Get current user to find their team
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Unable to verify session. Please log in again.");
        setLoading(false);
        return;
      }

      // Set must_change_password = false in teams table
      const { error: teamError } = await supabase
        .from("teams")
        .update({ must_change_password: false })
        .eq("leader_id", user.id);

      if (teamError) {
        // Password was updated but flag wasn't cleared — still redirect
        console.error("Failed to clear must_change_password flag:", teamError);
      }

      // Redirect to dashboard
      navigate("/finalist/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-black uppercase tracking-tighter">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </span>
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          FINALIST PORTAL
        </span>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-editorial-pink flex items-center justify-center">
                <KeyRound size={20} className="text-background" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                  SECURITY REQUIRED
                </p>
                <h1 className="text-2xl font-black uppercase tracking-tighter">
                  SET NEW PASSWORD
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              For security, you must set a new password before accessing the
              portal. Your temporary password cannot be reused.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest">
                New Password
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-secondary border-border pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
              >
                {/* Strength bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Password Strength
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        strengthPercent === 100
                          ? "text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full ${strengthInfo.color} transition-colors`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Requirements checklist */}
                <div className="grid grid-cols-1 gap-1">
                  {checks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      {check.met ? (
                        <Check size={12} className="text-green-400 shrink-0" />
                      ) : (
                        <X size={12} className="text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={
                          check.met
                            ? "text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Confirm Password */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`bg-secondary border-border pr-10 ${
                    passwordsMismatch
                      ? "border-red-500 focus-visible:ring-red-500"
                      : passwordsMatch
                        ? "border-green-500 focus-visible:ring-green-500"
                        : ""
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="mt-1 text-xs text-red-400">
                  Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                  <Check size={12} /> Passwords match
                </p>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <motion.div
                className="border-2 border-red-500 bg-red-500/10 px-4 py-3 space-y-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {validationErrors.map((err, i) => (
                  <p key={i} className="text-sm text-red-400">
                    {err}
                  </p>
                ))}
              </motion.div>
            )}

            {/* General Error */}
            {error && (
              <motion.div
                className="border-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordsMatch || strengthPercent < 100}
              className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "UPDATING PASSWORD..."
              ) : (
                <>
                  <KeyRound size={16} /> SET NEW PASSWORD
                </>
              )}
            </button>
          </form>

          {/* Info text */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Why is this required?</strong>{" "}
              Your temporary password was generated for initial access only. Setting
              a strong personal password keeps your team's submissions and data
              secure. You cannot access the portal until this step is completed.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalistForcePassword;
