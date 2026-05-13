# InnovaHack 2026 — Supabase Setup Instructions

## Overview

This project uses [Supabase](https://supabase.com) as the backend for:
- **Database** — registrations, teams, submissions, problem statements, notifications
- **Auth** — admin panel + finalist portal authentication
- **Storage** — pitch decks, documentation, proof-of-work, finalist assets, resumes
- **Edge Functions** — credential generation, email delivery, bulk shortlisting
- **Row Level Security** — role-based access control on all tables

---

## Quick Start (Full Setup)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run migrations in SQL Editor (in order):
#    - supabase/schema.sql (base tables)
#    - supabase/migrations/001_hms_schema.sql
#    - supabase/migrations/002_hms_rls_policies.sql
#    - supabase/migrations/003_hms_storage.sql
# 3. Create admin user in Auth → Users
# 4. Insert admin role (see Step 5 below)
# 5. Deploy edge functions (see Step 7 below)
# 6. Set environment variables and run: npm run dev
```

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Fill in:
   - **Project Name:** `innovahack-2026`
   - **Database Password:** choose a strong password
   - **Region:** South Asia (Mumbai) for lowest latency
4. Click **"Create new project"** and wait ~2 minutes.

---

## Step 2: Run Base Schema

In **Supabase Dashboard → SQL Editor**, run:

```
supabase/schema.sql
```

This creates: `registrations`, `contact_inquiries`, `site_content`, `sponsors`, `judges_mentors`, `community_partners`, `partner_proposals` tables with RLS policies and seed data.

---

## Step 3: Run HMS Migrations (in order)

Run these three files in sequence:

### 3a. HMS Schema (`001_hms_schema.sql`)
Creates 10 HMS tables: `admin_roles`, `teams`, `team_members`, `problem_statements`, `submissions`, `notifications`, `notification_reads`, `email_log`, `access_audit_log`, `login_attempts`

### 3b. RLS Policies (`002_hms_rls_policies.sql`)
Enables Row Level Security on all HMS tables with role-based policies:
- **Super Admin** — full access to everything
- **Moderator** — read teams + review submissions
- **Team Leader** — own-team data only

### 3c. Storage Buckets (`003_hms_storage.sql`)
Creates 4 private storage buckets with team-scoped access policies:
- `pitch-decks` — PDF/PPTX, max 50MB
- `documentation` — PDF/DOCX, max 25MB
- `proof-of-work` — PNG/JPG/WEBP, max 10MB
- `finalist-assets` — Admin-uploaded problem statement resources

---

## Step 4: Create Admin User

1. Go to **Authentication → Users → Add user**
2. Enter admin email and strong password
3. Click **"Create user"**

---

## Step 5: Assign Admin Role

After creating the user, get their UUID from the Users table, then run:

```sql
-- Replace with actual user UUID from Authentication → Users
INSERT INTO admin_roles (user_id, role)
VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'super_admin');
```

Role options: `super_admin` (full access) or `moderator` (read + review only).

---

## Step 6: Configure Environment Variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Find these in **Project Settings → API**.

---

## Step 7: Deploy Edge Functions

### Install Supabase CLI

```bash
npm install -g supabase
```

### Link Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### Set Secrets

```bash
supabase secrets set RESEND_API_KEY=re_your_resend_api_key
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to Edge Functions.

### Deploy Functions

```bash
supabase functions deploy generate-credentials
supabase functions deploy send-email
supabase functions deploy bulk-shortlist
```

---

## Step 8: Configure Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g., `eliteforums.in`)
3. Create an API key
4. Set it as a Supabase secret (Step 7 above)

The `send-email` Edge Function sends from: `InnovaHack <noreply@eliteforums.in>`

---

## Step 9: Production Configuration (50K Users)

### Enable Connection Pooling

1. Go to **Project Settings → Database**
2. Enable **Connection Pooling** (PgBouncer)
3. Set pool mode to **Transaction**
4. Use the pooled connection string for high-traffic scenarios

### Upgrade Plan

For production with 50K users:
- **Pro Plan** ($25/month): 8GB database, 250GB bandwidth, 100K auth users
- Consider **Team Plan** for dedicated support and higher limits

### Performance Indexes

The HMS migrations already create indexes on:
- `teams.team_id`, `teams.leader_id`, `teams.domain`
- `team_members.team_id`
- `problem_statements.domain`, `problem_statements.release_at`
- `submissions.team_id`, `submissions.status`
- `notifications.published_at`, `notifications.audience`
- `email_log.status`, `email_log.team_id`
- `login_attempts.email` + `created_at`

### Rate Limits

- Edge Functions: 500 req/sec (Pro plan)
- Auth: 30 sign-ups/hour, 100 sign-ins/hour (configurable)
- Storage: 5GB bandwidth/day (Pro plan)
- Email (Resend): 100 emails/day (free), 50K/month (Pro)

---

## Database Tables Reference

### HMS Tables

| Table | Purpose |
|-------|---------|
| `admin_roles` | Maps auth users to admin/moderator roles |
| `teams` | Finalist team records (IH-XXXX IDs) |
| `team_members` | Individual team member details |
| `problem_statements` | Hackathon problem statements with scheduling |
| `submissions` | Team deliverables (GitHub, pitch deck, video, docs, PoW) |
| `notifications` | Admin announcements with audience targeting |
| `notification_reads` | Read tracking per team |
| `email_log` | Email delivery tracking with retry status |
| `access_audit_log` | Unauthorized access attempt logging |
| `login_attempts` | Failed login tracking for account lockout |

### Base Tables

| Table | Purpose |
|-------|---------|
| `registrations` | Participant applications (8K-10K records) |
| `site_content` | Editable website content (JSON per section) |
| `contact_inquiries` | Contact form submissions |
| `sponsors` | Sponsor/partner logos and details |
| `judges_mentors` | Judge and mentor profiles |
| `community_partners` | Community partner referral codes |
| `partner_proposals` | Partnership proposal submissions |

---

## Edge Functions Reference

| Function | Trigger | Purpose |
|----------|---------|---------|
| `generate-credentials` | Admin action | Creates auth accounts, Team IDs, sends welcome emails |
| `send-email` | Internal/Admin | Sends emails via Resend with retry logic |
| `bulk-shortlist` | Admin CSV upload | Parses CSV, matches registrations, updates status |

---

## Troubleshooting

### "Missing Supabase environment variables"
→ Ensure `.env` exists with correct values. Restart dev server.

### Admin login works but HMS sections show empty
→ Verify you ran all 3 HMS migrations. Check `admin_roles` table has your user.

### Edge Function returns 403
→ Verify the calling user has `super_admin` role in `admin_roles` table.

### Emails not sending
→ Check `RESEND_API_KEY` secret is set. Verify domain in Resend dashboard. Check `email_log` table for error details.

### Finalist can't see problem statements
→ Verify `release_at` timestamp has passed. Check team's domain matches the problem statement's domain.

### File upload fails
→ Verify storage buckets exist (run `003_hms_storage.sql`). Check file size limits (50MB pitch deck, 25MB docs, 10MB images).

### Account locked out
→ Wait 15 minutes, or manually delete recent entries from `login_attempts` table for that email.

---

## Local Development Without Supabase

For UI development without a live Supabase connection:

```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder
```

The app will render with default content. Forms and auth won't work but the UI is fully navigable.

---

*Last updated: May 2026 — InnovaHack Chapter 1, Elite Forums*
