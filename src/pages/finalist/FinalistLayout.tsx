import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  Upload,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchUnreadCount, type Team } from "@/lib/hms";

// ─── Team Context ─────────────────────────────────────────────────────────────
// Provides team data to child routes without prop drilling

interface FinalistContextValue {
  team: Team | null;
  loading: boolean;
}

const FinalistContext = createContext<FinalistContextValue>({
  team: null,
  loading: true,
});

export const useFinalistContext = () => useContext(FinalistContext);

// ─── Nav Config ───────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/finalist/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Profile", path: "/finalist/profile", icon: <User size={16} /> },
  { label: "Problem Statements", path: "/finalist/problem-statements", icon: <FileText size={16} /> },
  { label: "Submissions", path: "/finalist/submissions", icon: <Upload size={16} /> },
  { label: "Announcements", path: "/finalist/announcements", icon: <Bell size={16} /> },
];

// ─── FinalistLayout ───────────────────────────────────────────────────────────

const FinalistLayout = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auth guard + team data fetch
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/finalist/login", { replace: true });
        return;
      }

      // Fetch team record for the authenticated user
      const { data: teamData, error } = await supabase
        .from("teams")
        .select("*")
        .eq("leader_id", session.user.id)
        .single();

      if (error || !teamData) {
        // No team found — user may not be a finalist
        navigate("/finalist/login", { replace: true });
        return;
      }

      setTeam(teamData as Team);
      setLoading(false);

      // Fetch unread notification count
      const { data: count } = await fetchUnreadCount(
        teamData.id,
        teamData.domain,
        teamData.team_id,
      );
      setUnreadCount(count);
    };

    init();
  }, [navigate]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          navigate("/finalist/login", { replace: true });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/finalist/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{
              borderColor: "hsl(var(--foreground))",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <FinalistContext.Provider value={{ team, loading }}>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <Sidebar
          team={team}
          unreadCount={unreadCount}
          onSignOut={handleSignOut}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Top bar */}
          <header className="border-b-2 border-foreground px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 bg-background z-30">
            <button
              className="lg:hidden text-foreground hover:text-editorial-pink transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <span>Finalist Portal</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {team && (
                <span className="text-xs font-bold uppercase tracking-widest border border-border px-2 py-1 hidden sm:block">
                  {team.team_id}
                </span>
              )}
            </div>
          </header>

          {/* Page content via nested routes */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </FinalistContext.Provider>
  );
};

// ─── Sidebar Component ────────────────────────────────────────────────────────

type SidebarProps = {
  team: Team | null;
  unreadCount: number;
  onSignOut: () => void;
  open: boolean;
  onClose: () => void;
};

const Sidebar = ({ team, unreadCount, onSignOut, open, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-background border-r-2 border-foreground
          flex flex-col w-64 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="border-b-2 border-foreground px-5 py-4 flex items-center justify-between">
          <a href="/" className="text-lg font-black uppercase tracking-tighter">
            INNOVA<span className="text-editorial-pink">HACK</span>
          </a>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Team info header */}
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-editorial-pink mb-0.5">
            FINALIST PORTAL
          </p>
          {team && (
            <>
              <p className="text-sm font-bold truncate">{team.team_name}</p>
              <p className="text-xs text-muted-foreground">{team.team_id}</p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-editorial-pink text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {/* Notification badge for Announcements */}
              {item.label === "Announcements" && unreadCount > 0 && (
                <span className="bg-editorial-pink text-background text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border p-4">
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </aside>
    </>
  );
};

export default FinalistLayout;
