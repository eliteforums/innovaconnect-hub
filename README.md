# InnovaHack — Elite Forums

> **India's Largest Hiring & Startup Hackathon**
> Hack. Get Hired. Get Funded.

InnovaHack is a 30-hour elite hackathon where the **top 200–250 teams** of
India's builders meet hiring companies, investors, and incubators.
This repository contains the official InnovaHack / Elite Forums website,
admin dashboard, and Supabase backend schema.

🔗 **Repository:** https://github.com/eliteforums/innovaconnect-hub

---

## ✨ Features

- 🎨 Editorial, animation-driven landing page (Framer Motion + Tailwind)
- 🧭 Multi-page marketing site: Home, About, Sponsor Us, Partner, Tracks,
  Sponsors, Community Partners, Email Us, and partner proposal pages
  (Hiring / Tech / Education / Domain / College / Community).
- 📝 Registration flow + contact / partnership inquiry forms.
- 🔐 **Admin dashboard** (`/admin`) — Supabase-auth protected.
  Edit every section of the site (Hero, Domains, Process, Outcomes, FAQ,
  Fees, CTA, About, Settings) from the browser. No redeploy needed for
  content changes.
- 🗄️ **Supabase** backend: `site_content`, `registrations`,
  `contact_inquiries`, and `sponsors` tables with Row Level Security.
- 🔄 **Graceful fallbacks**: if Supabase is unreachable, the site
  renders with safe `DEFAULT_CONTENT` from code.
- ⚡ **SPA fallbacks** included for Netlify, Cloudflare Pages, and GitHub
  Pages so deep links (`/sponsor-us`, `/partner`, `/admin`, …) always work.

---

## 🛠 Tech Stack

| Layer         | Tech                                                     |
| ------------- | -------------------------------------------------------- |
| Frontend      | React 18 + TypeScript + Vite                             |
| Styling       | Tailwind CSS + shadcn/ui + Radix Primitives              |
| Animation     | Framer Motion                                            |
| Routing       | React Router v6                                          |
| Backend / DB  | Supabase (PostgreSQL + Auth + RLS)                       |
| Forms / State | React Hook Form, TanStack Query                          |
| Tooling       | pnpm, ESLint, TypeScript strict mode                     |

---

## 📁 Project Structure

```
innovaconnect-hub/
├── public/                      # Static assets (favicon, og-image, _redirects…)
├── src/
│   ├── components/              # Reusable UI (Navbar, Footer, sections, shadcn/ui)
│   ├── contexts/
│   │   ├── ContentContext.tsx   # Live site content + DEFAULT_CONTENT fallbacks
│   │   └── PortalAuthContext.tsx
│   ├── lib/
│   │   └── supabase.ts          # Supabase client + data helpers
│   ├── pages/
│   │   ├── Index.tsx            # Landing page
│   │   ├── About.tsx
│   │   ├── Admin.tsx            # Admin dashboard (/admin)
│   │   ├── Register.tsx
│   │   ├── Partner.tsx
│   │   ├── SponsorUs.tsx
│   │   ├── Tracks.tsx
│   │   ├── Sponsors.tsx
│   │   ├── CommunityPartners.tsx
│   │   ├── EmailUs.tsx
│   │   └── partners/            # Per-partner proposal pages
│   ├── App.tsx                  # Router + providers
│   └── main.tsx                 # Vite entry
├── supabase/
│   └── schema.sql               # Full DB schema + RLS + seed data
├── index.html                   # Root HTML + SEO meta + JSON-LD
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+ (`npm i -g pnpm`)
- A **Supabase** project (free tier is fine)

### 1. Clone & install

```bash
git clone https://github.com/eliteforums/innovaconnect-hub.git
cd innovaconnect-hub
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

You can find both values in **Supabase Dashboard → Project Settings → API**.

### 3. Set up the database

In **Supabase Dashboard → SQL Editor**, paste and run the contents of
`supabase/schema.sql`. The script is **idempotent** — it's safe to
re-run after edits. It will:

- Create the `registrations`, `contact_inquiries`, `site_content`,
  `sponsors` tables.
- Enable Row Level Security with sensible policies.
- Seed default content for every site section (hero, domains, process,
  outcomes, FAQ, fees, CTA, about, settings).

### 4. Create an admin user

Admin access is gated by Supabase auth. Create a user in
**Supabase → Authentication → Users → Add user**, then log in at
`/admin` using that email + password.

### 5. Run the dev server

```bash
pnpm dev
```

The site will be available at `http://localhost:8080` (or the port shown
by Vite).

---

## 📜 Available Scripts

| Command           | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `pnpm dev`        | Start Vite dev server with HMR                   |
| `pnpm build`      | Production build → `dist/`                       |
| `pnpm preview`    | Preview the production build locally             |
| `pnpm lint`       | Run ESLint over the whole project                |

---

## 🛡️ Admin Dashboard

Visit **`/admin`**, log in with a Supabase user, and you'll land on a
dashboard that lets you edit every live section of the site:

- **Hero** — headline, tagline, ticker, key facts, CTAs
- **Domains** — the 5 hackathon tracks
- **Process** — the 5-step participant journey
- **Outcomes** — prize pool & benefits
- **FAQ** — questions & answers
- **Fees & Logistics** — registration fee, ROI benefits
- **About** — mission, org copy, stats, transparency pillars
- **CTA block** — final call-to-action on the homepage
- **Settings** — contact emails, social links, registration toggles,
  login/register visibility

All edits are persisted to the `site_content` table in Supabase and
picked up by the frontend on next load — **no redeploy required**.

---

## 🔁 Content Flow (How defaults + DB merge)

1. On first render, every component reads from **`DEFAULT_CONTENT`**
   defined in `src/contexts/ContentContext.tsx`. This guarantees the
   site renders correctly even if Supabase is down or empty.
2. `ContentProvider` then fetches `site_content` from Supabase.
3. For each row, DB values are **merged on top of** the defaults
   (DB wins per key, but missing keys fall back to the code default).
4. Components subscribe via `useContent()` and re-render with the new
   values.

> **Important**: If you see stale text on the live site, it's almost
> always either (a) your host hasn't rebuilt from `main`, (b) your
> browser/CDN has cached the old JS bundle (hard-refresh with
> `Ctrl/Cmd + Shift + R`), or (c) an old row is still in
> `site_content` overriding defaults — inspect that table in the
> Supabase dashboard.

---

## 🚢 Deployment

The project is a standard Vite SPA — any static host works.

### Netlify / Cloudflare Pages

1. Connect the repo.
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. Set environment variables `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
5. SPA fallback files (`public/_redirects`) are already included so
   deep links like `/sponsor-us` and `/admin` resolve correctly.

### Vercel

1. Import the GitHub repo.
2. Framework preset: **Vite**.
3. Add the same two env vars above.
4. Deploy.

> After **any** content change from the admin panel, users may need to
> hard-refresh to bypass browser cache. After **any** code change, your
> host must rebuild from `main` before changes go live.

---

## 🤝 Contributing

1. Fork the repo & create a feature branch:
   `git checkout -b feat/my-change`
2. Run `pnpm lint` and `pnpm build` before committing.
3. Open a pull request against `main` with a clear description.

---

## 📬 Contact

- **General**: hello@eliteforums.in
- **Sponsorships**: sponsors@eliteforums.in
- **Partnerships**: partnerships@eliteforums.in

---

## 📄 License

© Elite Forums. All rights reserved.