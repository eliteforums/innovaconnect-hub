import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PortalResetPassword from "./pages/portal/PortalResetPassword.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentProvider } from "@/contexts/ContentContext";
import { PortalAuthProvider } from "@/contexts/PortalAuthContext";
import Portal from "./pages/portal/Portal.tsx";
import PortalLogin from "./pages/portal/PortalLogin.tsx";
import Index from "./pages/Index.tsx";
import Register from "./pages/Register.tsx";
import About from "./pages/About.tsx";
import Tracks from "./pages/Tracks.tsx";
import Sponsors from "./pages/Sponsors.tsx";
import SponsorUs from "./pages/SponsorUs.tsx";
import Partner from "./pages/Partner.tsx";
import Contact from "./pages/Contact.tsx";
import EmailUs from "./pages/EmailUs.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import HiringPartners from "./pages/partners/HiringPartners.tsx";
import TechPartners from "./pages/partners/TechPartners.tsx";
import EducationPartners from "./pages/partners/EducationPartners.tsx";
import DomainSponsors from "./pages/partners/DomainSponsors.tsx";
import CollegePartners from "./pages/partners/CollegePartners.tsx";
import CommunityPartners from "./pages/partners/CommunityPartners.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ContentProvider>
        <PortalAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/tracks" element={<Tracks />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/sponsor-us" element={<SponsorUs />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/email-us" element={<EmailUs />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/*" element={<Admin />} />
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
              <Route path="/portal" element={<Portal />} />
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route
                path="/portal/reset-password"
                element={<PortalResetPassword />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PortalAuthProvider>
      </ContentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
