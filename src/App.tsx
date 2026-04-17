import { lazy, Suspense, Component, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentProvider } from "@/contexts/ContentContext";
import { PortalAuthProvider } from "@/contexts/PortalAuthContext";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Each page is only downloaded when the user navigates to it.

// Public / landing
const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Tracks = lazy(() => import("./pages/Tracks.tsx"));
const Sponsors = lazy(() => import("./pages/Sponsors.tsx"));
const SponsorUs = lazy(() => import("./pages/SponsorUs.tsx"));
const Partner = lazy(() => import("./pages/Partner.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const EmailUs = lazy(() => import("./pages/EmailUs.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Registration
const Register = lazy(() => import("./pages/Register.tsx"));

// Partner proposal forms (grouped into one chunk via vite.config manualChunks)
const HiringPartners = lazy(
  () => import("./pages/partners/HiringPartners.tsx"),
);
const TechPartners = lazy(() => import("./pages/partners/TechPartners.tsx"));
const EducationPartners = lazy(
  () => import("./pages/partners/EducationPartners.tsx"),
);
const DomainSponsors = lazy(
  () => import("./pages/partners/DomainSponsors.tsx"),
);
const CollegePartners = lazy(
  () => import("./pages/partners/CollegePartners.tsx"),
);
const CommunityPartners = lazy(
  () => import("./pages/partners/CommunityPartners.tsx"),
);

// Admin panel (large chunk — only authenticated admins visit this)
const Admin = lazy(() => import("./pages/Admin.tsx"));

// Portal (authenticated participant/partner views)
const Portal = lazy(() => import("./pages/portal/Portal.tsx"));
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin.tsx"));
const PortalResetPassword = lazy(
  () => import("./pages/portal/PortalResetPassword.tsx"),
);

// ─── QueryClient — configured for performance ─────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes → no redundant refetches on
      // tab focus or component remount during a session
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once (not the default 3×)
      retry: 1,
      retryDelay: 1000,
      // Don't refetch just because the window regained focus
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Page loading fallback ────────────────────────────────────────────────────
const PageLoader = () => (
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

// ─── Error Boundary ───────────────────────────────────────────────────────────
// Catches any unhandled render errors so the whole app doesn't crash
type EBState = { hasError: boolean; message: string };
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-3">
              SOMETHING WENT WRONG
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
              PAGE ERROR
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-foreground text-background px-6 py-3 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public routes — wrapped in ContentProvider ── */}
              {/* ContentProvider only loads for pages that actually use landing content */}
              <Route
                path="/"
                element={
                  <ContentProvider>
                    <Index />
                  </ContentProvider>
                }
              />
              <Route
                path="/about"
                element={
                  <ContentProvider>
                    <About />
                  </ContentProvider>
                }
              />
              <Route path="/tracks" element={<Tracks />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/sponsor-us" element={<SponsorUs />} />
              <Route path="/partner" element={<Partner />} />
              <Route
                path="/contact"
                element={
                  <ContentProvider>
                    <Contact />
                  </ContentProvider>
                }
              />
              <Route path="/email-us" element={<EmailUs />} />

              {/* ── Register — uses ContentProvider for skills list ── */}
              <Route
                path="/register"
                element={
                  <ContentProvider>
                    <Register />
                  </ContentProvider>
                }
              />

              {/* ── Partner proposal forms ── */}
              <Route path="/hiring-partners" element={<HiringPartners />} />
              <Route path="/tech-partners" element={<TechPartners />} />
              <Route
                path="/education-partners"
                element={<EducationPartners />}
              />
              <Route path="/domain-sponsors" element={<DomainSponsors />} />
              <Route path="/college-partners" element={<CollegePartners />} />
              <Route
                path="/community-partners"
                element={<CommunityPartners />}
              />

              {/* ── Admin panel — no ContentProvider ── */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/*" element={<Admin />} />

              {/* ── Portal — wrapped in PortalAuthProvider only ── */}
              <Route
                path="/portal"
                element={
                  <PortalAuthProvider>
                    <Portal />
                  </PortalAuthProvider>
                }
              />
              <Route
                path="/portal/login"
                element={
                  <PortalAuthProvider>
                    <PortalLogin />
                  </PortalAuthProvider>
                }
              />
              <Route
                path="/portal/reset-password"
                element={<PortalResetPassword />}
              />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
