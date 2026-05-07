import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import ParticipantDashboard from "./dashboards/ParticipantDashboard";
import CommunityPartnerDashboard from "./dashboards/CommunityPartnerDashboard";
import CollegePartnerDashboard from "./dashboards/CollegePartnerDashboard";
import SponsorDashboard from "./dashboards/SponsorDashboard";
import PortalLoading from "./PortalLoading";
import { ArrowLeft, AlertCircle } from "lucide-react";

const AccountNotFound = () => {
  const { user, signOut } = usePortalAuth();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-black uppercase tracking-tighter">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs font-bold uppercase tracking-wider border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-editorial-pink" />
          </div>

          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
            ACCOUNT NOT FOUND
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">
            NO RECORD FOUND
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            We couldn't find a registration or proposal linked to{" "}
            <strong className="text-foreground">{user?.email}</strong>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Make sure you're using the same email address you used when registering
            or submitting a partnership proposal.
          </p>

          <div className="border-2 border-border p-5 text-left mb-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              WHAT YOU CAN DO
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-editorial-pink mt-0.5">→</span>
                <span>
                  Register as a participant at{" "}
                  <Link to="/register" className="text-foreground underline underline-offset-2 hover:text-editorial-pink transition-colors">
                    /register
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-editorial-pink mt-0.5">→</span>
                <span>
                  Submit a partnership proposal at{" "}
                  <Link to="/partner" className="text-foreground underline underline-offset-2 hover:text-editorial-pink transition-colors">
                    /partner
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-editorial-pink mt-0.5">→</span>
                <span>
                  Check that you're signing in with the correct email address
                </span>
              </li>
            </ul>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
          >
            <ArrowLeft size={14} />
            BACK TO HOME
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

const Portal = () => {
  const { user, session, loading } = usePortalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/portal/login", { replace: true });
    }
  }, [loading, session, navigate]);

  // Show spinner while resolving auth state
  if (loading) return <PortalLoading />;

  // Not authenticated — redirect handled by useEffect above, show nothing while navigating
  if (!session || !user) return <PortalLoading />;

  // Route to the correct dashboard based on resolved role
  switch (user.role) {
    case "participant":
      return <ParticipantDashboard />;
    case "community_partner":
      return <CommunityPartnerDashboard />;
    case "college_partner":
      return <CollegePartnerDashboard />;
    case "sponsor":
      return <SponsorDashboard />;
    default:
      // Authenticated but no matching record in any table
      return <AccountNotFound />;
  }
};

export default Portal;
