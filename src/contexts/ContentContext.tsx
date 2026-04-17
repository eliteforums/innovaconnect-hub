import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchAllSiteContent } from "@/lib/supabase";

// ─────────────────────────────────────────────
// Default content (fallback when Supabase is unavailable)
// ─────────────────────────────────────────────

export const DEFAULT_CONTENT: Record<string, Record<string, unknown>> = {
  hero: {
    chapter: "CHAPTER 01 — 2026",
    title_line1: "INNOVA",
    title_line2: "HACK",
    tagline: "India's Largest Hiring & Startup Hackathon",
    description:
      "Hack. Get Hired. Get Funded. — A 30-hour elite hackathon where the top 1% of India's builders meet hiring companies, investors, and incubators.",
    prize_pool: "₹3 LAKHS+",
    prize_label: "Including Cash Prizes, Goodies & More",
    placement_text: "Assured Placement Assistance to Top 1% Selected Finalists",
    ticker_text:
      "GENERATIVE AI • FINTECH • HEALTHTECH • BLOCKCHAIN • STARTUP TRACK • HACK. GET HIRED. GET FUNDED. • ",
    key_facts: [
      { number: "10,000+", label: "APPLICANTS" },
      { number: "TOP 1%", label: "SELECTED" },
      {
        number: "₹3 LAKHS+",
        label: "PRIZE POOL — CASH, GOODIES & MORE",
        highlight: true,
      },
      { number: "30 HRS", label: "OF HACKING" },
      { number: "₹50", label: "REGISTRATION FEE" },
      { number: "MUMBAI", label: "LOCATION" },
      { number: "R1: ONLINE", label: "R2: HYBRID" },
      { number: "₹50 LAKHS+", label: "STARTUP FUNDING", highlight: true },
    ],
    cta_primary: "REGISTER NOW →",
    cta_secondary: "PARTNER WITH US",
  },
  domains: {
    domains: [
      {
        name: "GENERATIVE AI",
        description:
          "Build the next wave of AI-powered applications. From LLMs to creative AI — push the boundaries of what machines can create.",
        tag: "AI/ML",
        color: "border-editorial-purple",
        accent: "text-editorial-purple",
      },
      {
        name: "FINTECH",
        description:
          "Reinvent how money moves. Payments, lending, insurance, DeFi — build solutions that disrupt traditional finance.",
        tag: "FINANCE",
        color: "border-editorial-blue",
        accent: "text-editorial-blue",
      },
      {
        name: "HEALTHTECH",
        description:
          "Technology that saves lives. Digital health, diagnostics, telemedicine — solve real problems in healthcare delivery.",
        tag: "HEALTH",
        color: "border-editorial-green",
        accent: "text-editorial-green",
      },
      {
        name: "BLOCKCHAIN",
        description:
          "Decentralize everything. Smart contracts, Web3, tokenization — build trustless systems for the future.",
        tag: "WEB3",
        color: "border-editorial-orange",
        accent: "text-editorial-orange",
      },
      {
        name: "STARTUP TRACK",
        description:
          "Open innovation. Any idea, any domain. Build something that could become the next big startup. Access funding up to ₹50 lakhs or more. Impress investors and incubators.",
        tag: "OPEN",
        color: "border-editorial-pink",
        accent: "text-editorial-pink",
      },
    ],
  },
  process: {
    steps: [
      {
        num: "01",
        title: "APPLY",
        desc: "Submit your application with your skills, experience, and what you want to build. It takes just 5 minutes to get started.",
      },
      {
        num: "02",
        title: "ONLINE 24-HOUR HACKATHON",
        desc: "Participate in an intense 24-hour online hackathon. Build, innovate, and showcase your skills from anywhere in India.",
      },
      {
        num: "03",
        title: "SCREENING OF TOP 1%",
        desc: "Our expert panel screens all submissions and selects the top 1% candidates — the elite builders who stand out.",
      },
      {
        num: "04",
        title: "30-HOUR HYBRID HACKATHON",
        desc: "The selected top 1% compete in a 30-hour hybrid hackathon. Build with mentors, APIs, and resources at your disposal.",
      },
      {
        num: "05",
        title: "DEMO DAY AND WINNER DECLARATION",
        desc: "Winner announcement, assured placement assistance for top finalists, award ceremony, and national recognition.",
      },
    ],
  },
  outcomes: {
    prize_pool_amount: "₹3 LAKHS+",
    prize_pool_sub: "Including Cash Prizes, Goodies, Swag Kits & More",
    prize_tags: [
      "💰 Cash Prizes",
      "🎁 Goodies",
      "👕 Swag Kits",
      "🏅 Certificates",
    ],
    outcomes: [
      {
        title: "₹3 LAKHS PRIZE POOL",
        desc: "Compete for a massive prize pool of ₹3 Lakhs including cash prizes and exciting goodies for top performers and winners.",
        accent: "border-editorial-pink",
      },
      {
        title: "ASSURED PLACEMENT ASSISTANCE",
        desc: "Top 1% selected finalists receive assured placement assistance with direct exposure to hiring companies actively looking for elite engineering talent.",
        accent: "border-editorial-blue",
      },
      {
        title: "STARTUP INCUBATION",
        desc: "Present your prototype to incubators and accelerators. Get considered for pre-seed funding and mentorship programs.",
        accent: "border-editorial-purple",
      },
      {
        title: "INVESTOR ACCESS",
        desc: "Pitch to angel investors and VCs during Demo Day. Get introductions that could change your startup journey.",
        accent: "border-editorial-green",
      },
    ],
  },
  faq: {
    faqs: [
      {
        q: "Who can participate in InnovaHack?",
        a: "Any student, working professional, or independent builder from India can apply. We welcome participants from all backgrounds — engineering, design, product, business.",
      },
      {
        q: "What is the team structure?",
        a: "You can participate solo, duo, trio, or quad (max 4 members). You can form your own team or opt for random team allocation during the hackathon.",
      },
      {
        q: "How does the selection process work?",
        a: "We review every application based on skills, experience, and potential. Only the top 1% teams (approximately 80–100 participants) are shortlisted for the final 30-hour hackathon.",
      },
      {
        q: "What is the ₹50 registration fee?",
        a: "The ₹50 is a non-refundable registration fee. It helps us filter serious applicants and ensures every participant in the final hackathon is genuinely committed to building something meaningful.",
      },
      {
        q: "What happens after the hackathon?",
        a: "Selected participants get exposure to hiring companies for fast-track interview opportunities, introductions to investors, and consideration for startup incubation programs.",
      },
      {
        q: "Do I need to have a startup idea?",
        a: "No. You can participate in any of the 5 domain tracks. The Startup Track is just one option — you can build solutions in Gen AI, FinTech, HealthTech, or Blockchain as well.",
      },
      {
        q: "Is food and accommodation provided?",
        a: "Details about venue, food, and accommodation will be shared with shortlisted participants. The hackathon is designed to be a premium, well-organized experience.",
      },
      {
        q: "Can I participate remotely?",
        a: "InnovaHack Chapter 1 is an in-person hackathon. We believe the best collaborations happen face-to-face. Location details will be announced soon.",
      },
    ],
  },
  fee: {
    fee_amount: "₹50",
    fee_label: "ONE-TIME REGISTRATION FEE (NON-REFUNDABLE)",
    location: "Mumbai, India",
    mode_r1: "Fully Online — participate from anywhere",
    mode_r2: "Hybrid — in-person in Mumbai or online",
    duration: "30 Hours of Non-Stop Hacking",
    roi_total: "₹45,000+",
    roi_multiplier: "900x ROI",
    roi_benefits: [
      {
        benefit: "Certificate of Participation",
        value: "Priceless",
        icon: "🎓",
      },
      {
        benefit: "Workshops & Mentorship Sessions",
        value: "₹5,000+",
        icon: "🧑‍🏫",
      },
      {
        benefit: "Hiring Exposure & Fast-Track Interviews",
        value: "₹10,000+",
        icon: "💼",
      },
      {
        benefit: "Investor Introductions & Pitch Access",
        value: "₹25,000+",
        icon: "🚀",
      },
      {
        benefit: "Startup Incubation & Funding Up to ₹50 Lakhs+",
        value: "Priceless",
        icon: "🏢",
      },
      {
        benefit: "National Recognition & Media Features",
        value: "Priceless",
        icon: "🏆",
      },
    ],
  },
  cta: {
    eyebrow: "LIMITED SEATS • TOP 1% ONLY",
    headline_line1: "READY TO",
    headline_line2: "BUILD?",
    description:
      "10,000 will apply. 100 will be chosen. Don't just watch from the sidelines — this is your shot at getting hired, getting funded, and getting noticed.",
    cta_primary: "APPLY NOW →",
    cta_secondary: "PARTNER WITH US",
  },
  settings: {
    sponsor_email: "sponsors@eliteforums.in",
    general_email: "hello@eliteforums.in",
    partnerships_email: "partnerships@eliteforums.in",
    twitter_url: "#",
    linkedin_url: "#",
    instagram_url: "#",
    event_date: "2026",
    event_location: "Mumbai, India",
    org_name: "Elite Forums",
    registration_fee: "₹50",
    registration_open: true,
  },
  about: {
    mission_title_line1: "THE",
    mission_title_line2: "MISSION",
    what_is_title: "INDIA'S LARGEST HIRING & STARTUP HACKATHON",
    what_is_body: [
      "InnovaHack is not just another hackathon — it's a curated, elite-level innovation event where the top 1% of India's builders come together to hack, get hired, and get funded.",
      "Over 30 intense hours, selected participants build real solutions across 5 cutting-edge domains: Generative AI, FinTech, HealthTech, Blockchain, and an Open Startup Track.",
      "What makes InnovaHack different? Every finalist gets direct access to hiring companies, investors, and incubators. This isn't about prizes — it's about life-changing opportunities: job offers, internships, incubation, and investment.",
    ],
    org_title: "ELITE FORUMS",
    org_body: [
      "Elite Forums is a community-driven organization that has hosted numerous tech meetups, hackathons, and industry events across India. We connect builders with opportunities.",
      "Our mission is to bridge the gap between talent and opportunity. Through InnovaHack, we bring together the best minds, the most innovative companies, and the boldest investors — all under one roof.",
      "We believe in transparency, community, and creating real impact. Every partner, sponsor, and participant gets genuine value from being part of the InnovaHack ecosystem.",
    ],
    stats: [
      { number: "10,000+", label: "APPLICANTS EXPECTED" },
      { number: "TOP 1%", label: "SELECTED BUILDERS" },
      { number: "30 HRS", label: "NON-STOP HACKING" },
      { number: "5", label: "DOMAIN TRACKS" },
      { number: "₹50", label: "REGISTRATION FEE" },
      { number: "100+", label: "HIRING COMPANIES" },
    ],
    transparency: [
      {
        title: "DATA ACCESS",
        desc: "We assure complete transparency with all partners and sponsors. They will receive data and access to all participants who consent to sharing their profiles.",
        accent: "border-editorial-blue",
      },
      {
        title: "REAL OPPORTUNITIES",
        desc: "Every finalist gets genuine benefits — job offers, internships, incubation opportunities, and investor introductions. No empty promises.",
        accent: "border-editorial-green",
      },
      {
        title: "COMMUNITY DRIVEN",
        desc: "Built by the community, for the community. Elite Forums has a track record of hosting impactful tech events and creating lasting connections.",
        accent: "border-editorial-purple",
      },
    ],
  },
  skills_list: {
    skills: [
      "React",
      "Node.js",
      "Python",
      "Machine Learning",
      "Blockchain",
      "Flutter",
      "AWS",
      "Figma",
      "Rust",
      "Go",
      "TypeScript",
      "Solidity",
      "TensorFlow",
      "Docker",
      "Kubernetes",
      "Swift",
      "Kotlin",
      "Java",
    ],
  },
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

type ContentMap = Record<string, Record<string, unknown>>;

type ContentContextValue = {
  content: ContentMap;
  isLoading: boolean;
  getSection: <T = Record<string, unknown>>(section: string) => T;
  refreshContent: () => Promise<void>;
  updateSection: (section: string, data: Record<string, unknown>) => void;
};

const ContentContext = createContext<ContentContextValue | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = useState<ContentMap>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(false);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchAllSiteContent();
      if (error || !data) {
        console.warn(
          "[ContentContext] Failed to load site content from Supabase, using defaults.",
          error?.message,
        );
        setIsLoading(false);
        return;
      }
      const merged: ContentMap = { ...DEFAULT_CONTENT };
      for (const row of data) {
        if (row.section && row.content) {
          // Smart merge: preserve arrays from defaults if Supabase doesn't have them
          const dbContent = row.content as Record<string, unknown>;
          const defaultSection = DEFAULT_CONTENT[row.section];
          
          if (defaultSection && typeof defaultSection === 'object') {
            const mergedSection = { ...defaultSection };
            for (const [key, value] of Object.entries(dbContent)) {
              // For key_facts specifically, merge arrays to preserve defaults
              if (key === 'key_facts' && Array.isArray(value) && Array.isArray((defaultSection as any).key_facts)) {
                // Keep the db version if it has the new facts, otherwise use default
                mergedSection[key] = value.length >= (defaultSection as any).key_facts.length ? value : (defaultSection as any).key_facts;
              } else {
                mergedSection[key] = value;
              }
            }
            merged[row.section] = mergedSection;
          } else {
            merged[row.section] = dbContent;
          }
        }
      }
      setContent(merged);
    } catch (err) {
      console.warn("[ContentContext] Unexpected error loading content:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // no deps — function is stable

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const getSection = useCallback(
    <T = Record<string, unknown>,>(section: string): T => {
      return (content[section] ?? DEFAULT_CONTENT[section] ?? {}) as T;
    },
    [content],
  );

  const updateSection = useCallback(
    (section: string, data: Record<string, unknown>) => {
      setContent((prev) => ({ ...prev, [section]: data }));
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      content,
      isLoading,
      getSection,
      refreshContent: loadContent,
      updateSection,
    }),
    [content, isLoading, getSection, loadContent, updateSection],
  );

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
};
