import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { finalistSignIn } from "@/lib/hmsAuth";

const TEAM_ID_PATTERN = /^IH-\d{4}$/;

const FinalistLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeamId = TEAM_ID_PATTERN.test(identifier.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await finalistSignIn(identifier.trim(), password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.mustChangePassword) {
      navigate("/finalist/change-password");
    } else {
      navigate("/finalist/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <a
          href="/"
          className="text-xl font-black uppercase tracking-tighter"
        >
          INNOVA<span className="text-editorial-pink">HACK</span>
        </a>
        <span className="text-xs tracking-widest uppercase text-muted-foreground">
          FINALIST PORTAL
        </span>
      </div>

      {/* Login form */}
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
                <Users size={20} className="text-background" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                  TEAM ACCESS
                </p>
                <h1 className="text-2xl font-black uppercase tracking-tighter">
                  FINALIST LOGIN
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in with your Team ID (IH-XXXX) or registered email address
              and the password provided in your credentials email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest">
                Email or Team ID
              </Label>
              <div className="relative mt-1">
                <Input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="team@example.com or IH-0042"
                  className="bg-secondary border-border"
                  autoComplete="username"
                />
                {isTeamId && (
                  <motion.span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider bg-editorial-pink/20 text-editorial-pink px-2 py-0.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    TEAM ID
                  </motion.span>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-widest">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-secondary border-border pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-editorial-pink px-6 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "SIGNING IN..."
              ) : (
                <>
                  <LogIn size={16} /> SIGN IN TO PORTAL
                </>
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">First time logging in?</strong>{" "}
              Use the Team ID and temporary password from your credentials email.
              You will be asked to set a new password on first login.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalistLogin;
