# InnovaHack Chapter 2 — Mumbai Edition

The official website for **InnovaHack Chapter 2**, the national hackathon organized by **Elite Forums**.
Design concept: *The Innovation Times* — a premium newspaper special edition inspired by Mumbai's streets,
heritage and culture, telling the story of India's next generation of builders.

> "Rooted in Mumbai. Built for India. Designed for the future."

**Stack:** Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Zod · Lucide icons · optional Supabase (PostgreSQL) and Resend.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

In development, form submissions are stored as JSON lines in `.data/` (git-ignored), so every form
works with no setup.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm test` | End-to-end smoke tests against `BASE_URL` (default `http://localhost:3000`) |
| `npm run test:browser` | Browser tests (Playwright core); set `CHROME_PATH` to a local Chrome |
| `npm run test:admin` | Admin dashboard tests (needs writable storage) |
| `npm run db:seed-sql` | Regenerates the content seed in `supabase/schema.sql` from `src/content/` |

---

## Where things live

```
src/
  content/          ← built-in default content (the admin dashboard overrides it per section)
    copy.ts           Every heading, paragraph and label on every page, plus layout image slots
    event.ts          Chapter 2 config: status, dates, venue, team size, prizes, partners, contact
    chapter1.ts       Chapter 1 historical archive (kept separate from Chapter 2)
    domains.ts        The two official competition domains
    city.ts           Mumbai editorial features (inspiration only — never domains)
    updates.ts        Build Log articles
    mumbai-map.ts     Section 09 map: rail lines, labelled stations, numbered landmarks
    faq.ts, rules.ts, navigation.ts
  app/              ← routes (17 public pages + 4 API routes, sitemap, robots, OG image)
  components/
    illustrations/    Original SVG artwork: taxi, BEST bus, local train, autorickshaw,
                      heritage architecture, Marine Drive, Kala Ghoda, street food, AI & startup
    home/ forms/ layout/ media/ tracks/ ui/ updates/
  app/admin/         ← the admin dashboard (login, overview, editors, submissions, media)
  lib/
    content/          Content loader (cached, invalidated on save), section registry, sanitizer
    media-library.ts  Built-in images by key
    server/           Storage, admin store & auth, rate limiting, email, form handler (server-only)
    validation.ts     Zod schemas (server-side validation)
    options.ts        Form option lists (zod-free, safe for client bundles)
  proxy.ts          Returns a real 404 for unknown article slugs
scripts/mumbai-map/  Regenerates the map's OpenStreetMap outline (src/components/map/mumbai-boundary.ts)
supabase/schema.sql
tests/
```

---

## Admin dashboard

Everything on the site can be edited at **`/admin`** without touching code, and all four kinds of form
submission can be read there.

**Sign in:** username `admin`, password `admin` by default. **Change these before the site is public** by
setting `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The dashboard shows a warning banner while the defaults are in
use. Anyone who signs in can rewrite pages and read registrants' personal details.

| Area | What you can do |
| --- | --- |
| Overview | Submission counts, latest submissions, storage/email status, recently edited sections |
| Form submissions | Registrations, update list, partner inquiries, contact messages: search, expand, delete, export CSV |
| Edit · Event | Event settings (registration status, dates, venue, team size, fee, prizes, awards, partners, contacts, journey, participation figures), domains, Build Log articles, FAQ, rules, Chapter 1 archive |
| Edit · Mumbai & media | Hero sidebar and city stories, the Mumbai map, every layout image (hero collage layers, domain artwork, footer skyline) |
| Edit · Site | Header and footer navigation; global text, SEO title and description, status labels, 404 page |
| Edit · Page text | Every heading, paragraph, button and label on every page |
| Image library | Upload, preview, copy and delete images |

**How editing works**

- Each section is a form generated from its content: text boxes, dropdowns for fixed choices (status, award
  type…), image pickers with upload, and lists you can add to, duplicate, reorder and remove from. Power users
  can switch any section to **Edit as JSON**.
- **Save & publish** updates the live site immediately. Static pages are regenerated on the next visit, with no
  redeploy needed. **Reset to default** discards your edits to that section.
- Text supports a small markup: `*words*` in the accent colour, `[text](/link)` for links, new lines for line
  breaks, and `{organizer}`, `{year}`, `{fullName}` placeholders.
- Saved content is checked against the shape of the built-in defaults. A field saved with the wrong type falls
  back to its default instead of breaking a page.
- Images are referenced by library key (e.g. `bmcTaxi`) or by the URL of an upload. Uploads go to Supabase
  Storage (bucket `site-media`) or, locally, to `.data/uploads`.

**Security:** sessions are random tokens stored server-side (only a SHA-256 hash is kept), in an `HttpOnly`,
`SameSite=Strict` cookie that expires after 12 hours. Login attempts are rate-limited, and the password
comparison is constant-time. Every admin page, server action and export re-checks the session, and `/admin` is
excluded from search engines.

**Storage:** the dashboard needs storage (Supabase in production, run `supabase/schema.sql`). Without it, sign-in
is refused with an explanation. Storage settings must also be available at **build time**, because pages are
prerendered with the saved content. Vercel provides environment variables to builds by default.

## Built-in content (defaults)

The files in `src/content/` are the **defaults** the dashboard starts from. Saved dashboard edits override them
section by section. You can still edit the files directly; anything not overridden in the dashboard shows the new
default after a deploy.

Every factual claim carries a **status**, shown on the site as a small tag:

| Status | Meaning |
| --- | --- |
| `confirmed` | Officially confirmed for Chapter 2 |
| `planned` / `proposed` | Part of the plan; subject to final rules |
| `target` | A planning target — never shown as an achieved result |
| `advertised` | A historical figure as it was promoted (Chapter 1) |
| `reported` | A historical figure reported after the event (Chapter 1) |
| `unconfirmed` | Not decided yet — rendered as "To be announced" |

Leave unknown values empty (null); the site renders an honest "to be announced" state instead of inventing
details. Three Build Log articles ship as drafts written only from the brief. They're stamped *Draft* and
excluded from search engines until you set `draft` to false and add a `publishedOn` date.

## Forms and storage

Four public forms post JSON to route handlers: event updates (`/api/updates`), registration
(`/api/register`), partnership inquiries (`/api/partner-inquiry`) and contact (`/api/contact`).

Each request is checked in this order: same-origin, JSON content type, body size limit, rate limit
(per IP), honeypot field, minimum fill time, then Zod validation. Only after that is the record stored.
**Success is shown only after storage confirms the write.** Duplicates (same email, or the same message)
are rejected with a clear message.

| Storage driver | When it's used |
| --- | --- |
| Supabase | `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) are set |
| File (JSON lines) | Development, or `STORAGE_DRIVER=file` on a persistent disk |
| None | Production with nothing configured — forms answer **503 "nothing was saved"** |

**Supabase setup (one file):** open Supabase → SQL Editor, paste all of `supabase/schema.sql` and run it.
It's safe to run again after updates and never deletes data. It creates:

- the four submission tables (`interest_signups`, `registrations`, `partner_inquiries`, `contact_messages`);
- `site_content` for dashboard edits and `admin_sessions` for sign-ins (expired sessions are purged
  automatically);
- the public `site-media` bucket for uploaded images (5 MB limit, JPEG/PNG/WebP/GIF/AVIF);
- read-only `*_view` views that flatten submissions into columns for the Supabase Table Editor;
- **seed data:** every editable section of the website (26 rows in `site_content`), so the database holds the
  complete site content from day one. Seed rows use `on conflict do nothing`, so re-running the file never
  overwrites dashboard edits.

The seed is generated from the built-in content in `src/content/`. If you change those files, run
`npm run db:seed-sql` to refresh the seed block in `schema.sql`. Already-seeded databases keep their rows; use
**Reset to default** in the dashboard and re-run the SQL to pick up a new version of a section.

Row-level security is on with no policies, and the `anon`/`authenticated` roles have no privileges, so a
publishable key can't read or write anything. The site uses an elevated Supabase secret key from the server
only. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (Project Settings → API Keys) in your environment. The
legacy `SUPABASE_SERVICE_ROLE_KEY` variable is also supported during migration. Never expose either elevated
key in browser code.

**Email (optional):** set `RESEND_API_KEY`, `EMAIL_FROM` and `NOTIFY_EMAIL`. Confirmation and organizer
notification emails are sent only after a successful write.

### Security notes

- The rate limiter is in-memory per server instance. On serverless or multi-instance hosting, add a
  shared limiter (for example Upstash Redis or your platform's firewall rules).
- Client IPs are read from `x-forwarded-for`. That's correct behind a proxy that sets the header (Vercel,
  most load balancers). If you serve Node directly to the internet, strip incoming `x-forwarded-for` first.
- Security headers (HSTS, `X-Frame-Options`, `nosniff`, Referrer and Permissions policies) are set in
  `next.config.ts`.
- There is no admin interface. If you add one, protect it with real server-side authentication.

---

## Deployment (Vercel)

1. Import the repository in Vercel. `vercel.json` pins the framework to Next.js, which overrides any older
   dashboard setting such as a Vite preset with a `dist` output directory.
2. Add environment variables from `.env.example`: at minimum `NEXT_PUBLIC_SITE_URL`,
   `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`).
3. Deploy. After changing `REGISTRATION_STATUS` or any content file, redeploy.

### Search visibility

- Set `NEXT_PUBLIC_SITE_URL` to the final public HTTPS domain so canonical URLs, Open Graph URLs and the sitemap all use the same host.
- To verify the site in Google Search Console, set `GOOGLE_SITE_VERIFICATION` to the token from the HTML-tag verification method, then redeploy.
- After verification, submit `https://<your-domain>/sitemap.xml` in Search Console and use URL Inspection to check the homepage and the two domain pages.

Vercel's filesystem is read-only, so `STORAGE_DRIVER=file` doesn't work there. Use Supabase. Without it, the
site deploys and every page works, but the forms reply that submissions are unavailable and save nothing.

Any Node 20+ host works with `npm run build && npm start`.

---

## Testing and quality — results measured on this build

All results below come from a local production server (`next start`):

- **Lint, type-check, production build:** pass.
- **Smoke tests (`npm test`):** 10/10 pass. They cover every route (one `h1`, unique titles), all internal
  links, 404s, sitemap/robots/OG image, the two-domain and Chapter 1 accuracy rules, and every form branch
  (stored, duplicate, invalid, honeypot, too fast, cross-origin, wrong content type, rate limit,
  registration closed and open).
- **Browser tests (`npm run test:browser`):** 5/5 pass in the default mode. The sixth test, the full
  team-registration flow, runs when the server has `REGISTRATION_STATUS=open` and passed on the earlier build.
  They cover server-confirmed success and duplicate messages, native required-field validation, the mobile menu
  (Escape, focus return), no horizontal overflow at 320px, and the skip link.
- **Admin tests (`npm run test:admin`):** 9/9 pass on the production build:
  - signed-out redirect (a real 307) and a refused CSV export;
  - wrong-password rejection, then sign-in with an `HttpOnly` / `SameSite=Strict` cookie;
  - submissions listed, searched and exported as CSV;
  - a text edit appearing on the live prerendered homepage, then reset;
  - invalid content falling back to defaults;
  - the registration status switching the registration form and API on and off;
  - image upload and delete;
  - sign-out.
- **Lighthouse 12, with the dashboard:** three interleaved mobile runs of the homepage against the previous commit
  gave Performance 84–92 (previous: 86–89). First paint is about 0.2 s later (1.4 s against 1.1–1.2 s), because the
  homepage HTML is about 6% larger (+2.5 KB gzipped) now that each section reads editable content.
- **Lighthouse 12, homepage with the supplied photos** (two runs each, before the dashboard):
  - Desktop: Performance 98–99, Accessibility 100, Best Practices 96, SEO 100, CLS 0. Best Practices loses
    points for "low resolution" images: the hero cutouts display larger than their 1536px source sheet allows.
  - Mobile (simulated slow 4G): Performance 87–92, LCP 3.4–4.1 s (the masthead headline), Accessibility 100,
    Best Practices 100, SEO 100.
- **Earlier run, illustrations only** (`/`, `/tracks`, `/chapter-1`, `/register`): desktop Performance 100;
  mobile Performance 90–96.

---

## Needs organizer input before launch

- [ ] Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` (the defaults are admin / admin)
- [ ] Chapter 2 dates, finale venue, team-size rules, eligibility, any fee, prize pool and awards (all editable in
      the dashboard under Event settings)
- [ ] Official rulebook (`src/content/rules.ts`, `published: true`) and evaluation criteria per domain
- [ ] General contact email and social links (`event.contact`, `event.social`). The partnership address
      `sponsors@eliteforums.in` was taken from the Chapter 1 site; confirm it for Chapter 2.
- [ ] Verify the Chapter 1 figures against the organizer's records, especially the post-event recap's
      170 finalist teams and the advertised ₹1 crore+ funding opportunity
- [ ] Verified Chapter 1 winners, partners (with correct roles), judges and mentors, and approved photos
      (`src/content/chapter1.ts`). These sections show "awaiting verification" until filled in.
- [ ] Approve or rewrite the three draft Build Log articles
- [ ] Confirm usage rights for every supplied photo (`license` fields in `src/content/media.ts`). Two
      food photos carry third-party watermarks and need the owners' permission: misal pav (© Kannan's
      Kitchen) and pav bhaji (Shweta in the Kitchen). Their captions credit the source.
- [ ] Higher-resolution originals of the hero cutouts (taxi, BEST bus, local train, BMC building). The
      collage sheet they come from is 1536px wide, so they look slightly soft on high-density screens.
- [ ] Confirm which line the supplied local-train photo shows; it is captioned only as a suburban EMU.
- [ ] Legal review of `/privacy` and `/terms` (both marked as drafts on the page), including a data-retention period
- [ ] Production storage (Supabase) and, optionally, email credentials
