# InnovaHack — Hackathon Management System

> **India's Largest Hiring & Startup Hackathon**
> Hack. Get Hired. Get Funded.

InnovaHack is a 30-hour elite hackathon where the **top 200–250 teams** from
8,000–10,000 nationwide applicants compete for hiring opportunities, startup
funding, and incubation. This repository contains the full-stack platform:
marketing website, admin dashboard, finalist portal, and hackathon management
system (HMS).

🔗 **Live:** [innovahack.eliteforums.in](https://innovahack.eliteforums.in)

---

## ✨ Platform Overview

| Module | Route | Purpose |
|--------|-------|---------|
| Marketing Site | `/`, `/about`, `/tracks`, `/sponsors` | Public-facing landing pages |
| Registration | `/register` | Participant registration flow |
| Admin Dashboard | `/admin` | Content management + HMS operations |
| Finalist Portal | `/finalist/*` | Authenticated finalist team workspace |
| Partner Portal | `/portal` | Partner/sponsor dashboards |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                        │
├──────────────────┬──────────────────┬───────────────────────────┤
│  Admin Dashboard │  Finalist Portal │  Marketing + Portal        │
│  /admin/*        │  /finalist/*     │  /, /portal, /register     │
└────────┬─────────┴────────┬─────────┴───────────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend-as-a-Service)                   │
├────────────┬──────────┬──────────────┬──────────────────────────┤
│ PostgreSQL │   Auth   │   Storage    │   Edge Functions           │
│ + RLS      │ (JWT)    │ (Signed URLs)│ (Deno runtime)            │
└────────────┴──────────┴──────────────┴──────────────────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Resend API  │
                                       │  (Email)     │
                                       └─────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Radix Primitives |
| Animation | Framer Motion |
| Routing | React Router v6 (lazy-loaded) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod validation |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions + RLS) |
| Email | Resend API (via Edge Functions) |
| Hosting | Vercel (auto-deploy from GitHub) |
| Testing | Vitest + Testing Library + Playwright |
| Analytics | Vercel Analytics |

---

## 📁 Project Structure

```
innovaconnect-hub/
├── public/                          # Static assets
├── src/
│   ├── components/
│   │   ├── admin/sections/hms/      # HMS admin section components (7 modules)
│   │   ├── admin/sections/          # Content editor sections
│   │   ├── landing/                 # Landing page sections
│   │   └── ui/                      # shadcn/ui components
│   ├── contexts/                    # React contexts (Content, PortalAuth)
│   ├── hooks/                       # Custom hooks
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client + existing helpers
│   │   ├── hms.ts                  # HMS types + query functions
│   │   ├── hmsValidation.ts        # Zod schemas + password generator
│   │   ├── hmsAuth.ts             # Finalist auth (Team ID, lockout)
│   │   └── portalAuth.ts          # Portal role resolution
│   ├── pages/
│   │   ├── admin/                  # Admin login + dashboard
│   │   ├── finalist/              # Finalist portal (8 pages)
│   │   ├── portal/               # Partner portal
│   │   └── partners/             # Partner proposal forms
│   ├── App.tsx                    # Router + providers
│   └── main.tsx                   # Entry point
├── supabase/
│   ├── migrations/                # HMS database migrations (run in order)
│   │   ├── 001_hms_schema.sql
│   │   ├── 002_hms_rls_policies.sql
│   │   └── 003_hms_storage.sql
│   ├── functions/                 # Edge Functions (Deno)
│   │   ├── generate-credentials/
│   │   ├── send-email/
│   │   └── bulk-shortlist/
│   ├── schema.sql                 # Base schema (registrations, site_content, etc.)
│   └── INSTRUCTIONS.md            # Full setup guide
├── .env.example                   # Environment variable template
├── vite.config.ts                 # Build config with code splitting
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (20 recommended)
- **npm** 9+ or **pnpm** 8+
- A **Supabase** project (free tier works for development)
- A **Resend** account (for email delivery)

### 1. Clone & Install

```bash
git clone https://github.com/eliteforums/innovaconnect-hub.git
cd innovaconnect-hub
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase project URL and anon key. See `.env.example` for all variables.

### 3. Database Setup

Run migrations in order in **Supabase SQL Editor**:

```bash
# 1. Base schema (if not already done)
supabase/schema.sql

# 2. HMS tables
supabase/migrations/001_hms_schema.sql

# 3. RLS policies
supabase/migrations/002_hms_rls_policies.sql

# 4. Storage buckets
supabase/migrations/003_hms_storage.sql
```

### 4. Edge Functions Setup

Deploy edge functions to your Supabase project:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_api_key

# Deploy functions
supabase functions deploy generate-credentials
supabase functions deploy send-email
supabase functions deploy bulk-shortlist
```

### 5. Create Admin User

1. Create a user in **Supabase → Authentication → Users**
2. Insert their admin role:
```sql
INSERT INTO admin_roles (user_id, role)
VALUES ('user-uuid-from-auth', 'super_admin');
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:8080`

---

## 📜 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## 🎯 HMS Features (Hackathon Management System)

### Admin Dashboard (`/admin` → HMS section)

| Module | Description |
|--------|-------------|
| **Shortlisting** | Bulk-select or CSV-upload to shortlist registrations |
| **Credentials** | Auto-generate Team IDs, auth accounts, send credential emails |
| **Problem Statements** | Create, schedule release, attach resources |
| **Submissions** | Review deliverables, filter by domain/status, flag for review |
| **Notifications** | Create announcements, schedule, send via email |
| **Analytics** | Team metrics, domain breakdown, submission timeline chart |
| **Team Management** | Search, filter, view detailed team profiles |

### Finalist Portal (`/finalist/*`)

| Page | Description |
|------|-------------|
| **Login** | Email or Team ID (IH-XXXX) + password |
| **Force Password** | Required on first login (temp password change) |
| **Dashboard** | Progress tracker, deadlines, recent announcements |
| **Profile** | View/edit team members, GitHub URL |
| **Problem Statements** | View released statements, download resources |
| **Submissions** | Upload GitHub, pitch deck, video, docs, proof-of-work |
| **Announcements** | View notifications with read tracking |

---

## 🔐 Security

- **Row Level Security (RLS)** on all tables — users only see their own data
- **JWT-based sessions** with 7-day expiry
- **Signed URLs** for all file access (15-min upload, 1-hour download)
- **Account lockout** after 5 failed login attempts (15-min cooldown)
- **Role hierarchy**: Super Admin > Moderator > Team Leader
- **No public storage buckets** — all finalist files require authentication
- **Service role key** only used server-side in Edge Functions

---

## ⚡ Performance (50K+ Users)

The platform is designed to handle 50,000+ concurrent users:

- **Code splitting** — 45 lazy-loaded chunks, only download what's needed
- **Vendor chunking** — React, Supabase, Framer Motion, Radix, Charts separated
- **TanStack Query** — 5-min stale time, 10-min GC, no refetch on window focus
- **Supabase connection pooling** — PgBouncer handles concurrent connections
- **Database indexes** on all frequently queried columns
- **Batch processing** — Credential generation in batches of 50 with rate limiting
- **Email rate limiting** — Max 10 emails/second to respect Resend limits
- **Signed upload URLs** — Direct-to-storage uploads bypass the server
- **Edge Functions** — Deployed globally on Deno Deploy (low latency)
- **Vercel Edge Network** — CDN-cached static assets worldwide
- **Gzip compression** — All assets compressed (largest chunk: 102KB gzipped)

### Recommended Supabase Plan for Production

For 50K users with 250 finalist teams:
- **Pro Plan** ($25/month) — 8GB database, 250GB bandwidth, 100K auth users
- Enable **connection pooling** (PgBouncer) in Supabase settings
- Set **pool mode** to "Transaction" for best concurrency
- Enable **Read Replicas** if read-heavy traffic exceeds single instance

---

## 🚢 Deployment

### Vercel (Recommended)

1. Import GitHub repo in Vercel
2. Framework preset: **Vite**
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Edge Functions (Supabase)

```bash
supabase functions deploy generate-credentials
supabase functions deploy send-email
supabase functions deploy bulk-shortlist
```

Set secrets in Supabase Dashboard → Edge Functions → Secrets:
- `RESEND_API_KEY`

### Production Checklist

- [ ] Supabase Pro plan activated
- [ ] Connection pooling enabled (PgBouncer, Transaction mode)
- [ ] All RLS policies verified
- [ ] Edge Functions deployed with secrets set
- [ ] Resend domain verified (for email deliverability)
- [ ] Vercel environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error monitoring enabled (Vercel/Sentry)

---

## 🤝 Contributing

1. Fork & create a feature branch: `git checkout -b feat/my-change`
2. Run `npm run lint && npm run build && npm test` before committing
3. Open a PR against `main` with a clear description

---

## 📬 Contact

- **General**: hello@eliteforums.in
- **Sponsorships**: sponsors@eliteforums.in
- **Partnerships**: partnerships@eliteforums.in
- **Technical**: tech@eliteforums.in

---

## 📄 License

© 2026 Elite Forums. All rights reserved.
