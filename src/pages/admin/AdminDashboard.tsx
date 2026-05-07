import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Layers,
  HelpCircle,
  Star,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  Info,
  Building2,
  Handshake,
  Link as LinkIcon,
} from "lucide-react";
import { adminSignOut, getSession } from "@/lib/supabase";

// Section components
import OverviewSection from "@/components/admin/sections/OverviewSection";
import RegistrationsSection from "@/components/admin/sections/RegistrationsSection";
import InquiriesSection from "@/components/admin/sections/InquiriesSection";
import HeroEditor from "@/components/admin/sections/HeroEditor";
import DomainsEditor from "@/components/admin/sections/DomainsEditor";
import ProcessEditor from "@/components/admin/sections/ProcessEditor";
import FAQEditor from "@/components/admin/sections/FAQEditor";
import OutcomesEditor from "@/components/admin/sections/OutcomesEditor";
import FeeEditor from "@/components/admin/sections/FeeEditor";
import CTAEditor from "@/components/admin/sections/CTAEditor";
import AboutEditor from "@/components/admin/sections/AboutEditor";
import SponsorsManager from "@/components/admin/sections/SponsorsManager";
import SettingsEditor from "@/components/admin/sections/SettingsEditor";
import ProposalsSection from "@/components/admin/sections/ProposalsSection";
import ReferralsSection from "@/components/admin/sections/ReferralsSection";

// ─── Nav Config ───────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
};

const NAV_ITEMS: NavItem[] = [
  // Data
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={16} />,
    group: "DATA",
  },
  {
    id: "registrations",
    label: "Registrations",
    icon: <Users size={16} />,
    group: "DATA",
  },
  {
    id: "inquiries",
    label: "Inquiries",
    icon: <Mail size={16} />,
    group: "DATA",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: <Handshake size={16} />,
    group: "DATA",
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: <LinkIcon size={16} />,
    group: "DATA",
  },
  // Home Page
  {
    id: "hero",
    label: "Hero Section",
    icon: <Star size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "domains",
    label: "Domains",
    icon: <Layers size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "process",
    label: "Process Steps",
    icon: <ChevronRight size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "outcomes",
    label: "Outcomes",
    icon: <Trophy size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: <HelpCircle size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "fee",
    label: "Fee Section",
    icon: <DollarSign size={16} />,
    group: "HOME PAGE",
  },
  {
    id: "cta",
    label: "CTA Section",
    icon: <Megaphone size={16} />,
    group: "HOME PAGE",
  },
  // Other Pages
  {
    id: "about",
    label: "About Page",
    icon: <Info size={16} />,
    group: "PAGES",
  },
  {
    id: "sponsors",
    label: "Sponsors",
    icon: <Building2 size={16} />,
    group: "PAGES",
  },
  // Config
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={16} />,
    group: "CONFIG",
  },
];

const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  overview: <OverviewSection />,
  registrations: <RegistrationsSection />,
  inquiries: <InquiriesSection />,
  proposals: <ProposalsSection />,
  referrals: <ReferralsSection />,
  hero: <HeroEditor />,
  domains: <DomainsEditor />,
  process: <ProcessEditor />,
  faq: <FAQEditor />,
  outcomes: <OutcomesEditor />,
  fee: <FeeEditor />,
  cta: <CTAEditor />,
  about: <AboutEditor />,
  sponsors: <SponsorsManager />,
  settings: <SettingsEditor />,
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type SidebarProps = {
  active: string;
  onSelect: (id: string) => void;
  adminEmail: string;
  onSignOut: () => void;
  open: boolean;
  onClose: () => void;
};

const Sidebar = ({
  active,
  onSelect,
  adminEmail,
  onSignOut,
  open,
  onClose,
}: SidebarProps) => {
  const groups = [...new Set(NAV_ITEMS.map((i) => i.group))];

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
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-editorial-pink mb-0.5">
            ADMIN PANEL
          </p>
          <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              <p className="px-5 py-1 text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60">
                {group}
              </p>
              {NAV_ITEMS.filter((i) => i.group === group).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active === item.id
                      ? "bg-editorial-pink text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

type Props = {
  onLogout: () => void;
};

const AdminDashboard = ({ onLogout }: Props) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    getSession().then(({ session }) => {
      if (session?.user?.email) setAdminEmail(session.user.email);
    });
  }, []);

  const handleSignOut = async () => {
    await adminSignOut();
    onLogout();
  };

  const activeItem = NAV_ITEMS.find((i) => i.id === activeSection);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar
        active={activeSection}
        onSelect={setActiveSection}
        adminEmail={adminEmail}
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
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-foreground font-bold">
              {activeItem?.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-editorial-blue transition-colors hidden sm:block"
            >
              VIEW SITE →
            </a>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {SECTION_COMPONENTS[activeSection] ?? (
                <div className="p-8 text-muted-foreground text-sm">
                  Section not found.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
