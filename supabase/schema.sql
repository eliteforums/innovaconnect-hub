-- ============================================================
-- InnovaHack 2026 — Supabase Database Schema
-- ============================================================
-- Run this file in your Supabase SQL Editor to set up the DB.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: registrations
-- Stores all participant registration submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Personal Details
  full_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  contact_no           TEXT NOT NULL,
  city                 TEXT NOT NULL,
  resume_url           TEXT,

  -- Academic Details
  organisation_name    TEXT NOT NULL,
  year_or_experience   TEXT NOT NULL,
  branch_or_department TEXT NOT NULL,

  -- Skills & Links
  skills               TEXT[]  DEFAULT '{}',
  github_url           TEXT,
  linkedin_url         TEXT,

  -- Team
  team_type            TEXT NOT NULL CHECK (team_type IN ('solo','duo','trio','quad')),
  team_members         JSONB   DEFAULT '[]'::JSONB,
  -- team_members is an array of objects:
  -- [{
  --   full_name, email, contact_no, city,
  --   organisation_name, year_or_experience, branch_or_department,
  --   skills[], github_url, linkedin_url
  -- }]

  -- Consent & Meta
  consent              BOOLEAN DEFAULT FALSE,
  status               TEXT    DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','rejected','confirmed')),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_email      ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_team_type  ON registrations (team_type);
CREATE INDEX IF NOT EXISTS idx_registrations_status     ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at DESC);

-- ============================================================
-- TABLE: contact_inquiries
-- Stores messages from the Contact / Email Us pages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT,
  category   TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_status     ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_inquiries (created_at DESC);

-- ============================================================
-- TABLE: site_content
-- Stores all editable site content managed via admin panel
-- Each row represents one section (keyed by `section`)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section    TEXT NOT NULL UNIQUE,
  content    JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content (section);

-- ============================================================
-- TABLE: sponsors
-- Stores sponsor / partner logos and metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  website_url TEXT,
  category    TEXT NOT NULL,
  -- e.g. 'title', 'gold', 'domain_ai', 'domain_fintech',
  --      'domain_healthtech', 'domain_blockchain', 'domain_startup',
  --      'hiring', 'tech', 'education', 'college', 'community'
  track       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_category ON sponsors (category);
CREATE INDEX IF NOT EXISTS idx_sponsors_active   ON sponsors (is_active);

-- ============================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or CLI)
-- ============================================================
-- Create a bucket named 'resumes' (private) for resume uploads.
-- Create a bucket named 'sponsors' (public) for sponsor logos.
-- See INSTRUCTIONS.md for details.

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE registrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors          ENABLE ROW LEVEL SECURITY;

-- ---- site_content: public read, admin write ----
DROP POLICY IF EXISTS "site_content_public_read" ON site_content;
CREATE POLICY "site_content_public_read"
  ON site_content FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "site_content_admin_write" ON site_content;
CREATE POLICY "site_content_admin_write"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ---- registrations: insert for everyone, read/update for admin only ----
DROP POLICY IF EXISTS "registrations_public_insert" ON registrations;
CREATE POLICY "registrations_public_insert"
  ON registrations FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "registrations_admin_read" ON registrations;
CREATE POLICY "registrations_admin_read"
  ON registrations FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "registrations_admin_update" ON registrations;
CREATE POLICY "registrations_admin_update"
  ON registrations FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "registrations_admin_delete" ON registrations;
CREATE POLICY "registrations_admin_delete"
  ON registrations FOR DELETE
  USING (auth.role() = 'authenticated');

-- ---- contact_inquiries: insert for everyone, read/update for admin only ----
DROP POLICY IF EXISTS "contact_public_insert" ON contact_inquiries;
CREATE POLICY "contact_public_insert"
  ON contact_inquiries FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "contact_admin_read" ON contact_inquiries;
CREATE POLICY "contact_admin_read"
  ON contact_inquiries FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "contact_admin_update" ON contact_inquiries;
CREATE POLICY "contact_admin_update"
  ON contact_inquiries FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ---- sponsors: public read, admin write ----
DROP POLICY IF EXISTS "sponsors_public_read" ON sponsors;
CREATE POLICY "sponsors_public_read"
  ON sponsors FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "sponsors_admin_write" ON sponsors;
CREATE POLICY "sponsors_admin_write"
  ON sponsors FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- FUNCTION: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_registrations_updated_at ON registrations;
CREATE TRIGGER trigger_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: Default site_content rows
-- NOTE: In PostgreSQL, a literal single quote inside a string
--       is escaped by doubling it: '' (two single quotes).
-- ============================================================

INSERT INTO site_content (section, content) VALUES (
  'hero',
  $json${
    "chapter": "CHAPTER 01 — 2026",
    "title_line1": "INNOVA",
    "title_line2": "HACK",
    "tagline": "India's Largest Hiring & Startup Hackathon",
    "description": "Hack. Get Hired. Get Funded. — A 30-hour elite hackathon where the top 200–250 teams of India's builders meet hiring companies, investors, and incubators.",
    "prize_pool": "₹50 LAKHS+",
    "prize_label": "Including Cash Prizes, Goodies & More",
    "placement_text": "Assured Placement Assistance to Top 200–250 Teams Selected Finalists",
    "ticker_text": "GENERATIVE AI • FINTECH • HEALTHTECH • BLOCKCHAIN • STARTUP TRACK • HACK. GET HIRED. GET FUNDED. • ",
    "key_facts": [
      {"number": "10,000+", "label": "APPLICANTS", "highlight": false},
      {"number": "TOP 200–250",  "label": "TEAMS SELECTED",   "highlight": false},
      {"number": "₹50 LAKHS+", "label": "PRIZE POOL — CASH, GOODIES & MORE", "highlight": true},
      {"number": "30 HRS",  "label": "OF HACKING",       "highlight": false},
      {"number": "₹50",   "label": "REGISTRATION FEE",  "highlight": false},
      {"number": "MUMBAI", "label": "LOCATION",           "highlight": false},
      {"number": "R1: ONLINE", "label": "R2: HYBRID",     "highlight": false},
      {"number": "₹50 LAKHS+", "label": "STARTUP FUNDING", "highlight": true}
    ],
    "cta_primary": "REGISTER NOW →",
    "cta_secondary": "PARTNER WITH US"
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'domains',
  $json${
    "domains": [
      {
        "name": "GENERATIVE AI",
        "description": "Build the next wave of AI-powered applications. From LLMs to creative AI — push the boundaries of what machines can create.",
        "tag": "AI/ML",
        "color": "border-editorial-purple",
        "accent": "text-editorial-purple"
      },
      {
        "name": "FINTECH",
        "description": "Reinvent how money moves. Payments, lending, insurance, DeFi — build solutions that disrupt traditional finance.",
        "tag": "FINANCE",
        "color": "border-editorial-blue",
        "accent": "text-editorial-blue"
      },
      {
        "name": "HEALTHTECH",
        "description": "Technology that saves lives. Digital health, diagnostics, telemedicine — solve real problems in healthcare delivery.",
        "tag": "HEALTH",
        "color": "border-editorial-green",
        "accent": "text-editorial-green"
      },
      {
        "name": "BLOCKCHAIN",
        "description": "Decentralize everything. Smart contracts, Web3, tokenization — build trustless systems for the future.",
        "tag": "WEB3",
        "color": "border-editorial-orange",
        "accent": "text-editorial-orange"
      },
      {
        "name": "STARTUP TRACK",
        "description": "Open innovation. Any idea, any domain. Build something that could become the next big startup. Access funding up to ₹50 lakhs or more. Impress investors and incubators.",
        "tag": "OPEN",
        "color": "border-editorial-pink",
        "accent": "text-editorial-pink"
      }
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'process',
  $json${
    "steps": [
      {
        "num": "01",
        "title": "APPLY",
        "desc": "Submit your application with your skills, experience, and what you want to build. It takes just 5 minutes to get started."
      },
      {
        "num": "02",
        "title": "ONLINE 24-HOUR HACKATHON",
        "desc": "Participate in an intense 24-hour online hackathon. Build, innovate, and showcase your skills from anywhere in India."
      },
      {
        "num": "03",
        "title": "SCREENING OF TOP 200–250 TEAMS",
        "desc": "Our expert panel screens all submissions and selects the top 200–250 teams — the elite builders who stand out."
      },
      {
        "num": "04",
        "title": "30-HOUR HYBRID HACKATHON",
        "desc": "The selected top 200–250 teams compete in a 30-hour hybrid hackathon. Build with mentors, APIs, and resources at your disposal."
      },
      {
        "num": "05",
        "title": "DEMO DAY AND WINNER DECLARATION",
        "desc": "Winner announcement, assured placement assistance for top finalists, award ceremony, and national recognition."
      }
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'outcomes',
  $json${
    "prize_pool_amount": "₹50 LAKHS+",
    "prize_pool_sub": "Including Cash Prizes, Goodies, Swag Kits & More",
    "prize_tags": ["💰 Cash Prizes", "🎁 Goodies", "👕 Swag Kits", "🏅 Certificates"],
    "outcomes": [
      {
        "title": "₹50 LAKHS+ PRIZE POOL",
        "desc": "Compete for a massive prize pool of ₹50 Lakhs+ including cash prizes and exciting goodies for top performers and winners.",
        "accent": "border-editorial-pink"
      },
      {
        "title": "ASSURED PLACEMENT ASSISTANCE",
        "desc": "Top 1% selected finalists receive assured placement assistance with direct exposure to hiring companies actively looking for elite engineering talent.",
        "accent": "border-editorial-blue"
      },
      {
        "title": "STARTUP INCUBATION & FUNDING UP TO ₹50 LAKHS+",
        "desc": "Present your prototype to incubators and accelerators. Get access to funding up to ₹50 lakhs or more for promising startup ideas, pre-seed funding, and mentorship programs.",
        "accent": "border-editorial-purple"
      },
      {
        "title": "INVESTOR ACCESS",
        "desc": "Pitch to angel investors and VCs during Demo Day. Get introductions that could change your startup journey.",
        "accent": "border-editorial-green"
      }
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'faq',
  $json${
    "faqs": [
      {
        "q": "Who can participate in InnovaHack?",
        "a": "Any student, working professional, or independent builder from India can apply. We welcome participants from all backgrounds — engineering, design, product, business."
      },
      {
        "q": "What is the team structure?",
        "a": "You can participate solo, duo, trio, or quad (max 4 members). You can form your own team or opt for random team allocation during the hackathon."
      },
      {
        "q": "How does the selection process work?",
        "a": "We review every application based on skills, experience, and potential. Only the top 1% teams (approximately 80–100 participants) are shortlisted for the final 30-hour hackathon."
      },
      {
        "q": "What is the ₹50 registration fee?",
        "a": "The ₹50 is a non-refundable registration fee. It helps us filter serious applicants and ensures every participant in the final hackathon is genuinely committed to building something meaningful."
      },
      {
        "q": "What happens after the hackathon?",
        "a": "Selected participants get exposure to hiring companies for fast-track interview opportunities, introductions to investors, and consideration for startup incubation programs."
      },
      {
        "q": "Do I need to have a startup idea?",
        "a": "No. You can participate in any of the 5 domain tracks. The Startup Track is just one option — you can build solutions in Gen AI, FinTech, HealthTech, or Blockchain as well."
      },
      {
        "q": "Is food and accommodation provided?",
        "a": "Details about venue, food, and accommodation will be shared with shortlisted participants. The hackathon is designed to be a premium, well-organized experience."
      },
      {
        "q": "Can I participate remotely?",
        "a": "InnovaHack Chapter 1 is an in-person hackathon. We believe the best collaborations happen face-to-face. Location details will be announced soon."
      }
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'fee',
  $json${
    "fee_amount": "₹50",
    "fee_label": "ONE-TIME REGISTRATION FEE (NON-REFUNDABLE)",
    "location": "Mumbai, India",
    "mode_r1": "Fully Online — participate from anywhere",
    "mode_r2": "Hybrid — in-person in Mumbai or online",
    "duration": "30 Hours of Non-Stop Hacking",
    "roi_total": "₹45,000+",
    "roi_multiplier": "900x ROI",
    "roi_benefits": [
      {"benefit": "Certificate of Participation",                  "value": "Priceless",   "icon": "🎓"},
      {"benefit": "Workshops & Mentorship Sessions",               "value": "₹5,000+",     "icon": "🧑‍🏫"},
      {"benefit": "Hiring Exposure & Fast-Track Interviews",       "value": "₹10,000+",    "icon": "💼"},
      {"benefit": "Investor Introductions & Pitch Access",         "value": "₹25,000+",    "icon": "🚀"},
      {"benefit": "Startup Incubation & Funding Up to ₹50 Lakhs+", "value": "₹5,000+",     "icon": "🏢"},
      {"benefit": "National Recognition & Media Features",         "value": "Priceless",   "icon": "🏆"}
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'cta',
  $json${
    "eyebrow": "LIMITED SEATS • TOP 1% ONLY",
    "headline_line1": "READY TO",
    "headline_line2": "BUILD?",
    "description": "10,000 will apply. 100 will be chosen. Don't just watch from the sidelines — this is your shot at getting hired, getting funded, and getting noticed.",
    "cta_primary": "APPLY NOW →",
    "cta_secondary": "PARTNER WITH US"
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'settings',
  $json${
    "sponsor_email": "sponsors@eliteforums.in",
    "general_email": "hello@eliteforums.in",
    "partnerships_email": "partnerships@eliteforums.in",
    "twitter_url": "#",
    "linkedin_url": "#",
    "instagram_url": "#",
    "event_date": "2026",
    "event_location": "Mumbai, India",
    "org_name": "Elite Forums",
    "registration_fee": "₹50",
    "registration_open": true,
    "login_enabled": false,
    "register_enabled": false
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'about',
  $json${
    "mission_title_line1": "THE",
    "mission_title_line2": "MISSION",
    "what_is_title": "INDIA'S LARGEST HIRING & STARTUP HACKATHON",
    "what_is_body": [
      "InnovaHack is not just another hackathon — it's a curated, elite-level innovation event where the top 1% of India's builders come together to hack, get hired, and get funded.",
      "Over 30 intense hours, selected participants build real solutions across 5 cutting-edge domains: Generative AI, FinTech, HealthTech, Blockchain, and an Open Startup Track.",
      "What makes InnovaHack different? Every finalist gets direct access to hiring companies, investors, and incubators. This isn't about prizes — it's about life-changing opportunities: job offers, internships, incubation, and investment."
    ],
    "org_title": "ELITE FORUMS",
    "org_body": [
      "Elite Forums is a community-driven organization that has hosted numerous tech meetups, hackathons, and industry events across India. We connect builders with opportunities.",
      "Our mission is to bridge the gap between talent and opportunity. Through InnovaHack, we bring together the best minds, the most innovative companies, and the boldest investors — all under one roof.",
      "We believe in transparency, community, and creating real impact. Every partner, sponsor, and participant gets genuine value from being part of the InnovaHack ecosystem."
    ],
    "stats": [
      {"number": "10,000+", "label": "APPLICANTS EXPECTED"},
      {"number": "TOP 1%",  "label": "SELECTED BUILDERS"},
      {"number": "30 HRS",  "label": "NON-STOP HACKING"},
      {"number": "5",       "label": "DOMAIN TRACKS"},
      {"number": "₹50",   "label": "REGISTRATION FEE"},
      {"number": "100+",   "label": "HIRING COMPANIES"}
    ],
    "transparency": [
      {
        "title": "DATA ACCESS",
        "desc": "We assure complete transparency with all partners and sponsors. They will receive data and access to all participants who consent to sharing their profiles.",
        "accent": "border-editorial-blue"
      },
      {
        "title": "REAL OPPORTUNITIES",
        "desc": "Every finalist gets genuine benefits — job offers, internships, incubation opportunities, and investor introductions. No empty promises.",
        "accent": "border-editorial-green"
      },
      {
        "title": "COMMUNITY DRIVEN",
        "desc": "Built by the community, for the community. Elite Forums has a track record of hosting impactful tech events and creating lasting connections.",
        "accent": "border-editorial-purple"
      }
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;


INSERT INTO site_content (section, content) VALUES (
  'skills_list',
  $json${
    "skills": [
      "React", "Node.js", "Python", "Machine Learning", "Blockchain",
      "Flutter", "AWS", "Figma", "Rust", "Go", "TypeScript", "Solidity",
      "TensorFlow", "Docker", "Kubernetes", "Swift", "Kotlin", "Java"
    ]
  }$json$::jsonb
) ON CONFLICT (section) DO NOTHING;
