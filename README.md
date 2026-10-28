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

---

## Where things live

```
src/
  content/          ← all event content and configuration (edit these, not components)
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
  lib/
    server/           Storage adapter, rate limiting, email, shared form handler (server-only)
    validation.ts     Zod schemas (server-side validation)
    options.ts        Form option lists (zod-free, safe for client bundles)
  proxy.ts          Returns a real 404 for unknown article slugs
scripts/mumbai-map/  Regenerates the map's OpenStreetMap outline (src/components/map/mumbai-boundary.ts)
supabase/schema.sql
tests/
```

---

## Editing content

Every factual claim carries a **status**, shown on the site as a small tag:

| Status | Meaning |
| --- | --- |
| `confirmed` | Officially confirmed for Chapter 2 |
| `planned` / `proposed` | Part of the plan; subject to final rules |
| `target` | A planning target — never shown as an achieved result |
| `advertised` | A historical figure as it was promoted (Chapter 1) |
| `reported` | A historical figure reported after the event (Chapter 1) |
| `unconfirmed` | Not decided yet — rendered as "To be announced" |

Leave unknown values as `null`; the site renders an honest "to be announced" state instead of inventing
details.

**Common changes (all in `src/content/event.ts`):**

- **Registration state:** `registration.status` — `announcement`, `interest`, `soon`, `open` or `closed`.
  You can also set the `REGISTRATION_STATUS` environment variable. Pages are prerendered, so **rebuild and
  redeploy after changing it.** The registration API enforces the same status server-side.
- **Dates:** set `registration.opensOn.value` and each `journey[].date` to an ISO date (e.g. `"2027-02-01"`).
- **Venue, team size, fee, prize pool:** set the value and change `status` to `"confirmed"`. Team-size
  limits are enforced by the registration form and API once `teamSize.max`/`min` are set.
- **Awards:** add entries to `awards` with `kind`, `value`, `eligibility` and `conditions`. Keep cash
  separate from credits, hardware, mentorship, incubation consideration and investor introductions.
- **Partners:** add to `partners` with `verified: true`. Only verified partners render. Chapter 1 partners go
  in `chapter1.ts`, never here.
- **Participation metrics:** fill `participation[].value` only from real registration data.

**Articles (`src/content/updates.ts`):** three internal drafts are included, written only from the brief.
They are stamped *Draft · pending approval* and excluded from the sitemap and search indexing. To publish
one, set `draft: false` and `publishedOn`. Set `HIDE_DRAFT_ARTICLES=true` to hide all drafts.

**Photography:** organizer-supplied photos live in `src/assets/photos/` and are registered, with alt text,
caption credit and crop position, in `src/content/media.ts`. Each content entry (`city.ts`, `domains.ts`,
`updates.ts`) points to a photo through its media slot's `photo` field. The SVG illustrations stay as the
fallback for any slot without an approved photo. The hero collage, domain artwork and Gateway of India sketch
are transparent cutouts in `src/assets/cutouts/`, extracted from the supplied collage sheet. To swap a photo,
replace the file (keep the name) or add a new import in `media.ts`. Next.js resizes and serves modern formats
automatically.

**Map of Mumbai (Section 09):** the outline of Mumbai City and Mumbai Suburban districts comes from
OpenStreetMap (© OpenStreetMap contributors, ODbL — the attribution under the map must stay). It is baked
into simplified SVG paths by `python3 scripts/mumbai-map/generate.py`, so the page makes no map requests at
runtime. Stations and landmarks are edited in `src/content/mumbai-map.ts` as latitude/longitude. Rail lines
are drawn station to station, so they're approximate. The map doesn't mark a venue; add one only once it's
confirmed.

---

## Forms and storage

Four public forms post JSON to route handlers: event updates (`/api/updates`), registration
(`/api/register`), partnership inquiries (`/api/partner-inquiry`) and contact (`/api/contact`).

Each request is checked in this order: same-origin, JSON content type, body size limit, rate limit
(per IP), honeypot field, minimum fill time, then Zod validation. Only after that is the record stored.
**Success is shown only after storage confirms the write.** Duplicates (same email, or the same message)
are rejected with a clear message.

| Storage driver | When it's used |
| --- | --- |
| Supabase | `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set |
| File (JSON lines) | Development, or `STORAGE_DRIVER=file` on a persistent disk |
| None | Production with nothing configured — forms answer **503 "nothing was saved"** |

**Supabase setup:** run `supabase/schema.sql` in the SQL editor. Row-level security is enabled with no
policies, so the public anon key can't read or write; the site uses the service-role key from the server
only. Read submissions in the Supabase dashboard (Table editor) or by SQL.

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

1. Import the repository in Vercel (framework preset: Next.js).
2. Add environment variables from `.env.example`: at minimum `NEXT_PUBLIC_SITE_URL`,
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy. After changing `REGISTRATION_STATUS` or any content file, redeploy.

Any Node 20+ host works with `npm run build && npm start`.

---

## Testing and quality — results measured on this build

All results below come from a local production server (`next start`):

- **Lint, type-check, production build:** pass.
- **Smoke tests (`npm test`):** 10/10 pass. They cover every route (one `h1`, unique titles), all internal
  links, 404s, sitemap/robots/OG image, the two-domain and Chapter 1 accuracy rules, and every form branch
  (stored, duplicate, invalid, honeypot, too fast, cross-origin, wrong content type, rate limit,
  registration closed and open).
- **Browser tests (`npm run test:browser`):** 6/6 pass, including the full team-registration flow with
  `REGISTRATION_STATUS=open`. They cover server-confirmed success and duplicate messages, native required-field
  validation, the mobile menu (Escape, focus return), no horizontal overflow at 320px, and the skip link.
- **Lighthouse 12, homepage with the supplied photos** (two runs each):
  - Desktop: Performance 98–99, Accessibility 100, Best Practices 96, SEO 100, CLS 0. Best Practices loses
    points for "low resolution" images: the hero cutouts display larger than their 1536px source sheet allows.
  - Mobile (simulated slow 4G): Performance 87–92, LCP 3.4–4.1 s (the masthead headline), Accessibility 100,
    Best Practices 100, SEO 100.
- **Earlier run, illustrations only** (`/`, `/tracks`, `/chapter-1`, `/register`): desktop Performance 100;
  mobile Performance 90–96.

---

## Needs organizer input before launch

- [ ] Chapter 2 dates, finale venue, team-size rules, eligibility, any fee, prize pool and awards
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
