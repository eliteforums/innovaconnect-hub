-- ════════════════════════════════════════════════════════════════════════════
--  InnovaHack Chapter 2 — complete database & storage setup (Supabase)
-- ════════════════════════════════════════════════════════════════════════════
--
--  HOW TO RUN
--    Supabase dashboard → SQL Editor → New query → paste this whole file → Run.
--    It is idempotent: safe to run again after updates, and it never deletes
--    data. Then set these environment variables on the website (e.g. Vercel):
--      SUPABASE_URL               = Project Settings → API → Project URL
--      SUPABASE_SERVICE_ROLE_KEY  = Project Settings → API → service_role key
--      ADMIN_USERNAME / ADMIN_PASSWORD  (dashboard login; defaults admin/admin)
--
--  SECURITY MODEL
--    The website talks to Supabase only from the server, with the service-role
--    key. Every table has row-level security ON and NO policies, and the anon /
--    authenticated roles have no table privileges — so the public anon key can
--    neither read nor write anything. Never expose the service-role key in the
--    browser.
--
--  WHAT IT CREATES
--    1. Form submissions:  interest_signups, registrations,
--                          partner_inquiries, contact_messages
--    2. Admin dashboard:   site_content (editable content),
--                          admin_sessions (sign-in sessions)
--    3. Storage:           public bucket "site-media" for uploaded images
--    4. Read-only views:   *_view tables that flatten submissions for browsing
--                          in the Supabase Table Editor
--    5. Seed data:         every page's content (26 sections) in site_content,
--                          so the whole site is editable in the admin panel.
--                          Existing rows are never overwritten.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. FORM SUBMISSIONS
--    One table per public form. The app writes {dedupe_key, email, payload};
--    `payload` holds the validated form fields as JSON. A unique dedupe_key
--    makes duplicate submissions fail with 409, which the site reports as
--    "already received".
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['interest_signups', 'registrations', 'partner_inquiries', 'contact_messages'] loop
    execute format($f$
      create table if not exists public.%1$I (
        id          uuid        primary key default gen_random_uuid(),
        created_at  timestamptz not null default now(),
        dedupe_key  text        not null unique,
        email       text        not null,
        payload     jsonb       not null
      );
      alter table public.%1$I enable row level security;
      create index if not exists %1$s_created_at_idx on public.%1$I (created_at desc);
      create index if not exists %1$s_email_idx      on public.%1$I (lower(email));
    $f$, t);

    -- Sanity constraints (added only once).
    if not exists (select 1 from pg_constraint where conname = t || '_payload_object') then
      execute format('alter table public.%I add constraint %I check (jsonb_typeof(payload) = ''object'')', t, t || '_payload_object');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_email_length') then
      execute format('alter table public.%I add constraint %I check (char_length(email) between 3 and 254)', t, t || '_email_length');
    end if;
    if not exists (select 1 from pg_constraint where conname = t || '_dedupe_key_length') then
      execute format('alter table public.%I add constraint %I check (char_length(dedupe_key) between 1 and 300)', t, t || '_dedupe_key_length');
    end if;
  end loop;
end $$;

comment on table public.interest_signups  is 'Event update list sign-ups (/register#updates). Deduplicated by email.';
comment on table public.registrations     is 'Team registrations (/register, only while registration is open). Deduplicated by team lead email.';
comment on table public.partner_inquiries is 'Partnership / sponsorship inquiries (/partners).';
comment on table public.contact_messages  is 'Contact form messages (/contact).';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. ADMIN DASHBOARD
-- ────────────────────────────────────────────────────────────────────────────

-- Editable site content: one JSON document per section (e.g. "event",
-- "copy.home"). Saved sections override the built-in defaults in the code;
-- deleting a row restores the default for that section.
create table if not exists public.site_content (
  key         text        primary key,
  value       jsonb       not null,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_content_key_format') then
    alter table public.site_content
      add constraint site_content_key_format check (key ~ '^[a-zA-Z0-9._-]{1,64}$');
  end if;
end $$;

comment on table public.site_content is 'Admin-edited content sections, merged over the defaults in src/content/.';

-- Keep updated_at current, including for edits made directly in Supabase.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before insert or update on public.site_content
  for each row execute function public.touch_updated_at();

-- Admin sign-in sessions. Only the SHA-256 hash of each session token is
-- stored, never the token itself.
create table if not exists public.admin_sessions (
  token_hash  text        primary key,
  username    text        not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
alter table public.admin_sessions enable row level security;
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

comment on table public.admin_sessions is 'Admin dashboard sessions (hashed tokens). Expired rows are purged automatically.';

-- Remove expired sessions. Runs automatically on every sign-in (trigger
-- below); can also be called manually: select public.purge_expired_admin_sessions();
create or replace function public.purge_expired_admin_sessions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.admin_sessions where expires_at <= now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function public.admin_sessions_purge_on_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.purge_expired_admin_sessions();
  return new;
end;
$$;

drop trigger if exists admin_sessions_purge on public.admin_sessions;
create trigger admin_sessions_purge
  before insert on public.admin_sessions
  for each statement execute function public.admin_sessions_purge_on_insert();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. STORAGE — images uploaded in the admin dashboard
--    Public bucket: anyone can view an image by its URL (that is how the site
--    displays them). Uploads and deletes happen only on the server with the
--    service-role key, so no storage policies are needed. Limits match the
--    app: 5 MB, JPEG / PNG / WebP / GIF / AVIF.
-- ────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. READ-ONLY VIEWS for browsing submissions in the Supabase Table Editor
--    security_invoker = on means the views obey the same access rules as the
--    tables, so they expose nothing to the public API.
-- ────────────────────────────────────────────────────────────────────────────

create or replace view public.registrations_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload #>> '{team,name}'            as team_name,
  payload #>> '{domain}'               as domain,
  payload #>> '{lead,fullName}'        as lead_name,
  payload #>> '{lead,email}'           as lead_email,
  payload #>> '{lead,phone}'           as lead_phone,
  payload #>> '{lead,organization}'    as organization,
  payload #>> '{lead,city}'            as city,
  payload #>> '{lead,state}'           as state,
  jsonb_array_length(coalesce(payload #> '{team,members}', '[]'::jsonb)) + 1 as team_size,
  payload #>> '{project,title}'        as project_title,
  payload #>> '{project,summary}'      as project_summary,
  payload #>> '{project,repoUrl}'      as repo_url,
  payload #>> '{project,demoUrl}'      as demo_url,
  (payload #>> '{consents,updates}')::boolean as wants_updates,
  payload                               as raw
from public.registrations;

create or replace view public.interest_signups_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'name'          as name,
  email,
  payload ->> 'organization'  as organization,
  payload ->> 'interest'      as interest
from public.interest_signups;

create or replace view public.partner_inquiries_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'organization'  as organization,
  payload ->> 'category'      as category,
  payload ->> 'contactName'   as contact_name,
  payload ->> 'contactRole'   as contact_role,
  email,
  payload ->> 'interest'      as interest,
  payload ->> 'contribution'  as contribution,
  payload ->> 'challenge'     as challenge,
  payload ->> 'message'       as message
from public.partner_inquiries;

create or replace view public.contact_messages_view
with (security_invoker = on) as
select
  id,
  created_at,
  payload ->> 'name'     as name,
  email,
  payload ->> 'topic'    as topic,
  payload ->> 'message'  as message
from public.contact_messages;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. PRIVILEGES
--    Lock everything to the server (service_role). RLS already blocks the
--    public roles; revoking privileges is a second, independent barrier.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  obj text;
begin
  foreach obj in array array[
    'interest_signups', 'registrations', 'partner_inquiries', 'contact_messages',
    'site_content', 'admin_sessions',
    'registrations_view', 'interest_signups_view', 'partner_inquiries_view', 'contact_messages_view'
  ] loop
    execute format('revoke all on public.%I from anon, authenticated', obj);
    execute format('grant select, insert, update, delete on public.%I to service_role', obj);
  end loop;
end $$;

revoke all on function public.purge_expired_admin_sessions() from public, anon, authenticated;
grant execute on function public.purge_expired_admin_sessions() to service_role;
revoke all on function public.admin_sessions_purge_on_insert() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

commit;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. SEED DATA — the whole website's content
-- ────────────────────────────────────────────────────────────────────────────

-- >>> SEED: site content (generated by `npm run db:seed-sql` — do not edit by hand)

-- Every editable section of the website, as it ships. Existing rows are left

-- untouched, so running this file again never overwrites dashboard edits.

-- To restore one section to this seed, use "Reset to default" in the

-- dashboard (or delete its row) and run the file again.

begin;

-- Event settings
insert into public.site_content (key, value) values ('event', $seed${
  "name": "InnovaHack",
  "fullName": "InnovaHack Chapter 2",
  "organizer": "Elite Forums",
  "chapterNumber": 2,
  "chapterLabel": "Chapter 02",
  "year": {
    "value": 2027,
    "status": "planned"
  },
  "scope": {
    "value": "Pan-India",
    "status": "planned"
  },
  "format": {
    "value": "Hybrid national hackathon",
    "status": "planned",
    "note": "Nationwide online participation and selection, followed by an offline national grand finale."
  },
  "tagline": "Rooted in Mumbai. Built for India. Designed for the future.",
  "description": "InnovaHack Chapter 2 is a pan-India hybrid hackathon planned for 2027, bringing AI innovators and startup builders together to turn ideas into useful solutions.",
  "announcement": [
    "Elite Forums presents",
    "India",
    "Chapter 02",
    "2027"
  ],
  "editionLine": [
    "India",
    "2027",
    "Hybrid national hackathon"
  ],
  "registration": {
    "status": "interest",
    "opensOn": {
      "value": null,
      "status": "unconfirmed"
    },
    "closesOn": {
      "value": null,
      "status": "unconfirmed"
    },
    "fee": {
      "value": null,
      "status": "unconfirmed",
      "note": "Any participation fee will be published in the official rules before registration opens."
    }
  },
  "venue": {
    "value": null,
    "status": "unconfirmed",
    "note": "The grand finale venue has not been announced."
  },
  "teamSize": {
    "min": null,
    "max": null,
    "status": "unconfirmed",
    "note": "Team-size rules will be published in the official rules."
  },
  "formTeamMemberLimit": 8,
  "prizePool": {
    "value": "₹1,00,000",
    "status": "confirmed",
    "note": "Total of the three confirmed per-team cash tiers."
  },
  "awards": [
    {
      "title": "Tier 1",
      "kind": "cash",
      "value": "₹10,000 per team",
      "winnerCount": 3,
      "venue": "The Taj Mahal Palace",
      "story": "A defining Mumbai landmark on the waterfront.",
      "image": {
        "src": "tajPalace",
        "alt": "The Taj Mahal Palace in Mumbai, with its red domes and ornate waterfront facade.",
        "position": "50% 60%"
      },
      "eligibility": "3 winning teams",
      "conditions": "₹10,000 is awarded to each winning team."
    },
    {
      "title": "Tier 2",
      "kind": "cash",
      "value": "₹6,000 per team",
      "winnerCount": 5,
      "venue": "Leopold Cafe",
      "story": "Leopold Cafe in Colaba was among the places targeted during the [26/11 Mumbai attacks](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=45446). Its [bullet marks](https://indianexpress.com/article/cities/mumbai/a-new-wing-at-leopold-for-extra-rush-since-attack/) became a reminder of those affected and of Mumbai's resilience.",
      "image": {
        "src": "leopoldCafe",
        "alt": "The red Leopold Cafe and Bar sign above its entrance in Colaba, Mumbai.",
        "position": "50% 35%"
      },
      "eligibility": "5 winning teams",
      "conditions": "₹6,000 is awarded to each winning team."
    },
    {
      "title": "Tier 3",
      "kind": "cash",
      "value": "₹4,000 per team",
      "winnerCount": 10,
      "venue": "Jain Chawal Wale · Juhu",
      "story": "One of Juhu's best-known places for Mumbai street food.",
      "image": {
        "src": "jainChawalWale",
        "alt": "The Jain Chawal Wale food stall in Juhu, Mumbai, lit up at night.",
        "position": "50% 40%"
      },
      "eligibility": "10 winning teams",
      "conditions": "₹4,000 is awarded to each winning team."
    }
  ],
  "partners": [],
  "contact": {
    "general": {
      "value": null,
      "status": "unconfirmed"
    },
    "partnerships": {
      "value": "sponsors@eliteforums.in",
      "status": "advertised",
      "note": "Partnership address published on the Chapter 1 website."
    }
  },
  "social": [],
  "journey": [
    {
      "id": "register",
      "station": "Registration",
      "title": "Registration & team formation",
      "description": "Sign up, form your team and choose one of the two official domains.",
      "mode": "Online",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "idea",
      "station": "Idea",
      "title": "Idea submission",
      "description": "Submit the problem you are solving and the approach you plan to take.",
      "mode": "Online",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "screening",
      "station": "Screening",
      "title": "Screening & evaluation",
      "description": "Submissions are reviewed against the published evaluation criteria.",
      "mode": "Online",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "sprint",
      "station": "Build Sprint",
      "title": "Online build sprint & mentor interactions",
      "description": "Shortlisted teams build their solutions, with mentor sessions where available.",
      "mode": "Online",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "semifinal",
      "station": "Semifinal",
      "title": "Semifinal selection",
      "description": "Teams are selected to advance to the national finale.",
      "mode": "Online",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "finale",
      "station": "Grand Finale",
      "title": "Offline national grand finale",
      "description": "Finalists build, demo and present in person. Venue to be announced.",
      "mode": "In person",
      "date": null,
      "status": "proposed"
    },
    {
      "id": "follow-up",
      "station": "Follow-up",
      "title": "Post-event follow-up & opportunities",
      "description": "Results, recognition and any partner opportunities that are confirmed for the edition.",
      "mode": "Hybrid",
      "date": null,
      "status": "proposed"
    }
  ],
  "participation": [
    {
      "label": "Registrations",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "Team registrations",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "Completed submissions",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "Colleges represented",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "States & UTs represented",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "Finalist teams",
      "value": null,
      "status": "unconfirmed"
    },
    {
      "label": "Confirmed partners",
      "value": null,
      "status": "unconfirmed"
    }
  ],
  "showDraftArticles": true
}$seed$::jsonb)
on conflict (key) do nothing;

-- Competition domains
insert into public.site_content (key, value) values ('domains', $seed${
  "list": [
    {
      "slug": "artificial-intelligence",
      "number": "01",
      "name": "Artificial Intelligence",
      "shortName": "AI Track",
      "headline": "Build beyond the ordinary.",
      "summary": "Create intelligent solutions using emerging AI capabilities to address meaningful real-world problems.",
      "description": "In InnovaHack Chapter 2's AI hackathon track, teams build solutions where a model, agent or learning system is the core of the innovation and solves a real-world problem.",
      "cta": "Explore the AI track",
      "accent": "violet",
      "areas": [
        "Generative AI",
        "Large language models",
        "AI agents & agentic workflows",
        "Machine learning",
        "Natural language processing",
        "Computer vision",
        "Multimodal AI",
        "Intelligent automation",
        "AI-powered enterprise applications",
        "Applied AI for real-world challenges"
      ],
      "challengeThemes": [
        "Education",
        "Healthcare access",
        "FinTech",
        "Agriculture",
        "Civic services",
        "Cybersecurity",
        "Climate & sustainability",
        "Accessibility & Indian languages"
      ],
      "chooseIf": [
        "An AI model, agent or learning system is the heart of your solution.",
        "Your solution would not work without its AI component.",
        "You want your work evaluated on how well it applies AI to a real problem."
      ],
      "aiPolicy": "AI is the core of every submission in this domain.",
      "prompts": [
        "How could an agent take a repetitive, multi-step task off someone's plate — safely?",
        "Where would a model that understands Indian languages remove a real barrier?",
        "What decision could be made faster or fairer with better use of existing data?"
      ],
      "media": {
        "illustration": "ai",
        "photo": {
          "src": "aiDomain",
          "alt": "Artwork of a human profile made of violet network lines, listing generative AI, ML, agents, computer vision and NLP.",
          "credit": "Artwork · Artificial Intelligence domain",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        },
        "alt": "Editorial illustration of a neural network diagram with violet nodes and connecting lines.",
        "credit": "Illustration · InnovaHack design system"
      }
    },
    {
      "slug": "open-innovation",
      "number": "02",
      "name": "Open Innovation / Startup Track",
      "shortName": "Startup Track",
      "headline": "Turn ideas into reality.",
      "summary": "Build original products, solve real-world problems, and transform ambitious ideas into practical, scalable innovations.",
      "description": "In InnovaHack Chapter 2's startup hackathon track, teams build original products, services or business concepts. AI is welcome, but never required.",
      "cta": "Explore the startup track",
      "accent": "burgundy",
      "areas": [
        "SaaS & software products",
        "Startup MVPs",
        "FinTech applications",
        "Civic technology",
        "Education technology",
        "Agriculture & climate solutions",
        "Business productivity",
        "Community problem-solving",
        "Novel technology products & business models"
      ],
      "challengeThemes": [
        "FinTech",
        "Education",
        "Agriculture",
        "Civic & community tech",
        "Climate & sustainability",
        "Productivity",
        "Cybersecurity",
        "Small business tools"
      ],
      "chooseIf": [
        "The product, service or business model is the core of your innovation.",
        "AI is one ingredient — or not part of your solution at all.",
        "You want your work evaluated as a product others could adopt."
      ],
      "aiPolicy": "AI is permitted but not compulsory in this domain.",
      "prompts": [
        "What everyday process in your city still runs on paper, queues or phone calls?",
        "Which small business problem is too small for big companies but painful for millions?",
        "What would a first version look like if you had to ship it in a weekend?"
      ],
      "media": {
        "illustration": "startup",
        "photo": {
          "src": "startupDomain",
          "alt": "A laptop, a coffee cup and hand-drawn app wireframes on a desk by a window.",
          "credit": "Artwork · Open Innovation / Startup domain",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        },
        "alt": "Editorial illustration of a notebook with product wireframes, sticky notes and a light bulb.",
        "credit": "Illustration · InnovaHack design system"
      }
    }
  ],
  "rules": [
    "Chapter 2 has exactly two official competition domains.",
    "AI may be used in both domains.",
    "Choose Artificial Intelligence when AI technology is the core of your innovation.",
    "Choose Open Innovation / Startup when the broader product, service or business concept is the core. AI is optional.",
    "Sector themes such as FinTech, education, agriculture, cybersecurity, climate and civic technology are challenge themes within the two domains — not additional domains."
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Chapter 1 archive
insert into public.site_content (key, value) values ('chapter1', $seed${
  "year": 2026,
  "label": "Chapter 01 · 2026 · Inaugural edition",
  "title": "InnovaHack Chapter 1 — The First Edition, 2026",
  "location": "Mumbai, India, as named in the original Chapter 1 event materials.",
  "metrics": [
    {
      "value": "10,000+",
      "label": "Applications",
      "caption": "Applications reported for the first edition.",
      "status": "reported"
    },
    {
      "value": "170",
      "label": "Finalist teams",
      "caption": "Finalist teams reported in the Chapter 1 post-event recap.",
      "status": "reported"
    },
    {
      "value": "₹50 Lakh+",
      "label": "Advertised total reward pool",
      "caption": "Chapter 1's promoted overall prize and reward pool, including cash prizes and other benefits.",
      "status": "advertised"
    },
    {
      "value": "30 Hours",
      "label": "Final hackathon",
      "caption": "Advertised duration of the hybrid final hackathon.",
      "status": "advertised"
    }
  ],
  "context": [
    {
      "value": "24 Hours",
      "label": "Online qualifier",
      "caption": "Advertised duration of the online qualifying hackathon — a separate stage from the 30-hour final.",
      "status": "advertised"
    },
    {
      "value": "₹1 Crore+",
      "label": "Startup funding opportunity",
      "caption": "Advertised as an opportunity. This is not a record of funding invested or disbursed.",
      "status": "advertised"
    },
    {
      "value": "200–250",
      "label": "Planned shortlist",
      "caption": "The number of teams the original website planned to select. The reported finalist total was 170.",
      "status": "advertised"
    }
  ],
  "domains": [
    {
      "name": "Generative AI",
      "description": "AI-powered applications, from LLM-based solutions to creative AI."
    },
    {
      "name": "FinTech",
      "description": "Payments, lending, insurance and personal finance."
    },
    {
      "name": "Cybersecurity",
      "description": "Threat detection, data protection, secure authentication and online safety."
    },
    {
      "name": "Agentic AI",
      "description": "AI agents, multi-agent systems and intelligent automation."
    },
    {
      "name": "Startup Track (Open Innovation)",
      "description": "Any innovative product or service, in any domain."
    }
  ],
  "domainsNote": "As listed on the Chapter 1 tracks page. Some earlier promotional copy listed HealthTech and Blockchain among the tracks.",
  "structure": [
    {
      "title": "Application",
      "description": "Participants applied with their skills, experience and what they wanted to build."
    },
    {
      "title": "24-hour online hackathon",
      "description": "An online qualifying hackathon open to applicants from anywhere in India."
    },
    {
      "title": "Screening",
      "description": "Submissions were screened to select finalist teams. The website planned a 200–250 team shortlist; 170 finalist teams were reported."
    },
    {
      "title": "30-hour hybrid hackathon",
      "description": "Finalists competed in a 30-hour hybrid final — in person in Mumbai or online, as advertised."
    },
    {
      "title": "Demo day & winner declaration",
      "description": "Presentations, winner announcement and award ceremony."
    }
  ],
  "winners": [],
  "partners": [],
  "judgesAndMentors": [],
  "gallery": [],
  "links": [
    {
      "label": "Original Chapter 1 website",
      "url": "https://innovahack.eliteforums.in/"
    },
    {
      "label": "Chapter 1 event page on Devnovate",
      "url": "https://devnovate.co/event/innovahack-chapter-1"
    }
  ],
  "carriedForward": [
    {
      "title": "From five tracks to two domains",
      "body": "Chapter 1 ran several sector tracks. Chapter 2 focuses on two official domains — Artificial Intelligence, and Open Innovation / Startup — with sector themes living inside them."
    },
    {
      "title": "A national journey",
      "body": "Chapter 2 is planned as a pan-India hybrid event: nationwide online participation and selection, followed by an offline national grand finale."
    },
    {
      "title": "Clear stages, clearly labelled",
      "body": "Qualifier, sprint and finale are presented as separate stages, and every date and prize is published only once it is confirmed."
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Build Log articles
insert into public.site_content (key, value) values ('articles', $seed$[
  {
    "slug": "introducing-innovahack-chapter-2",
    "headline": "Two domains. One national stage.",
    "summary": "InnovaHack returns for its second edition as a pan-India hybrid hackathon focused on Artificial Intelligence and Open Innovation.",
    "category": "Announcement",
    "publishedOn": null,
    "author": "Elite Forums",
    "draft": true,
    "media": {
      "illustration": "taxi",
      "photo": {
        "src": "bmcTaxi",
        "alt": "A black-and-yellow Premier Padmini taxi in front of the Brihanmumbai Municipal Corporation headquarters.",
        "credit": "Photo · Taxi outside the BMC headquarters, Mumbai",
        "license": "Supplied by the organizer — usage rights to be confirmed",
        "approved": true,
        "position": "50% 80%"
      },
      "alt": "Illustration of a black-and-yellow Mumbai taxi.",
      "credit": "Illustration · black-and-yellow taxi"
    },
    "body": [
      {
        "type": "p",
        "text": "InnovaHack, the national hackathon organized by Elite Forums, is planning its second edition for 2027. Chapter 2 is designed as a pan-India hybrid event: nationwide online participation and selection, followed by an offline national grand finale."
      },
      {
        "type": "h2",
        "text": "Two official domains"
      },
      {
        "type": "p",
        "text": "Where Chapter 1 ran several sector tracks, Chapter 2 focuses on exactly two official competition domains:"
      },
      {
        "type": "list",
        "items": [
          "Domain 01 — Artificial Intelligence: for teams whose innovation is the AI itself, from generative AI and agents to computer vision and applied machine learning.",
          "Domain 02 — Open Innovation / Startup Track: for original products, platforms and startup ideas. AI is welcome but not required."
        ]
      },
      {
        "type": "p",
        "text": "Themes such as FinTech, education, agriculture, climate and civic technology are welcome inside both domains as challenge themes."
      },
      {
        "type": "h2",
        "text": "What is still to be announced"
      },
      {
        "type": "p",
        "text": "The event dates, grand finale venue, team-size rules and partners will be published once they are confirmed. Join the update list to hear first."
      }
    ]
  },
  {
    "slug": "choosing-your-domain",
    "headline": "AI track or startup track? How to choose.",
    "summary": "Both domains welcome AI. The difference is what sits at the core of your innovation.",
    "category": "Guide",
    "publishedOn": null,
    "author": "Elite Forums",
    "draft": true,
    "media": {
      "illustration": "ai",
      "photo": {
        "src": "aiDomain",
        "alt": "Artwork of a human profile made of violet network lines, listing generative AI, ML, agents, computer vision and NLP.",
        "credit": "Artwork · Artificial Intelligence domain",
        "license": "Supplied by the organizer — usage rights to be confirmed",
        "approved": true
      },
      "alt": "Illustration of a neural network diagram.",
      "credit": "Illustration · InnovaHack design system"
    },
    "body": [
      {
        "type": "p",
        "text": "Every Chapter 2 team enters one of two official domains. Because AI can be used in both, the choice comes down to a single question: what is the core of your innovation?"
      },
      {
        "type": "h2",
        "text": "Choose Artificial Intelligence if…"
      },
      {
        "type": "list",
        "items": [
          "a model, an agent or a learning system is the heart of your solution;",
          "your solution would not work without its AI component;",
          "you want to be evaluated on how well you apply AI to a real problem."
        ]
      },
      {
        "type": "h2",
        "text": "Choose Open Innovation / Startup if…"
      },
      {
        "type": "list",
        "items": [
          "the product, service or business concept is the core of your innovation;",
          "AI is one ingredient — or not part of your solution at all;",
          "you want to be evaluated on the product as something others could adopt."
        ]
      },
      {
        "type": "quote",
        "text": "AI is permitted but not compulsory in the Open Innovation / Startup Track."
      },
      {
        "type": "p",
        "text": "Official evaluation criteria for each domain will be published in the competition rules."
      }
    ]
  },
  {
    "slug": "chapter-1-by-the-numbers",
    "headline": "Chapter 1, by the numbers — and what they mean.",
    "summary": "A careful look at the first edition's figures: what was reported, and what was advertised.",
    "category": "Chapter 1",
    "publishedOn": null,
    "author": "Elite Forums",
    "draft": true,
    "media": {
      "illustration": "station",
      "photo": {
        "src": "csmt",
        "alt": "Chhatrapati Shivaji Maharaj Terminus lit up at dusk, with BEST buses passing in front.",
        "credit": "Photo · Chhatrapati Shivaji Maharaj Terminus (CSMT) at dusk",
        "license": "Supplied by the organizer — usage rights to be confirmed",
        "approved": true
      },
      "alt": "Illustration of Victorian Gothic railway architecture.",
      "credit": "Illustration inspired by Victorian Gothic railway architecture"
    },
    "body": [
      {
        "type": "p",
        "text": "The first InnovaHack, in 2026, set the foundation for Chapter 2. Here is what the record shows — with each figure labelled for what it is."
      },
      {
        "type": "list",
        "items": [
          "10,000+ applications were reported for the first edition. Applications are not the same as individual attendees.",
          "170 finalist teams were reported in the post-event recap. The original website had planned a 200–250 team shortlist.",
          "₹50 lakh+ was the advertised total reward pool, including cash prizes and other benefits — not a record of cash paid out.",
          "The final was advertised as a 30-hour hybrid hackathon, after a separate 24-hour online qualifier."
        ]
      },
      {
        "type": "p",
        "text": "The full archive — including the original domains and competition structure — is on the Chapter 1 page."
      }
    ]
  }
]$seed$::jsonb)
on conflict (key) do nothing;

-- FAQ
insert into public.site_content (key, value) values ('faq', $seed$[
  {
    "title": "The event",
    "items": [
      {
        "q": "What is InnovaHack Chapter 2?",
        "a": "The second edition of InnovaHack, a national hackathon organized by Elite Forums. It is planned for 2027 as a pan-India hybrid event, combining nationwide online participation and selection with an offline national grand finale."
      },
      {
        "q": "Is InnovaHack only for people in Mumbai?",
        "a": "No. Mumbai inspires the visual identity of this edition, but InnovaHack Chapter 2 is a pan-India event designed for builders across the country. The grand finale venue has not been announced."
      },
      {
        "q": "When and where is Chapter 2?",
        "a": "Dates and the grand finale venue have not been confirmed yet. They will be published on the Timeline page and announced to the update list."
      },
      {
        "q": "Who organizes InnovaHack?",
        "a": "Elite Forums organizes InnovaHack. Chapter 1 took place in 2026."
      }
    ]
  },
  {
    "title": "Domains",
    "items": [
      {
        "q": "How many competition domains are there?",
        "a": "Exactly two: Artificial Intelligence, and Open Innovation / Startup Track. Sector themes such as FinTech, education or climate are challenge themes within these two domains, not separate domains."
      },
      {
        "q": "Can I use AI in the Open Innovation / Startup Track?",
        "a": "Yes. AI is permitted but not compulsory in the Open Innovation / Startup Track."
      },
      {
        "q": "Which domain should my team choose?",
        "a": "Choose Artificial Intelligence when AI technology is the core of your innovation. Choose Open Innovation / Startup when the broader product, service or business concept is the core."
      }
    ]
  },
  {
    "title": "Participation",
    "items": [
      {
        "q": "Who can participate, and how big can teams be?",
        "a": "Eligibility and team-size rules have not been published yet. They will be set out in the official rules before registration opens."
      },
      {
        "q": "Is there a participation fee?",
        "a": "Any fee will be published in the official rules before registration opens. Nothing is charged to join the update list."
      },
      {
        "q": "How do I register?",
        "a": "Registration is not open yet. Join the update list on the Register page and you will be notified when it opens."
      }
    ]
  },
  {
    "title": "Prizes & partners",
    "items": [
      {
        "q": "What are the Chapter 2 prizes?",
        "a": "There are three cash tiers: 3 winning teams receive ₹10,000 each, 5 receive ₹6,000 each, and 10 receive ₹4,000 each. Amounts are per team."
      },
      {
        "q": "Are Chapter 1 sponsors part of Chapter 2?",
        "a": "Only partners confirmed for Chapter 2 appear on the Partners page. Chapter 1 partners belong to the Chapter 1 archive."
      },
      {
        "q": "How can my organization partner with InnovaHack?",
        "a": "Use the partnership inquiry form on the Partners page. The team will follow up with partnership options."
      }
    ]
  }
]$seed$::jsonb)
on conflict (key) do nothing;

-- Rules
insert into public.site_content (key, value) values ('rules', $seed${
  "published": false,
  "version": null,
  "effectiveFrom": null,
  "confirmed": [
    "InnovaHack Chapter 2 has exactly two official competition domains: Artificial Intelligence, and Open Innovation / Startup Track.",
    "Each team enters one domain.",
    "AI may be used in both domains. In the Open Innovation / Startup Track, AI is permitted but not compulsory.",
    "Sector themes (for example FinTech, education, agriculture, cybersecurity, climate and civic technology) are challenge themes within the two domains, not additional domains."
  ],
  "pendingTopics": [
    {
      "title": "Eligibility",
      "body": "Who can take part, and any age, student or residency requirements."
    },
    {
      "title": "Teams",
      "body": "Minimum and maximum team size, and whether changes are allowed after registration."
    },
    {
      "title": "Fees",
      "body": "Whether any participation fee applies, and at which stage."
    },
    {
      "title": "Stages & deadlines",
      "body": "Dates, submission requirements and advancement for each stage of the journey."
    },
    {
      "title": "Original work",
      "body": "What may be built before the event, use of open-source code, third-party APIs and AI tools."
    },
    {
      "title": "Evaluation",
      "body": "Judging criteria and weightings for each domain."
    },
    {
      "title": "Intellectual property",
      "body": "Who owns what teams build, and any licensing expectations."
    },
    {
      "title": "Conduct",
      "body": "The code of conduct and how concerns are reported and handled."
    },
    {
      "title": "Awards",
      "body": "Award categories, eligibility, conditions and how prizes are delivered."
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Mumbai stories
insert into public.site_content (key, value) values ('city', $seed${
  "sidebar": [
    {
      "id": "coastline",
      "label": "The coastline",
      "title": "The city that never stops building.",
      "caption": "Along the coast, ideas keep moving.",
      "context": "Marine Drive is the promenade curving along Back Bay in South Mumbai. Marine Lines is the nearby locality and railway station of the same name.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "marineDriveSunset",
          "alt": "Marine Drive at sunset: the curved seafront lined with streetlights and tall buildings.",
          "credit": "Image · Marine Drive at sunset",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "72% 50%"
        },
        "illustration": "coast",
        "alt": "Illustration of a curved seaside promenade lined with streetlights and low buildings at sunset, inspired by Marine Drive.",
        "credit": "Illustration inspired by Marine Drive"
      }
    },
    {
      "id": "flavours",
      "label": "The flavours",
      "title": "Iconic flavours. Bolder ideas.",
      "caption": "Different ingredients. One unforgettable identity.",
      "context": "Vada pav, misal pav and pav bhaji — three of the street-food staples Mumbai is known for.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "vadaPav",
          "alt": "A vada pav: a spiced potato fritter in a soft bread roll with chutney.",
          "credit": "Photo · Vada pav",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        },
        "illustration": "vadaPav",
        "alt": "Illustration of a vada pav: a fried potato fritter in a soft bread roll with chutney and a green chilli.",
        "credit": "Illustration · vada pav"
      }
    },
    {
      "id": "streets",
      "label": "The streets",
      "title": "Same streets. New solutions.",
      "caption": "Familiar ingredients, new combinations.",
      "context": "Pav bhaji — buttery vegetable mash with toasted pav, a Mumbai street-food staple.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "pavBhaji",
          "alt": "Pav bhaji on a steel plate with buttered pav, chopped onion and lemon.",
          "credit": "Photo · Pav bhaji · Shweta in the Kitchen",
          "license": "Third-party watermark (Shweta in the Kitchen) — permission required",
          "approved": true,
          "position": "50% 45%"
        },
        "illustration": "pavBhaji",
        "alt": "Illustration of pav bhaji.",
        "credit": "Illustration · pav bhaji"
      }
    },
    {
      "id": "culture",
      "label": "Kala Ghoda",
      "title": "A city of creators.",
      "caption": "Where ideas meet art and imagination.",
      "context": "Kala Ghoda is South Mumbai's art precinct, home to galleries, museums and an annual arts festival.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "kalaGhodaHorse",
          "alt": "The black horse sculpture at Kala Ghoda on its stone plinth with a Marathi plaque.",
          "credit": "Photo · The Kala Ghoda horse sculpture",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "50% 30%"
        },
        "illustration": "kalaGhoda",
        "alt": "Illustration of a heritage gallery facade with arched windows, an artist's easel and festival bunting.",
        "credit": "Illustration inspired by the Kala Ghoda art precinct"
      }
    }
  ],
  "features": [
    {
      "id": "taxi",
      "label": "The kaali-peeli",
      "title": "The journey never stops.",
      "caption": "The black-and-yellow taxi is Mumbai's most recognizable symbol — and the source of the taxi-yellow accents used throughout this site.",
      "context": "The classic Premier Padmini taxis were phased out of service in 2023; their colours remain on the city's taxis today.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "bmcTaxi",
          "alt": "A black-and-yellow Premier Padmini taxi in front of the Brihanmumbai Municipal Corporation headquarters.",
          "credit": "Photo · Taxi outside the BMC headquarters, Mumbai",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "50% 80%"
        },
        "illustration": "taxi",
        "alt": "Illustration of a classic black-and-yellow Mumbai taxi in side view.",
        "credit": "Illustration · black-and-yellow taxi"
      }
    },
    {
      "id": "bus",
      "label": "BEST",
      "title": "Moving a city. Moving ideas.",
      "caption": "The red buses of BEST — the city's municipal transport undertaking — carry Mumbai through its everyday rhythm.",
      "context": "BEST: Brihanmumbai Electric Supply and Transport.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "bestBuses",
          "alt": "A row of red BEST buses; their destination boards read Colaba bus station in Marathi.",
          "credit": "Photo · BEST buses",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        },
        "illustration": "bus",
        "alt": "Illustration of a red single-decker city bus in side view.",
        "credit": "Illustration · red city bus"
      }
    },
    {
      "id": "train",
      "label": "The local",
      "title": "Connected by routes. United by ideas.",
      "caption": "The suburban 'local' trains link the city along the Western, Central and Harbour lines.",
      "context": "Mumbai Suburban Railway.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "localTrain",
          "alt": "A white, purple and yellow suburban EMU local train in a carshed.",
          "credit": "Photo · Suburban EMU local train",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "70% 50%"
        },
        "illustration": "train",
        "alt": "Illustration of a Mumbai suburban local train with open doorways, under overhead wires.",
        "credit": "Illustration · suburban local train"
      }
    },
    {
      "id": "stations",
      "label": "Railway heritage",
      "title": "Where every route begins.",
      "caption": "Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai Central and Marine Lines are three different stations, each with its own history.",
      "context": "Pictured: CSMT, a UNESCO World Heritage Site in the Victorian Gothic style. The Chapter 2 venue has not been announced; InnovaHack is not being held at these stations.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "csmt",
          "alt": "Chhatrapati Shivaji Maharaj Terminus lit up at dusk, with BEST buses passing in front.",
          "credit": "Photo · Chhatrapati Shivaji Maharaj Terminus (CSMT) at dusk",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        },
        "illustration": "station",
        "alt": "Illustration of a Victorian Gothic railway building with a central dome, pointed arches and a clock.",
        "credit": "Illustration inspired by Victorian Gothic railway architecture"
      }
    },
    {
      "id": "marine-drive",
      "label": "Marine Drive",
      "title": "Where the city meets the sea.",
      "caption": "The promenade's curve of streetlights is known as the Queen's Necklace after dark.",
      "context": "Marine Drive is the promenade; Marine Lines is the neighbouring locality and railway station.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "marineDriveAerial",
          "alt": "Aerial view of Marine Drive curving along the sea, with traffic, the promenade and the skyline beyond.",
          "credit": "Photo · Marine Drive from above",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "50% 35%"
        },
        "illustration": "coast",
        "alt": "Illustration of a curved seaside promenade with streetlights and a skyline at dusk.",
        "credit": "Illustration inspired by Marine Drive"
      }
    },
    {
      "id": "kala-ghoda",
      "label": "Kala Ghoda",
      "title": "Where creativity takes the streets.",
      "caption": "Galleries, museums and street-side art give the precinct its creative energy.",
      "context": "Kala Ghoda — 'black horse' — is South Mumbai's art precinct.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "kalaGhodaHorse",
          "alt": "The black horse sculpture at Kala Ghoda on its stone plinth with a Marathi plaque.",
          "credit": "Photo · The Kala Ghoda horse sculpture",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "50% 30%"
        },
        "illustration": "kalaGhoda",
        "alt": "Illustration of a heritage gallery facade with arched windows, an easel and festival bunting.",
        "credit": "Illustration inspired by the Kala Ghoda art precinct"
      }
    },
    {
      "id": "auto",
      "label": "The autorickshaw",
      "title": "Small rides. Big ideas.",
      "caption": "Autorickshaws serve Mumbai's suburbs and the wider metropolitan region.",
      "context": "They do not operate in the island city's southern areas, where taxis serve short trips instead.",
      "href": "/#the-city",
      "media": {
        "photo": {
          "src": "autorickshawQueue",
          "alt": "A line of black-and-yellow autorickshaws parked along a wet roadside, one being pushed forward by its driver.",
          "credit": "Photo · Autorickshaws waiting in line",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "62% 55%"
        },
        "illustration": "auto",
        "alt": "Illustration of a black-and-yellow autorickshaw in side view.",
        "credit": "Illustration · autorickshaw"
      }
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Mumbai map
insert into public.site_content (key, value) values ('map', $seed${
  "railLines": [
    {
      "id": "western",
      "name": "Western line",
      "colour": "#941B45",
      "stations": [
        {
          "name": "Churchgate",
          "lat": 18.9353,
          "lon": 72.827,
          "label": "left"
        },
        {
          "name": "Marine Lines",
          "lat": 18.9447,
          "lon": 72.8236
        },
        {
          "name": "Charni Road",
          "lat": 18.9517,
          "lon": 72.8183
        },
        {
          "name": "Grant Road",
          "lat": 18.9633,
          "lon": 72.8165
        },
        {
          "name": "Mumbai Central",
          "lat": 18.969,
          "lon": 72.8195,
          "label": "left"
        },
        {
          "name": "Mahalaxmi",
          "lat": 18.9826,
          "lon": 72.8242
        },
        {
          "name": "Lower Parel",
          "lat": 18.996,
          "lon": 72.8303
        },
        {
          "name": "Prabhadevi",
          "lat": 19.008,
          "lon": 72.8357
        },
        {
          "name": "Dadar",
          "lat": 19.0186,
          "lon": 72.8429
        },
        {
          "name": "Matunga Road",
          "lat": 19.0277,
          "lon": 72.8467
        },
        {
          "name": "Mahim",
          "lat": 19.041,
          "lon": 72.8406
        },
        {
          "name": "Bandra",
          "lat": 19.0544,
          "lon": 72.8406,
          "label": "left"
        },
        {
          "name": "Khar Road",
          "lat": 19.0697,
          "lon": 72.8378
        },
        {
          "name": "Santacruz",
          "lat": 19.0814,
          "lon": 72.8411
        },
        {
          "name": "Vile Parle",
          "lat": 19.0996,
          "lon": 72.8437
        },
        {
          "name": "Andheri",
          "lat": 19.1197,
          "lon": 72.8464,
          "label": "left"
        },
        {
          "name": "Jogeshwari",
          "lat": 19.1364,
          "lon": 72.8489
        },
        {
          "name": "Goregaon",
          "lat": 19.1648,
          "lon": 72.8494,
          "label": "left"
        },
        {
          "name": "Malad",
          "lat": 19.1867,
          "lon": 72.8486
        },
        {
          "name": "Kandivali",
          "lat": 19.2045,
          "lon": 72.8517
        },
        {
          "name": "Borivali",
          "lat": 19.229,
          "lon": 72.8573,
          "label": "left"
        },
        {
          "name": "Dahisar",
          "lat": 19.2502,
          "lon": 72.8597
        }
      ],
      "continues": {
        "lat": 19.279,
        "lon": 72.862,
        "label": "to Virar"
      }
    },
    {
      "id": "central",
      "name": "Central line",
      "colour": "#D62828",
      "stations": [
        {
          "name": "CSMT",
          "lat": 18.9398,
          "lon": 72.8355,
          "label": "right"
        },
        {
          "name": "Masjid",
          "lat": 18.9517,
          "lon": 72.8382
        },
        {
          "name": "Byculla",
          "lat": 18.9767,
          "lon": 72.8331,
          "label": "left"
        },
        {
          "name": "Parel",
          "lat": 19.0091,
          "lon": 72.8384
        },
        {
          "name": "Dadar",
          "lat": 19.0183,
          "lon": 72.8439,
          "label": "left"
        },
        {
          "name": "Matunga",
          "lat": 19.0275,
          "lon": 72.8551
        },
        {
          "name": "Sion",
          "lat": 19.0466,
          "lon": 72.8638
        },
        {
          "name": "Kurla",
          "lat": 19.0659,
          "lon": 72.8794,
          "label": "left"
        },
        {
          "name": "Ghatkopar",
          "lat": 19.0859,
          "lon": 72.9081,
          "label": "right"
        },
        {
          "name": "Vikhroli",
          "lat": 19.111,
          "lon": 72.9277
        },
        {
          "name": "Kanjurmarg",
          "lat": 19.1293,
          "lon": 72.9319
        },
        {
          "name": "Bhandup",
          "lat": 19.144,
          "lon": 72.9378
        },
        {
          "name": "Mulund",
          "lat": 19.172,
          "lon": 72.9563,
          "label": "left"
        }
      ],
      "continues": {
        "lat": 19.186,
        "lon": 72.9757,
        "label": "to Thane"
      }
    },
    {
      "id": "harbour",
      "name": "Harbour line",
      "colour": "#6D28D9",
      "stations": [
        {
          "name": "CSMT",
          "lat": 18.9398,
          "lon": 72.8355
        },
        {
          "name": "Sandhurst Road",
          "lat": 18.9614,
          "lon": 72.8394
        },
        {
          "name": "Cotton Green",
          "lat": 18.9866,
          "lon": 72.8432
        },
        {
          "name": "Sewri",
          "lat": 18.9985,
          "lon": 72.8546
        },
        {
          "name": "Vadala Road",
          "lat": 19.0166,
          "lon": 72.859,
          "label": "right"
        },
        {
          "name": "Chunabhatti",
          "lat": 19.0517,
          "lon": 72.8693
        },
        {
          "name": "Kurla",
          "lat": 19.0659,
          "lon": 72.8794
        },
        {
          "name": "Chembur",
          "lat": 19.0622,
          "lon": 72.901
        },
        {
          "name": "Govandi",
          "lat": 19.0553,
          "lon": 72.9152
        },
        {
          "name": "Mankhurd",
          "lat": 19.0482,
          "lon": 72.9318,
          "label": "right"
        }
      ],
      "continues": {
        "lat": 19.063,
        "lon": 72.99,
        "label": "to Vashi"
      }
    }
  ],
  "interchanges": [
    "CSMT",
    "Dadar",
    "Kurla"
  ],
  "landmarks": [
    {
      "n": 1,
      "name": "Gateway of India",
      "note": "Arch monument on the waterfront at Apollo Bunder.",
      "lat": 18.922,
      "lon": 72.8347,
      "offset": [
        16,
        6
      ]
    },
    {
      "n": 2,
      "name": "Kala Ghoda",
      "note": "South Mumbai's art precinct.",
      "lat": 18.9285,
      "lon": 72.8318,
      "offset": [
        -18,
        4
      ],
      "href": "/#the-city"
    },
    {
      "n": 3,
      "name": "CSMT & BMC headquarters",
      "note": "The UNESCO-listed terminus, with the BMC building opposite.",
      "lat": 18.94,
      "lon": 72.835,
      "offset": [
        26,
        -16
      ],
      "href": "/#the-city"
    },
    {
      "n": 4,
      "name": "Marine Drive",
      "note": "The seafront promenade curving along Back Bay.",
      "lat": 18.944,
      "lon": 72.823,
      "offset": [
        -20,
        -10
      ],
      "href": "/#the-city"
    },
    {
      "n": 5,
      "name": "Bandra–Worli Sea Link",
      "note": "Cable-stayed bridge across Mahim Bay.",
      "lat": 19.0237,
      "lon": 72.816,
      "offset": [
        -18,
        0
      ]
    },
    {
      "n": 6,
      "name": "Juhu Beach",
      "note": "The suburbs' long sandy shoreline.",
      "lat": 19.0988,
      "lon": 72.8267
    },
    {
      "n": 7,
      "name": "Mumbai airport",
      "note": "Chhatrapati Shivaji Maharaj International Airport.",
      "lat": 19.0896,
      "lon": 72.8656
    },
    {
      "n": 8,
      "name": "Powai Lake",
      "note": "Lake in the eastern suburbs.",
      "lat": 19.1273,
      "lon": 72.9055
    },
    {
      "n": 9,
      "name": "Sanjay Gandhi National Park",
      "note": "Forested national park within the city limits.",
      "lat": 19.2147,
      "lon": 72.9106
    }
  ],
  "seaLink": [
    [
      19.0108,
      72.8154
    ],
    [
      19.036,
      72.8173
    ]
  ],
  "placeLabels": [
    {
      "text": "Arabian Sea",
      "lat": 19.15,
      "lon": 72.779,
      "rotate": -90,
      "kind": "water"
    },
    {
      "text": "Back Bay",
      "lat": 18.917,
      "lon": 72.797,
      "kind": "water"
    },
    {
      "text": "Mumbai Harbour",
      "lat": 18.945,
      "lon": 72.9,
      "kind": "water"
    },
    {
      "text": "Thane Creek",
      "lat": 19.105,
      "lon": 72.983,
      "rotate": -72,
      "kind": "water"
    },
    {
      "text": "Mumbai Suburban",
      "lat": 19.195,
      "lon": 72.89,
      "kind": "area"
    },
    {
      "text": "Mumbai City",
      "lat": 18.982,
      "lon": 72.9,
      "kind": "area",
      "leader": [
        18.975,
        72.84
      ]
    },
    {
      "text": "Thane",
      "lat": 19.225,
      "lon": 72.975,
      "kind": "outside"
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Layout images
insert into public.site_content (key, value) values ('images', $seed${
  "heroBuilding": "cutout-bmc",
  "heroTaxi": "cutout-taxi",
  "heroBus": "cutout-bus",
  "heroTrain": "cutout-train",
  "heroSplashYellow": "cutout-splash-yellow",
  "heroSplashRed": "cutout-splash-red",
  "heroSkyline": "cutout-skyline",
  "mastheadSketch": "cutout-gateway",
  "domainAiArt": "cutout-ai",
  "domainStartupArt": "cutout-bulb",
  "footerSkyline": "footerSkyline"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Navigation
insert into public.site_content (key, value) values ('navigation', $seed${
  "primary": [
    {
      "label": "The Story",
      "href": "/about"
    },
    {
      "label": "The Tracks",
      "href": "/tracks"
    },
    {
      "label": "Chapter 1",
      "href": "/chapter-1"
    },
    {
      "label": "Timeline",
      "href": "/timeline"
    },
    {
      "label": "Partners",
      "href": "/partners"
    },
    {
      "label": "FAQ",
      "href": "/faq"
    },
    {
      "label": "Contact",
      "href": "/contact"
    }
  ],
  "footer": [
    {
      "title": "The edition",
      "links": [
        {
          "label": "The Story",
          "href": "/about"
        },
        {
          "label": "Timeline",
          "href": "/timeline"
        },
        {
          "label": "Prizes",
          "href": "/prizes"
        },
        {
          "label": "Build Log",
          "href": "/updates"
        }
      ]
    },
    {
      "title": "The tracks",
      "links": [
        {
          "label": "Both domains",
          "href": "/tracks"
        },
        {
          "label": "Artificial Intelligence",
          "href": "/tracks/artificial-intelligence"
        },
        {
          "label": "Open Innovation / Startup",
          "href": "/tracks/open-innovation"
        },
        {
          "label": "Rules",
          "href": "/rules"
        }
      ]
    },
    {
      "title": "Get involved",
      "links": [
        {
          "label": "Register",
          "href": "/register"
        },
        {
          "label": "Partners",
          "href": "/partners"
        },
        {
          "label": "Contact",
          "href": "/contact"
        },
        {
          "label": "FAQ",
          "href": "/faq"
        }
      ]
    },
    {
      "title": "Archive",
      "links": [
        {
          "label": "Chapter 1 · 2026",
          "href": "/chapter-1"
        },
        {
          "label": "Privacy",
          "href": "/privacy"
        },
        {
          "label": "Terms",
          "href": "/terms"
        }
      ]
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Global text & SEO
insert into public.site_content (key, value) values ('copy.global', $seed${
  "seo": {
    "title": "InnovaHack 2027 | AI & Startup Hackathon in India",
    "description": "Explore InnovaHack Chapter 2, a pan-India AI and startup hackathon planned for 2027 by Elite Forums. See tracks, timeline, prizes and registration updates.",
    "imageAlt": "InnovaHack Chapter 2, a planned pan-India hackathon for AI and startup innovation"
  },
  "header": {
    "wordmark": "INNOVAHACK",
    "chapterTag": "Ch. 02",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  },
  "cta": {
    "register": "Register now",
    "updates": "Get event updates"
  },
  "registration": {
    "announcement": {
      "headline": "Chapter 2 has been announced.",
      "body": "Registration details will be published here once they are confirmed.",
      "badge": "Announced"
    },
    "interest": {
      "headline": "Registration opening soon.",
      "body": "Registration for Chapter 2 is not open yet. Join the update list and we will tell you as soon as it opens.",
      "badge": "Registration opening soon"
    },
    "soon": {
      "headline": "Registration opening soon.",
      "body": "Registration for Chapter 2 opens shortly. Join the update list to be notified the moment it does.",
      "badge": "Registration opening soon"
    },
    "open": {
      "headline": "Registration is open.",
      "body": "Form your team, choose your domain and submit your registration.",
      "badge": "Registration open"
    },
    "closed": {
      "headline": "Registration has closed.",
      "body": "Registration for Chapter 2 is closed. Join the update list to follow the competition.",
      "badge": "Registration closed"
    }
  },
  "statusLabels": {
    "confirmed": "Confirmed",
    "planned": "Planned",
    "proposed": "Proposed",
    "target": "Target",
    "advertised": "As advertised",
    "reported": "Reported",
    "unconfirmed": "To be announced"
  },
  "footer": {
    "wordmark": "INNOVAHACK",
    "organizedBy": "A national hackathon organized by {organizer}.",
    "partnershipsLabel": "Partnerships:",
    "copyright": "© {organizer}. InnovaHack is organized by {organizer}.",
    "note": "Illustrations are original artwork inspired by Mumbai · Not a news publication",
    "skylineAlt": "Ink illustration of Mumbai: the Marine Drive skyline, the Gateway of India, the BMC headquarters, a taxi, a BEST bus, a local train and the Bandra–Worli Sea Link."
  },
  "breadcrumbHome": "Front page",
  "pageHeaderEdition": "InnovaHack · Chapter 02 · 2027",
  "legalDraftNote": "*Draft for organizer and legal review.* This page describes how this website works today. It must be reviewed and approved before the site goes live.",
  "notFound": {
    "kicker": "Error 404 · Wrong stop",
    "title": "This route doesn't run here.",
    "body": "The page you were looking for doesn't exist or has moved. Let's get you back on the line.",
    "primary": "Front page",
    "secondary": "The tracks"
  }
}$seed$::jsonb)
on conflict (key) do nothing;

-- Homepage
insert into public.site_content (key, value) values ('copy.home', $seed${
  "masthead": {
    "wordmark": "INNOVAHACK",
    "themes": [
      "Innovation",
      "Ideas",
      "Technology",
      "Startups",
      "For a brighter India"
    ],
    "ticketTop": "Chapter 02",
    "ticketMain": "2027",
    "ticketBottom": "A national hackathon\nby {organizer}",
    "sideNote": "India's next generation of builders creating real impact."
  },
  "lead": {
    "tag": "The lead story",
    "headline": "*Mumbai*\nbuilds\nthe future.",
    "subhead": "Two domains. One national stage.",
    "primaryCta": "Explore the tracks",
    "meta": [
      "India wide",
      "Hybrid format",
      "2027",
      "By {organizer}"
    ]
  },
  "collage": {
    "note": "Mumbai\nMore than a city\nA mindset",
    "themes": [
      "Ideas",
      "People",
      "Culture",
      "Technology",
      "A brighter India"
    ],
    "caption": "Collage · A taxi, a BEST bus and a suburban local train before the Brihanmumbai Municipal Corporation headquarters",
    "buildingAlt": "The Brihanmumbai Municipal Corporation headquarters, a Victorian Gothic building with a tall central dome.",
    "trainAlt": "A white, purple and yellow suburban local train.",
    "busAlt": "A red BEST bus.",
    "taxiAlt": "A black-and-yellow Premier Padmini taxi."
  },
  "coast": {
    "heading": "Mumbai",
    "footer": "Same streets.\nBigger dreams."
  },
  "stripLabel": "The city edition · Four stories",
  "legacy": {
    "title": "The foundation that started it all.",
    "cta": "Explore Chapter 1",
    "note": "Historical Chapter 1 figures. \"As advertised\" figures were promoted before the event and are not records of cash paid out. They do not describe Chapter 2."
  },
  "rooted": {
    "number": "02",
    "kicker": "Mumbai inspires. India innovates.",
    "title": "Rooted in Mumbai. *Built for India.*",
    "body": "From the speed of its local trains to the ambition of its builders, Mumbai represents movement, resilience, diversity, and possibility. InnovaHack brings that spirit to a national platform for technology and entrepreneurship.",
    "stops": [
      "Movement",
      "Resilience",
      "Diversity",
      "Possibility"
    ],
    "stopLabel": "Station",
    "venueNote": "Chapter 2 is a pan-India event. The grand finale venue has not yet been announced.",
    "tiles": [
      {
        "illustration": "train",
        "alt": "Illustration of a suburban local train.",
        "credit": "Local train",
        "photo": {
          "src": "localTrain",
          "alt": "A white, purple and yellow suburban EMU local train in a carshed.",
          "credit": "Photo · Suburban EMU local train",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "70% 50%"
        }
      },
      {
        "illustration": "taxi",
        "alt": "Illustration of a black-and-yellow taxi.",
        "credit": "Taxi",
        "photo": {
          "src": "bmcTaxi",
          "alt": "A black-and-yellow Premier Padmini taxi in front of the Brihanmumbai Municipal Corporation headquarters.",
          "credit": "Photo · Taxi outside the BMC headquarters, Mumbai",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true,
          "position": "50% 80%"
        }
      },
      {
        "illustration": "bus",
        "alt": "Illustration of a red city bus.",
        "credit": "BEST bus",
        "photo": {
          "src": "bestBuses",
          "alt": "A row of red BEST buses; their destination boards read Colaba bus station in Marathi.",
          "credit": "Photo · BEST buses",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        }
      },
      {
        "illustration": "heritage",
        "alt": "Illustration of Victorian Gothic architecture.",
        "credit": "Heritage",
        "photo": {
          "src": "csmt",
          "alt": "Chhatrapati Shivaji Maharaj Terminus lit up at dusk, with BEST buses passing in front.",
          "credit": "Photo · Chhatrapati Shivaji Maharaj Terminus (CSMT) at dusk",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        }
      },
      {
        "illustration": "workstation",
        "alt": "Illustration of a laptop with code, a phone prototype and a glass of cutting chai.",
        "credit": "Prototype",
        "photo": {
          "src": "startupDomain",
          "alt": "A laptop, a coffee cup and hand-drawn app wireframes on a desk by a window.",
          "credit": "Artwork · Open Innovation / Startup domain",
          "license": "Supplied by the organizer — usage rights to be confirmed",
          "approved": true
        }
      }
    ],
    "tilesCaption": "Local train · Taxi outside the BMC headquarters · BEST buses · CSMT · A prototype taking shape"
  },
  "domains": {
    "number": "03",
    "kicker": "The official domains",
    "title": "Two domains. *One national stage.*",
    "deck": "Every team enters one of exactly two official competition domains. AI is welcome in both.",
    "action": "Compare the tracks",
    "areasLabel": "Potential areas",
    "ruleTitle": "The two-domain rule",
    "aiNote": "Intelligence\nfor a brighter\ntomorrow.",
    "startupNote": "Ideas\nStartups\nReal impact"
  },
  "more": {
    "number": "04",
    "kicker": "More than a hackathon",
    "title": "Build. Collaborate. Create impact.",
    "benefits": [
      {
        "title": "Build practical projects",
        "body": "Turn a real problem into a working solution you can demo."
      },
      {
        "title": "Learn by exploring",
        "body": "Push into new tools, models and frameworks under real constraints."
      },
      {
        "title": "Work as a team",
        "body": "Split the problem, divide the work and ship together."
      },
      {
        "title": "Sharpen product thinking",
        "body": "Practise deciding what to build — and what to leave out."
      },
      {
        "title": "Explore real challenges",
        "body": "Work on themes drawn from education, finance, climate, civic life and more."
      },
      {
        "title": "Present your work",
        "body": "Explain what you built, why it matters and how it works."
      },
      {
        "title": "Meet mentors",
        "body": "Engage with mentors where sessions are available during the event."
      },
      {
        "title": "Find connections",
        "body": "Explore industry and startup connections around the event."
      },
      {
        "title": "Grow your portfolio",
        "body": "Leave with a project that shows what you can do."
      }
    ],
    "disclaimer": "Participation does not guarantee employment, funding, incubation or investment. Any partner opportunity will be published with its terms once it is confirmed."
  },
  "journey": {
    "number": "05",
    "kicker": "The competition journey",
    "title": "From first idea to final stage.",
    "deck": "The proposed Chapter 2 stages, subject to the organizer's final rules. Dates will be added as they are confirmed.",
    "action": "Full timeline"
  },
  "prizes": {
    "number": "06",
    "kicker": "Tiered cash awards",
    "title": "Three tiers. *Eighteen winning teams.*",
    "summary": "₹1,00,000 in tiered cash awards",
    "body": "Each amount is awarded per winning team. Tier 1 has 3 teams, Tier 2 has 5, and Tier 3 has 10.",
    "howTitle": "The three tiers",
    "howBody": "Cash awards are paid per team, not per individual.",
    "link": "Explore all tiers"
  },
  "partners": {
    "number": "07",
    "kicker": "Partners & industry",
    "title": "Real problems. Real builders.",
    "action": "Partner with us",
    "ctaKicker": "Chapter 2 partners",
    "ctaTitle": "Partner with InnovaHack.",
    "ctaBody": "Chapter 2 partners have not been announced yet. Organizations interested in shaping the edition can get in touch now.",
    "ctaButton": "Start a partnership inquiry",
    "optionLabel": "Option",
    "options": [
      {
        "title": "Set a challenge",
        "body": "Bring a real problem statement for teams to work on within either domain."
      },
      {
        "title": "Provide tools",
        "body": "Offer APIs, platforms or credits that help teams build."
      },
      {
        "title": "Mentor & judge",
        "body": "Share expertise with teams during the build and evaluation."
      },
      {
        "title": "Reach builders",
        "body": "Connect with India's student and early-career builder community."
      }
    ]
  },
  "city": {
    "number": "08",
    "kicker": "The Mumbai edition",
    "title": "The city behind the inspiration.",
    "deck": "The colours, routes and textures of this edition come from Mumbai's everyday life. These features are the inspiration for the design — not competition categories."
  },
  "national": {
    "number": "09",
    "kicker": "National participation",
    "title": "Rooted in Mumbai. *Open to India.*",
    "body": "The city on the map inspires this edition's identity — its trains, streets and shoreline. InnovaHack Chapter 2 itself is designed for builders from across the country, not only from Mumbai. Eligibility details will be published in the official rules.",
    "mapTitle": "The city map · Mumbai",
    "mapSubtitle": "Island city & suburbs",
    "mapCaption": "Mumbai City and Mumbai Suburban districts. Rail lines are drawn station to station and positions are approximate. The Chapter 2 finale venue has not been announced and is not shown.",
    "keyTitle": "Map key",
    "seaLink": "Sea link",
    "cityDistrict": "Mumbai City district",
    "suburbanDistrict": "Mumbai Suburban district",
    "figuresTitle": "Chapter 2 participation — live figures",
    "metricHeading": "Metric",
    "figureHeading": "Figure",
    "notPublished": "Not yet published",
    "figuresNote": "Figures appear here only once they are supported by real registration data. Targets are always labelled as targets."
  },
  "updatesBand": {
    "title": "Be first to know.",
    "body": "Updates are sent only when there is official news — dates, registration, domains and partners."
  }
}$seed$::jsonb)
on conflict (key) do nothing;

-- The Story (About)
insert into public.site_content (key, value) values ('copy.about', $seed${
  "meta": {
    "title": "About the National Hackathon",
    "description": "Learn about InnovaHack, the national hackathon organized by Elite Forums. Chapter 2 is planned as a pan-India hybrid event in 2027."
  },
  "section": "The Story",
  "title": "India's next generation of builders. *One national stage.*",
  "article": [
    {
      "type": "p",
      "text": "InnovaHack is a national hackathon organized by {organizer}. Its first edition took place in {chapter1Year}. The second edition — Chapter 2 — is planned for {year} as a larger national platform for technology innovation, AI development, original products, startup ideas and practical problem-solving."
    },
    {
      "type": "p",
      "text": "Chapter 2 combines nationwide online participation and selection with an offline national grand finale. It focuses on exactly two official competition domains: Artificial Intelligence, and Open Innovation / Startup Track."
    },
    {
      "type": "h2",
      "text": "Why Mumbai?"
    },
    {
      "type": "p",
      "text": "This edition's visual identity is inspired by Mumbai — its black-and-yellow taxis, red BEST buses, local trains, heritage architecture, coastline, street food and creative culture. Mumbai was named in the original Chapter 1 event materials, and its energy shapes how this edition looks and feels."
    },
    {
      "type": "p",
      "text": "The event itself is pan-India. Builders from across the country are welcome, and the grand finale venue has not yet been announced."
    },
    {
      "type": "h2",
      "text": "About the design"
    },
    {
      "type": "p",
      "text": "\"The Innovation Times\" is the design concept behind this website: a special newspaper edition about India's innovators. It is not a separate news publication, and the illustrations are original artwork inspired by the city."
    }
  ],
  "factsTitle": "Edition facts",
  "factLabels": {
    "edition": "Edition",
    "year": "Year",
    "scope": "Scope",
    "format": "Format",
    "domains": "Official domains",
    "domainsValue": "Two",
    "venue": "Finale venue"
  },
  "figure": {
    "illustration": "station",
    "alt": "Illustration of Victorian Gothic architecture.",
    "credit": "Illustration inspired by Victorian Gothic architecture",
    "photo": {
      "src": "bmcTaxi",
      "alt": "A black-and-yellow Premier Padmini taxi in front of the Brihanmumbai Municipal Corporation headquarters.",
      "credit": "Photo · Taxi outside the BMC headquarters, Mumbai",
      "license": "Supplied by the organizer — usage rights to be confirmed",
      "approved": true,
      "position": "50% 80%"
    }
  },
  "organizerNumber": "02",
  "organizerKicker": "The organizer",
  "organizerBody": "{organizer} is a community-driven organization that connects builders with opportunities through tech meetups, hackathons and industry events. InnovaHack is its national hackathon.",
  "archiveCta": "The Chapter 1 archive",
  "contactCta": "Contact us"
}$seed$::jsonb)
on conflict (key) do nothing;

-- The Tracks
insert into public.site_content (key, value) values ('copy.tracks', $seed${
  "meta": {
    "title": "AI & Startup Hackathon Tracks 2027",
    "description": "Explore the two InnovaHack Chapter 2 domains: Artificial Intelligence and Open Innovation / Startup. Both are planned for the 2027 pan-India hybrid hackathon."
  },
  "section": "The Tracks",
  "title": "Two domains. *One national stage.*",
  "deck": "Every team enters one of exactly two official competition domains. AI may be used in both — the difference is what sits at the core of your innovation.",
  "compareNumber": "03",
  "compareKicker": "Side by side",
  "compareTitle": "Which domain is yours?",
  "compareHeading": "Compare",
  "compareRows": [
    {
      "label": "Core of the innovation",
      "ai": "The AI itself — a model, agent or learning system",
      "startup": "The product, service or business concept"
    },
    {
      "label": "Use of AI",
      "ai": "Required — AI is the heart of the solution",
      "startup": "Permitted, never compulsory"
    },
    {
      "label": "Typical output",
      "ai": "An intelligent system applied to a real problem",
      "startup": "An original product, platform or startup MVP"
    },
    {
      "label": "Challenge themes",
      "ai": "Education, Healthcare access, FinTech, Agriculture…",
      "startup": "FinTech, Education, Agriculture, Civic & community tech…"
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Domain pages
insert into public.site_content (key, value) values ('copy.domainDetail', $seed${
  "sectionSuffix": "Official competition domain",
  "areasKicker": "What you can build",
  "areasTitle": "Potential areas",
  "chooseKicker": "Is this your domain?",
  "chooseTitle": "Choose {shortName} if…",
  "themesKicker": "Challenge themes",
  "themesTitle": "Themes inside the domain",
  "themesDeck": "Sector themes are welcome as the setting for your solution. They are not separate competition domains.",
  "promptsKicker": "Starting points",
  "promptsTitle": "Questions worth building on",
  "promptsDeck": "Illustrative prompts to get your team thinking. They are not official problem statements — those will be published with the rules.",
  "evalKicker": "Evaluation",
  "evalTitle": "Judging criteria",
  "evalBody": "Official evaluation criteria and weightings for this domain will be published in the competition rules.",
  "ruleTitle": "The two-domain rule",
  "otherLabel": "The other domain",
  "compareLink": "Compare both domains"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Chapter 1 page
insert into public.site_content (key, value) values ('copy.chapter1Page', $seed${
  "meta": {
    "title": "Chapter 1 Archive: 2026",
    "description": "Explore the InnovaHack Chapter 1 archive, including historical competition structure and figures clearly labelled as reported or advertised."
  },
  "title": "InnovaHack Chapter 1\n*The first edition, 2026*",
  "deck": "The inaugural InnovaHack laid the foundation for everything Chapter 2 is building on. This archive records what was reported after the event and what was advertised before it — and labels each clearly.",
  "figure": {
    "illustration": "station",
    "alt": "Illustration of Victorian Gothic architecture.",
    "credit": "Illustration inspired by Victorian Gothic architecture",
    "photo": {
      "src": "csmt",
      "alt": "Chhatrapati Shivaji Maharaj Terminus lit up at dusk, with BEST buses passing in front.",
      "credit": "Photo · Chhatrapati Shivaji Maharaj Terminus (CSMT) at dusk",
      "license": "Supplied by the organizer — usage rights to be confirmed",
      "approved": true
    }
  },
  "recordKicker": "The record",
  "recordTitle": "By the numbers",
  "reportedLegend": "*Reported:* figures reported after the event, including the post-event recap.",
  "advertisedLegend": "*As advertised:* figures promoted before the event. They are not records of cash paid out or funding invested.",
  "applicationsNote": "Applications are not the same as individual participants or attendees. Location: {location}",
  "domainsKicker": "Original competition domains",
  "domainsTitle": "Five tracks in the first edition",
  "trackLabel": "Track",
  "structureKicker": "Original competition structure",
  "structureTitle": "How Chapter 1 ran",
  "structureDeck": "As advertised on the Chapter 1 website.",
  "roundLabel": "Round",
  "recordsKicker": "Results, partners, people & gallery",
  "recordsTitle": "The verified record",
  "recordsDeck": "Only verified, organizer-approved names, results and photographs are published in this archive.",
  "recordTitles": {
    "winners": "Results & winners",
    "partners": "Historical partners",
    "judges": "Judges & mentors",
    "gallery": "Event gallery"
  },
  "pendingKicker": "Awaiting verification",
  "pendingBody": "Records for this section are awaiting verification and will be published once approved.",
  "rosterNote": "The Chapter 1 partner roster is a historical record. It is not the Chapter 2 partner lineup.",
  "forwardKicker": "Carried into Chapter 2",
  "forwardTitle": "What changes next",
  "transitionKicker": "Chapter 01 → Chapter 02",
  "transitionTitle": "The first chapter built the foundation. *The next chapter builds what comes next.*",
  "transitionBody": "Chapter 2 brings a sharper focus — two official domains, Artificial Intelligence and Open Innovation / Startup — on a pan-India hybrid stage.",
  "enterCta": "Enter Chapter 2"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Timeline
insert into public.site_content (key, value) values ('copy.timeline', $seed${
  "meta": {
    "title": "Hackathon Timeline 2027",
    "description": "See the proposed InnovaHack Chapter 2 competition journey. Official dates will be published here once they are confirmed."
  },
  "section": "Timeline",
  "title": "From first idea to final stage.",
  "deck": "These are the proposed Chapter 2 stages, subject to the organizer's final rules. No dates have been confirmed yet — each will be added here when it is.",
  "statusKicker": "Current status",
  "routeKicker": "The route",
  "routeTitle": "The competition journey",
  "datesKicker": "Official dates",
  "datesTitle": "Key dates",
  "opensLabel": "Registration opens",
  "closesLabel": "Registration closes",
  "milestoneHeading": "Milestone",
  "dateHeading": "Date",
  "istNote": "Times will be listed in Indian Standard Time (IST) once confirmed.",
  "rail": {
    "lineTag": "CH-02 Line",
    "nowBoarding": "Now boarding:",
    "stationsLabel": "{count} stations · Online → In person",
    "trainTag": "CH-02 FAST · GRAND FINALE",
    "terminusLabel": "Terminus",
    "stopLabel": "Station",
    "platformLabel": "PF",
    "dateTba": "Date TBA",
    "footnote": "Proposed stages, subject to the organizer's final rules. The train is decorative and does not show progress."
  }
}$seed$::jsonb)
on conflict (key) do nothing;

-- Prizes
insert into public.site_content (key, value) values ('copy.prizes', $seed${
  "meta": {
    "title": "Hackathon Prizes & Awards",
    "description": "InnovaHack Chapter 2 has three tiers of cash awards for 18 winning teams, from ₹4,000 to ₹10,000 per team."
  },
  "section": "Cash awards by tier",
  "title": "Three tiers. *Eighteen winning teams.*",
  "deck": "₹1,00,000 in confirmed cash awards. Each amount is per team, and the winner counts below refer to teams.",
  "pendingTitle": "Tier details are being updated.",
  "pendingBody": "The three cash award tiers will be listed here.",
  "eligibilityLabel": "Winning teams",
  "conditionsLabel": "Per team",
  "kindLabels": {
    "cash": "Cash prize",
    "sponsor-benefit": "Sponsor-provided benefit",
    "credits": "Software or cloud credits",
    "hardware": "Hardware & products",
    "mentorship": "Mentorship",
    "incubation-consideration": "Incubation consideration",
    "investor-introduction": "Investor introduction"
  },
  "awardNote": "All amounts are per winning team. There are 18 winning teams across the three tiers."
}$seed$::jsonb)
on conflict (key) do nothing;

-- Partners
insert into public.site_content (key, value) values ('copy.partners', $seed${
  "meta": {
    "title": "Hackathon Sponsorship & Partnerships",
    "description": "Explore sponsorship and partnership opportunities with InnovaHack Chapter 2, a planned pan-India hackathon for AI innovators and startup builders."
  },
  "section": "Partners & industry",
  "title": "Real problems. *Real builders.*",
  "deck": "InnovaHack works with organizations that bring real challenges, tools and expertise to India's builders.",
  "confirmedKicker": "Chapter 2 partners",
  "confirmedTitle": "Confirmed partners",
  "pendingTitle": "Chapter 2 partners will be announced here.",
  "pendingBody": "No Chapter 2 partners have been announced yet. Partners from the first edition are part of the [Chapter 1 archive](/chapter-1) and are not assumed to be part of this edition.",
  "waysKicker": "Ways to collaborate",
  "waysTitle": "Shape the edition",
  "waysDeck": "Partnership options are discussed individually with each organization.",
  "inquiryKicker": "Partnership inquiry",
  "inquiryTitle": "Partner with InnovaHack",
  "inquiryBody": "Tell us about your organization and what you'd like to bring to Chapter 2. Inquiries are private and are only seen by the organizing team.",
  "emailPrompt": "Prefer email?"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Updates
insert into public.site_content (key, value) values ('copy.updates', $seed${
  "meta": {
    "title": "Event Updates & Announcements",
    "description": "Follow official InnovaHack Chapter 2 announcements, confirmed event details and guides for the planned 2027 AI and startup hackathon in India."
  },
  "section": "Updates & announcements",
  "crumb": "Build Log",
  "title": "The Build Log",
  "subtitle": "Stories from the innovation frontline.",
  "deck": "Official milestones, announcements and stories from InnovaHack. Nothing here is press coverage or a media endorsement.",
  "draftNote": "Entries marked *Draft* are internal drafts awaiting organizer approval. They contain only approved event information and have no publication date yet.",
  "draftBadge": "Draft · pending approval",
  "byLabel": "By",
  "emptyKicker": "The Build Log",
  "emptyTitle": "No updates have been published yet.",
  "emptyBody": "Join the update list to hear when the first announcement goes live.",
  "backLabel": "The Build Log",
  "moreTitle": "More from the Build Log"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Register
insert into public.site_content (key, value) values ('copy.register', $seed${
  "meta": {
    "title": "Registration & Event Updates",
    "description": "Check InnovaHack Chapter 2 registration status and join the update list for official signup dates, rules and announcements for the planned 2027 hackathon."
  },
  "section": "Registration",
  "statusBoard": "Status board",
  "rows": {
    "status": "Registration status",
    "teamSize": "Team-size rules",
    "fee": "Participation fee",
    "dates": "Registration dates"
  },
  "teamSizeValue": "Up to {max}",
  "teamSizeNoteFixed": "Teams can have up to {max} members, including the lead.",
  "teamSizeNoteMin": "Minimum {min}.",
  "teamSizeNoteOpen": "{note} The form accepts up to {max} members in total.",
  "registerKicker": "Team registration",
  "registerTitle": "Register your team",
  "registerDeck": "Read the [official rules](/rules) before you start. Fields marked * are required.",
  "updatesKicker": "Event updates",
  "updatesTitle": "Get event updates",
  "updatesBody": "Join the update list to hear about official news — registration opening, confirmed dates, rules, domains and partners. We only email when there is something official to share."
}$seed$::jsonb)
on conflict (key) do nothing;

-- Contact
insert into public.site_content (key, value) values ('copy.contact', $seed${
  "meta": {
    "title": "Contact the Organizers",
    "description": "Contact Elite Forums about InnovaHack Chapter 2, the planned 2027 national hackathon, for event questions and partnership inquiries."
  },
  "section": "Contact",
  "title": "Get in touch.",
  "deck": "Questions about InnovaHack Chapter 2? Send a message and the organizing team will reply by email.",
  "generalTitle": "General inquiries",
  "generalFallback": "Use the form on this page.",
  "partnershipsTitle": "Partnerships & sponsorship",
  "partnershipsBody": "Use the [partnership inquiry form](/partners#inquiry)",
  "partnershipsEmail": "or write to",
  "beforeTitle": "Before you write",
  "beforeBody": "Many answers are in the [FAQ](/faq). The event dates, finale venue and full rules will appear here as they are confirmed.",
  "followTitle": "Follow"
}$seed$::jsonb)
on conflict (key) do nothing;

-- FAQ page
insert into public.site_content (key, value) values ('copy.faq', $seed${
  "meta": {
    "title": "Hackathon FAQs",
    "description": "Get answers about InnovaHack Chapter 2 registration, eligibility, AI and startup tracks, prizes, partners and the planned 2027 event timeline."
  },
  "section": "FAQ",
  "title": "Questions, answered.",
  "deck": "Everything we can confirm today about InnovaHack Chapter 2. Where something hasn't been decided yet, we say so.",
  "stillTitle": "Still have a question?",
  "stillCta": "Contact the organizers"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Rules page
insert into public.site_content (key, value) values ('copy.rules', $seed${
  "meta": {
    "title": "Hackathon Rules & Eligibility",
    "description": "Read confirmed competition principles for InnovaHack Chapter 2, including its Artificial Intelligence and Open Innovation / Startup domains. Full rules are pending."
  },
  "section": "Official rules",
  "title": "The rulebook.",
  "deckPublished": "Version {version}, effective {effectiveFrom}.",
  "deckPending": "The official Chapter 2 rulebook has not been published yet. It will appear here before registration opens. Below are the principles already confirmed.",
  "confirmedKicker": "Confirmed",
  "confirmedTitle": "Already confirmed",
  "pendingKicker": "To be published",
  "pendingTitle": "What the rulebook will cover",
  "pendingDeck": "These topics will be set out in the official rules. Nothing below is a rule yet.",
  "notifyCta": "Get notified when rules are published",
  "faqCta": "Read the FAQ"
}$seed$::jsonb)
on conflict (key) do nothing;

-- Privacy
insert into public.site_content (key, value) values ('copy.privacy', $seed${
  "meta": {
    "title": "Privacy Notice",
    "description": "What information the InnovaHack Chapter 2 website collects through its forms, and how it is used."
  },
  "section": "Privacy",
  "title": "Privacy notice.",
  "deck": "How {organizer} handles the information you share through this website.",
  "sections": [
    {
      "title": "Who we are",
      "body": [
        {
          "type": "p",
          "text": "This website is operated by {organizer}, the organizer of {fullName}."
        }
      ]
    },
    {
      "title": "What we collect",
      "body": [
        {
          "type": "p",
          "text": "We only collect what you enter into a form:"
        },
        {
          "type": "list",
          "items": [
            "Event updates: your name, email, and optionally your college or organization and area of interest.",
            "Registration (when open): team lead contact details, city and state, team name, team members' names and emails, your chosen domain, project details and optional links.",
            "Partnership inquiries: your organization, name, role, business email and the details of your inquiry.",
            "Contact messages: your name, email, topic and message."
          ]
        },
        {
          "type": "p",
          "text": "We do not ask for sensitive personal information such as identity documents, financial details or health information."
        }
      ]
    },
    {
      "title": "How we use it",
      "body": [
        {
          "type": "p",
          "text": "Your information is used to send the updates you asked for, to run the competition, to respond to your inquiry, and to keep the forms secure (for example, rate limiting repeated submissions)."
        },
        {
          "type": "p",
          "text": "Team leads must have their team members' permission before sharing their details."
        }
      ]
    },
    {
      "title": "Who can see it",
      "body": [
        {
          "type": "p",
          "text": "Submissions are stored privately and are only accessible to the organizing team. They are never shown publicly on this website."
        },
        {
          "type": "p",
          "text": "If information is to be shared with partners — for example for hiring or mentoring — that will be stated clearly in the official rules and asked for separately."
        }
      ]
    },
    {
      "title": "Email",
      "body": [
        {
          "type": "p",
          "text": "Update emails are sent only when there is official news. Every update email will include a way to unsubscribe."
        }
      ]
    },
    {
      "title": "Your choices",
      "body": [
        {
          "type": "p",
          "text": "You can ask us to access, correct or delete your information, or to stop sending you updates, at any time using the contact page."
        }
      ]
    },
    {
      "title": "Retention",
      "body": [
        {
          "type": "p",
          "text": "We keep submissions only as long as needed for the purpose they were collected for, after which they will be deleted. The specific retention period will be confirmed before launch."
        }
      ]
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

-- Terms
insert into public.site_content (key, value) values ('copy.terms', $seed${
  "meta": {
    "title": "Terms & Conditions",
    "description": "Terms for using the InnovaHack Chapter 2 website."
  },
  "section": "Terms",
  "title": "Terms & conditions.",
  "deck": "The terms for using the {fullName} website.",
  "sections": [
    {
      "title": "About this website",
      "body": [
        {
          "type": "p",
          "text": "This website provides information about {fullName}, organized by {organizer}. Competition participation is governed by the official rules, which will be published separately."
        }
      ]
    },
    {
      "title": "Information on this site",
      "body": [
        {
          "type": "p",
          "text": "Details marked as planned, proposed or to be announced may change. Only details marked as confirmed are final."
        },
        {
          "type": "p",
          "text": "Chapter 1 figures are historical. Figures marked “as advertised” were promoted before that event and are not records of cash paid out or funding invested."
        }
      ]
    },
    {
      "title": "Your submissions",
      "body": [
        {
          "type": "p",
          "text": "You agree to provide accurate information and to submit only information you are entitled to share."
        },
        {
          "type": "p",
          "text": "Automated, abusive or fraudulent submissions are not permitted and may be blocked."
        }
      ]
    },
    {
      "title": "Design and imagery",
      "body": [
        {
          "type": "p",
          "text": "The newspaper styling of this website is a design concept. It is not a news publication, and nothing on it is press coverage."
        },
        {
          "type": "p",
          "text": "Illustrations are original artwork inspired by Mumbai. Any photographs used are credited and licensed."
        }
      ]
    },
    {
      "title": "Changes",
      "body": [
        {
          "type": "p",
          "text": "These terms may be updated. The current version is always available on this page."
        }
      ]
    }
  ]
}$seed$::jsonb)
on conflict (key) do nothing;

commit;

-- <<< SEED: end

-- ════════════════════════════════════════════════════════════════════════════
--  Optional checks (run separately after setup):
--    select table_name from information_schema.tables
--     where table_schema = 'public' order by 1;
--    select id, public, file_size_limit from storage.buckets where id = 'site-media';
--
--  Useful queries:
--    select * from public.registrations_view order by created_at desc;
--    select count(*) from public.interest_signups;
--    select key, updated_at from public.site_content order by key;
--    delete from public.site_content where key = 'copy.home';  -- reset a section
-- ════════════════════════════════════════════════════════════════════════════
