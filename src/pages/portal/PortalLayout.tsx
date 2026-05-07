import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

type Props = { children: React.ReactNode; title: string; subtitle?: string };

const PortalLayout = ({ children, title, subtitle }: Props) => {
  const { user, signOut } = usePortalAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Portal header */}
      <header className="border-b-2 border-foreground px-4 md:px-8 py-4 sticky top-0 bg-background z-50">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-black uppercase tracking-tighter">
            INNOVA<span className="text-editorial-pink">HACK</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest border border-border px-2 py-1">
              {user?.role?.replace(/_/g, " ").toUpperCase() ?? "PORTAL"}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
            >
              <LogOut size={12} />
              SIGN OUT
            </button>
          </div>
        </div>
      </header>

      {/* Page title bar */}
      <div className="border-b border-border px-4 md:px-8 py-5">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-1">
          MY PORTAL
        </p>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
