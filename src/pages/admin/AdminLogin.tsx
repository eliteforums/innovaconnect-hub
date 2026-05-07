import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSignIn } from "@/lib/supabase";

type Props = {
  onLogin: () => void;
};

const AdminLogin = ({ onLogin }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await adminSignIn(email, password);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : authError.message
      );
      setLoading(false);
      return;
    }

    onLogin();
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
          ADMIN PANEL
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
                <Shield size={20} className="text-background" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground">
                  RESTRICTED ACCESS
                </p>
                <h1 className="text-2xl font-black uppercase tracking-tighter">
                  ADMIN LOGIN
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin credentials to access the InnovaHack
              dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest">
                Email Address
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eliteforums.in"
                className="mt-1 bg-secondary border-border"
                autoComplete="email"
              />
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
                  <LogIn size={16} /> SIGN IN TO DASHBOARD
                </>
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">First time setup?</strong>{" "}
              Create an admin user in your Supabase dashboard under
              Authentication → Users. See{" "}
              <code className="bg-secondary px-1 py-0.5 text-xs">
                supabase/INSTRUCTIONS.md
              </code>{" "}
              for full setup guide.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
