# Design Document: Hackathon Management System

## Overview

The Hackathon Management System (HMS) extends the existing InnovaHack platform to manage finalist teams post-shortlisting. It adds three major subsystems to the existing React + Supabase architecture:

1. **Admin HMS Modules** — New sidebar sections in the existing `AdminDashboard` for shortlisting, credential generation, problem statement management, submission evaluation, notifications, and analytics.
2. **Finalist Portal** — A new authenticated area (separate from the existing participant portal) where team leaders access problem statements, submit deliverables, and view announcements.
3. **Supabase Edge Functions** — Server-side functions for credential generation (requires Admin API), email delivery (requires Resend API key), and bulk CSV processing.

The system targets 250 finalist teams selected from 8,000–10,000 applicants, with all data stored in the existing Supabase PostgreSQL instance using Row Level Security for access control.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate finalist login page at `/finalist/login` | Finalists use Team ID + password (different UX from existing portal which uses email-only lookup) |
| Edge Functions for credential generation | Requires `service_role` key to create auth accounts — cannot be exposed in frontend bundle |
| `admin_roles` table instead of JWT claims | Simpler to implement with existing auth; avoids custom JWT hook complexity |
| Resend via Edge Function | API key must stay server-side; Edge Function provides retry logic |
| Signed URLs for all file access | No public bucket URLs — all finalist files require authenticated access |
| Existing `PortalAuthContext` extended with "finalist" role | Reuses existing auth infrastructure; adds Team ID resolution |

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                      │
├──────────────────────┬──────────────────────┬───────────────────────┤
│   Admin Dashboard    │   Finalist Portal    │   Existing Portal     │
│   /admin/*           │   /finalist/*        │   /portal/*           │
│                      │                      │                       │
│ • Shortlisting       │ • Login (email/ID)   │ • Participant view    │
│ • Credentials        │ • Password change    │ • Partner view        │
│ • Problem Stmts      │ • Team profile       │                       │
│ • Submissions        │ • Problem statements │                       │
│ • Notifications      │ • Submissions        │                       │
│ • Analytics          │ • Announcements      │                       │
│ • Team Management    │                      │                       │
└──────────┬───────────┴──────────┬───────────┴───────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend-as-a-Service)                    │
├─────────────────┬───────────────┬───────────────┬───────────────────┤
│   PostgreSQL    │   Auth        │   Storage     │   Edge Functions   │
│                 │               │               │                    │
│ • teams         │ • Team leader │ • pitch-decks │ • generate-creds   │
│ • team_members  │   accounts    │ • docs        │ • send-email       │
│ • problem_stmts │ • Admin       │ • pow         │ • bulk-shortlist   │
│ • submissions   │   accounts    │ • finalist-   │                    │
│ • notifications │ • JWT (7d)    │   assets      │                    │
│ • notif_reads   │               │               │                    │
│ • email_log     │               │               │                    │
│ • admin_roles   │               │               │                    │
│ • access_audit  │               │               │                    │
│ • login_attempts│               │               │                    │
└─────────────────┴───────────────┴───────────────┴───────────────────┘
                                                          │
                                                          ▼
                                                  ┌───────────────┐
                                                  │   Resend API   │
                                                  │  (Email SMTP)  │
                                                  └───────────────┘
```

### Request Flow

```
Team Leader Login (Team ID):
  Browser → /finalist/login → supabase.from('teams').select('leader_email').eq('team_id', 'IH-0042')
         → supabase.auth.signInWithPassword({ email: resolved_email, password })
         → JWT returned → stored in localStorage → redirect to /finalist/dashboard

Admin Credential Generation:
  Browser → /admin (Shortlist action) → Edge Function: generate-credentials
         → supabase.auth.admin.createUser() [service_role]
         → INSERT INTO teams, team_members
         → Edge Function: send-email → Resend API
         → Response with summary

File Upload (Finalist):
  Browser → supabase.storage.from('pitch-decks').createSignedUploadUrl(path)
         → Direct upload to Supabase Storage via signed URL
         → UPDATE submissions SET pitch_deck_url = path
```


## Components and Interfaces

### Admin Dashboard Extensions

The existing `AdminDashboard.tsx` sidebar (`NAV_ITEMS` array) will be extended with a new "HMS" group containing these sections:

| Section ID | Label | Component | Group |
|-----------|-------|-----------|-------|
| `shortlisting` | Shortlisting | `<ShortlistingSection />` | HMS |
| `credentials` | Credentials | `<CredentialsSection />` | HMS |
| `problem-statements` | Problem Statements | `<ProblemStatementsSection />` | HMS |
| `hms-submissions` | Submissions | `<SubmissionsSection />` | HMS |
| `hms-notifications` | Notifications | `<NotificationsSection />` | HMS |
| `hms-analytics` | Analytics | `<AnalyticsSection />` | HMS |
| `hms-teams` | Team Management | `<TeamManagementSection />` | HMS |

**File locations:**
```
src/components/admin/sections/hms/
├── ShortlistingSection.tsx
├── CredentialsSection.tsx
├── ProblemStatementsSection.tsx
├── SubmissionsSection.tsx
├── NotificationsSection.tsx
├── AnalyticsSection.tsx
└── TeamManagementSection.tsx
```

### Finalist Portal Pages

```
src/pages/finalist/
├── FinalistLogin.tsx          — Login with email or Team ID
├── FinalistForcePassword.tsx  — Forced password change on first login
├── FinalistLayout.tsx         — Shared layout with sidebar nav
├── FinalistDashboard.tsx      — Overview / home
├── FinalistProfile.tsx        — Team profile view/edit
├── FinalistProblemStatements.tsx — View released problem statements
├── FinalistSubmissions.tsx    — Submit deliverables
└── FinalistAnnouncements.tsx  — View announcements
```

### Shared Libraries

```
src/lib/
├── hms.ts                     — HMS-specific Supabase queries and types
├── hmsValidation.ts           — Zod schemas for all HMS form validation
└── hmsAuth.ts                 — Finalist auth helpers (Team ID resolution, lockout check)
```

### Edge Functions

```
supabase/functions/
├── generate-credentials/
│   └── index.ts               — Creates auth accounts, team records, triggers email
├── send-email/
│   └── index.ts               — Sends emails via Resend with retry logic
└── bulk-shortlist/
    └── index.ts               — Parses CSV, updates registration statuses
```

### Component Interface Definitions

```typescript
// src/lib/hms.ts — Core types

export type TeamStatus = "active" | "suspended" | "disqualified";
export type SubmissionStatus = "pending" | "under_review" | "reviewed" | "flagged";
export type NotificationAudienceType = "all" | "domain" | "team";
export type DeliverableType = "github_url" | "pitch_deck" | "demo_video" | "documentation" | "proof_of_work";

export interface Team {
  id: string;                    // UUID (PK)
  team_id: string;               // IH-XXXX format
  team_name: string;
  leader_id: string;             // FK → auth.users.id
  leader_email: string;
  domain: string;
  status: TeamStatus;
  github_url: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;                    // UUID (PK)
  team_id: string;               // FK → teams.id
  member_name: string;
  email: string;
  phone: string;
  role: string;                  // e.g., "leader", "developer", "designer"
  created_at: string;
  updated_at: string;
}

export interface ProblemStatement {
  id: string;                    // UUID (PK)
  title: string;                 // max 200 chars
  description: string;           // max 5000 chars
  domain: string;
  deadline: string;              // ISO timestamp
  release_at: string;            // ISO timestamp (scheduled visibility)
  resources: ResourceFile[];     // JSONB array
  is_updated: boolean;           // shows "Updated" badge
  created_by: string;            // FK → auth.users.id
  created_at: string;
  updated_at: string;
}

export interface ResourceFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Submission {
  id: string;                    // UUID (PK)
  team_id: string;               // FK → teams.id
  github_url: string | null;
  pitch_deck_url: string | null;
  video_url: string | null;
  documentation_urls: string[];  // JSONB array
  pow_urls: string[];            // JSONB array
  status: SubmissionStatus;
  flag_reason: string | null;
  reviewed_by: string | null;    // FK → auth.users.id
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;                    // UUID (PK)
  title: string;                 // 1-200 chars
  message: string;               // 1-5000 chars
  audience_type: NotificationAudienceType;
  audience_value: string | null; // domain name or team_id
  published_at: string | null;
  scheduled_at: string | null;
  created_by: string;            // FK → auth.users.id
  created_at: string;
}

export interface NotificationRead {
  id: string;
  notification_id: string;       // FK → notifications.id
  team_id: string;               // FK → teams.id
  read_at: string;
}

export interface EmailLog {
  id: string;                    // UUID (PK)
  recipient: string;
  template: string;
  status: "sent" | "failed" | "pending" | "retrying";
  retries: number;
  error: string | null;
  team_id: string | null;        // FK → teams.id
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;               // FK → auth.users.id
  role: "super_admin" | "moderator";
  created_at: string;
}

export interface AccessAuditLog {
  id: string;
  user_id: string;
  route: string;
  timestamp: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address: string | null;
  created_at: string;
}
```

### Validation Schemas (Zod)

```typescript
// src/lib/hmsValidation.ts

import { z } from "zod";

export const teamIdSchema = z.string().regex(/^IH-\d{4}$/, "Team ID must be in format IH-XXXX");

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/\d/, "Must contain at least one digit")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character");

export const tempPasswordSchema = passwordSchema.refine(
  (val) => val.length >= 12,
  "Temporary password must be at least 12 characters"
);

export const emailSchema = z.string().email().max(254);

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-]+$/, "Phone must contain only digits, spaces, hyphens, or leading +")
  .refine(
    (val) => { const digits = val.replace(/\D/g, ""); return digits.length >= 7 && digits.length <= 15; },
    "Phone must have between 7 and 15 digits"
  );

export const githubUrlSchema = z.string()
  .max(2048)
  .regex(/^https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+\/?$/, "Must be a valid GitHub repository URL");

export const videoUrlSchema = z.string().url().refine(
  (url) => {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      return ["youtube.com", "youtu.be", "vimeo.com", "drive.google.com"].includes(hostname);
    } catch { return false; }
  },
  "Must be a YouTube, Vimeo, or Google Drive URL"
);

export const problemStatementSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  domain: z.string().min(1),
  release_at: z.string().refine((val) => new Date(val) > new Date(), "Release time must be in the future"),
  deadline: z.string().optional(),
});

export const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  audience_type: z.enum(["all", "domain", "team"]),
  audience_value: z.string().nullable(),
  scheduled_at: z.string().nullable(),
});

export const flagReasonSchema = z.string().min(10).max(500);

export const csvFileSchema = z.object({
  headers: z.array(z.string()).refine((h) => h.includes("email"), "CSV must have an 'email' column"),
  rows: z.array(z.any()).max(1000, "CSV must not exceed 1,000 rows").min(1, "CSV must have at least one data row"),
});
```


## Data Models

### Database Schema

#### `admin_roles` — Maps auth users to admin roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NOT NULL, UNIQUE, FK → `auth.users(id)` | Supabase auth user |
| `role` | `text` | NOT NULL, CHECK (`role` IN ('super_admin', 'moderator')) | Admin role |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

#### `teams` — Finalist team records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `team_id` | `text` | NOT NULL, UNIQUE, CHECK (`team_id ~ '^IH-\d{4}$'`) | Human-readable ID (IH-0001 to IH-9999) |
| `team_name` | `text` | NOT NULL | Team name from registration |
| `leader_id` | `uuid` | NOT NULL, FK → `auth.users(id)` | Auth user ID of team leader |
| `leader_email` | `text` | NOT NULL | Team leader's email (denormalized for search) |
| `domain` | `text` | NOT NULL | Assigned hackathon domain |
| `status` | `text` | NOT NULL, default `'active'`, CHECK (`status` IN ('active', 'suspended', 'disqualified')) | Team status |
| `github_url` | `text` | NULL | Team's GitHub repository URL |
| `must_change_password` | `boolean` | NOT NULL, default `true` | Forces password change on first login |
| `registration_id` | `uuid` | FK → `registrations(id)` | Link back to original registration |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:** `idx_teams_team_id` on `team_id`, `idx_teams_leader_id` on `leader_id`, `idx_teams_domain` on `domain`

#### `team_members` — Individual team member records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `team_id` | `uuid` | NOT NULL, FK → `teams(id)` ON DELETE CASCADE | Parent team |
| `member_name` | `text` | NOT NULL | Full name |
| `email` | `text` | NOT NULL | Email address |
| `phone` | `text` | NOT NULL | Phone number |
| `role` | `text` | NOT NULL, default `'member'` | Role within team (leader, developer, designer, etc.) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:** `idx_team_members_team_id` on `team_id`

#### `problem_statements` — Hackathon problem statements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `title` | `text` | NOT NULL, CHECK (`length(title) <= 200`) | Problem statement title |
| `description` | `text` | NOT NULL, CHECK (`length(description) <= 5000`) | Full description |
| `domain` | `text` | NOT NULL | Target domain |
| `deadline` | `timestamptz` | NULL | Submission deadline |
| `release_at` | `timestamptz` | NOT NULL | Scheduled release timestamp |
| `resources` | `jsonb` | NOT NULL, default `'[]'` | Array of `{name, url, size, type}` objects |
| `is_updated` | `boolean` | NOT NULL, default `false` | Shows "Updated" badge when true |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | Admin who created it |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:** `idx_problem_statements_domain` on `domain`, `idx_problem_statements_release_at` on `release_at`

#### `submissions` — Team project submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `team_id` | `uuid` | NOT NULL, UNIQUE, FK → `teams(id)` ON DELETE CASCADE | One submission per team |
| `github_url` | `text` | NULL | GitHub repository URL |
| `pitch_deck_url` | `text` | NULL | Storage path for pitch deck |
| `video_url` | `text` | NULL | Demo video URL |
| `documentation_urls` | `jsonb` | NOT NULL, default `'[]'` | Array of storage paths |
| `pow_urls` | `jsonb` | NOT NULL, default `'[]'` | Array of proof-of-work image paths |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK (`status` IN ('pending', 'under_review', 'reviewed', 'flagged')) | Review status |
| `flag_reason` | `text` | NULL, CHECK (`flag_reason IS NULL OR (length(flag_reason) >= 10 AND length(flag_reason) <= 500)`) | Reason for flagging |
| `reviewed_by` | `uuid` | NULL, FK → `auth.users(id)` | Moderator who reviewed |
| `reviewed_at` | `timestamptz` | NULL | Review timestamp |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:** `idx_submissions_team_id` on `team_id`, `idx_submissions_status` on `status`

#### `notifications` — Admin announcements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `title` | `text` | NOT NULL, CHECK (`length(title) BETWEEN 1 AND 200`) | Announcement title |
| `message` | `text` | NOT NULL, CHECK (`length(message) BETWEEN 1 AND 5000`) | Announcement body |
| `audience_type` | `text` | NOT NULL, CHECK (`audience_type` IN ('all', 'domain', 'team')) | Target audience type |
| `audience_value` | `text` | NULL | Domain name or team_id (null when audience_type = 'all') |
| `published_at` | `timestamptz` | NULL | When it became visible (null = draft) |
| `scheduled_at` | `timestamptz` | NULL | Scheduled publish time |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | Admin who created it |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

**Indexes:** `idx_notifications_published_at` on `published_at`, `idx_notifications_audience` on `(audience_type, audience_value)`

#### `notification_reads` — Tracks which teams have read which notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `notification_id` | `uuid` | NOT NULL, FK → `notifications(id)` ON DELETE CASCADE | Notification |
| `team_id` | `uuid` | NOT NULL, FK → `teams(id)` ON DELETE CASCADE | Team that read it |
| `read_at` | `timestamptz` | NOT NULL, default `now()` | When it was read |

**Unique constraint:** `(notification_id, team_id)` — prevents duplicate reads

#### `email_log` — Email delivery tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `recipient` | `text` | NOT NULL | Recipient email address |
| `template` | `text` | NOT NULL | Email template name (e.g., 'credentials', 'announcement') |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK (`status` IN ('pending', 'sent', 'failed', 'retrying')) | Delivery status |
| `retries` | `integer` | NOT NULL, default `0` | Number of retry attempts |
| `error` | `text` | NULL | Last error message |
| `team_id` | `uuid` | NULL, FK → `teams(id)` | Associated team |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:** `idx_email_log_status` on `status`, `idx_email_log_team_id` on `team_id`

#### `access_audit_log` — Records unauthorized access attempts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NOT NULL | User who attempted access |
| `route` | `text` | NOT NULL | Attempted route |
| `timestamp` | `timestamptz` | NOT NULL, default `now()` | When the attempt occurred |

#### `login_attempts` — Tracks failed login attempts for lockout

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primary key |
| `email` | `text` | NOT NULL | Email attempted |
| `success` | `boolean` | NOT NULL | Whether login succeeded |
| `ip_address` | `text` | NULL | Client IP (from Edge Function headers) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Attempt timestamp |

**Indexes:** `idx_login_attempts_email_created` on `(email, created_at DESC)`

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ registrations│       │     teams        │       │  team_members    │
│ (existing)   │◄──────│                  │──────►│                  │
│              │  reg_id│ id (PK)          │ 1:N   │ id (PK)          │
│ id           │       │ team_id (IH-XXXX)│       │ team_id (FK)     │
│ email        │       │ team_name        │       │ member_name      │
│ status       │       │ leader_id (FK)   │       │ email            │
│ team_members │       │ leader_email     │       │ phone            │
│ ...          │       │ domain           │       │ role             │
└──────────────┘       │ status           │       └──────────────────┘
                       │ github_url       │
                       │ must_change_pwd  │
                       └────────┬─────────┘
                                │
                    ┌───────────┼───────────────┐
                    │           │               │
                    ▼           ▼               ▼
          ┌─────────────┐ ┌──────────┐ ┌────────────────┐
          │ submissions │ │notif_reads│ │  email_log     │
          │             │ │          │ │                │
          │ id (PK)     │ │ notif_id │ │ id (PK)        │
          │ team_id(FK) │ │ team_id  │ │ recipient      │
          │ github_url  │ │ read_at  │ │ template       │
          │ pitch_deck  │ └────┬─────┘ │ status         │
          │ video_url   │      │       │ team_id (FK)   │
          │ doc_urls    │      │       └────────────────┘
          │ pow_urls    │      │
          │ status      │      ▼
          │ flag_reason │ ┌──────────────┐
          └─────────────┘ │notifications │
                          │              │
                          │ id (PK)      │
                          │ title        │
                          │ message      │
                          │ audience_type│
                          │ published_at │
                          │ scheduled_at │
                          └──────────────┘

┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ admin_roles  │  │problem_statements│  │ access_audit_log │
│              │  │                  │  │                  │
│ user_id (FK) │  │ id (PK)          │  │ user_id          │
│ role         │  │ title            │  │ route            │
└──────────────┘  │ description      │  │ timestamp        │
                  │ domain           │  └──────────────────┘
                  │ release_at       │
                  │ resources (JSONB)│
                  └──────────────────┘
```

### Supabase Edge Functions Design

#### 1. `generate-credentials`

**Trigger:** Called by admin frontend after shortlisting action  
**Auth:** Requires valid admin JWT (verified via `Authorization` header)  
**Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`

```typescript
// Request body
interface GenerateCredentialsRequest {
  registration_ids: string[];  // UUIDs of shortlisted registrations
}

// Response
interface GenerateCredentialsResponse {
  success: number;
  failed: number;
  skipped: number;  // already had accounts
  errors: Array<{ email: string; reason: string }>;
}
```

**Processing logic:**
1. Validate caller has `super_admin` role (query `admin_roles` table)
2. Fetch registrations by IDs, filter to `status = 'shortlisted'`
3. Process in batches of 50 with 1-second delay between batches
4. For each registration:
   a. Check if auth account already exists → skip if yes
   b. Generate temporary password (12+ chars, mixed case, digit, special)
   c. Call `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
   d. Generate next sequential Team ID (`SELECT MAX(team_id) FROM teams`)
   e. INSERT into `teams` table
   f. INSERT into `team_members` table (from registration's `team_members` JSON)
   g. Queue email via `send-email` function
5. Return summary

#### 2. `send-email`

**Trigger:** Called by `generate-credentials` or admin notification actions  
**Auth:** Internal (called from other Edge Functions) or admin JWT  
**Secrets:** `RESEND_API_KEY`

```typescript
// Request body
interface SendEmailRequest {
  to: string;
  template: "credentials" | "announcement" | "reminder";
  data: Record<string, string>;  // template variables
  team_id?: string;
}

// Response
interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}
```

**Processing logic:**
1. Validate email format → reject immediately if invalid (no retry)
2. Rate limit: track sends per second, delay if exceeding 10/s
3. Call Resend API with template-specific HTML
4. On failure: retry up to 3 times with exponential backoff (2s, 4s, 8s)
5. Log result to `email_log` table
6. Return success/failure

#### 3. `bulk-shortlist`

**Trigger:** Called by admin frontend when CSV is uploaded  
**Auth:** Requires valid admin JWT with `super_admin` role  
**Secrets:** `SUPABASE_SERVICE_ROLE_KEY`

```typescript
// Request body: multipart/form-data with CSV file

// Response
interface BulkShortlistResponse {
  shortlisted: number;
  unmatched: number;
  skipped_duplicates: number;
  unmatched_emails: string[];
}
```

**Processing logic:**
1. Validate CSV: check for `email` header, non-empty, ≤1000 rows
2. Parse all email values from CSV
3. Query `registrations` table for matching emails with `status = 'pending'`
4. Update matched registrations to `status = 'shortlisted'`
5. Track unmatched emails and already-shortlisted duplicates
6. Return summary

### Security Design — RLS Policies

#### `teams` table

```sql
-- Team leaders can read their own team
CREATE POLICY "teams_select_own" ON teams FOR SELECT
  USING (leader_id = auth.uid());

-- Team leaders can update their own team (github_url only)
CREATE POLICY "teams_update_own" ON teams FOR UPDATE
  USING (leader_id = auth.uid())
  WITH CHECK (leader_id = auth.uid());

-- Admins can read all teams
CREATE POLICY "teams_select_admin" ON teams FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

-- Super admins can insert/update/delete teams
CREATE POLICY "teams_all_super_admin" ON teams FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
```

#### `team_members` table

```sql
-- Team leaders can read/update their own team members
CREATE POLICY "team_members_select_own" ON team_members FOR SELECT
  USING (team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid()));

CREATE POLICY "team_members_update_own" ON team_members FOR UPDATE
  USING (team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid()));

-- Admins can read all team members
CREATE POLICY "team_members_select_admin" ON team_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
```

#### `submissions` table

```sql
-- Team leaders can read/update their own submission
CREATE POLICY "submissions_select_own" ON submissions FOR SELECT
  USING (team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid()));

CREATE POLICY "submissions_upsert_own" ON submissions FOR INSERT
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid()));

CREATE POLICY "submissions_update_own" ON submissions FOR UPDATE
  USING (team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid()));

-- Admins can read all submissions
CREATE POLICY "submissions_select_admin" ON submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));

-- Moderators can update submission status
CREATE POLICY "submissions_update_moderator" ON submissions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
```

#### `problem_statements` table

```sql
-- Finalists can read released problem statements in their domain
CREATE POLICY "ps_select_finalist" ON problem_statements FOR SELECT
  USING (
    release_at <= now() AND
    domain IN (SELECT domain FROM teams WHERE leader_id = auth.uid())
  );

-- Admins can do everything
CREATE POLICY "ps_all_admin" ON problem_statements FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
```

#### `notifications` table

```sql
-- Finalists can read published notifications targeted at them
CREATE POLICY "notifications_select_finalist" ON notifications FOR SELECT
  USING (
    published_at IS NOT NULL AND published_at <= now() AND (
      audience_type = 'all' OR
      (audience_type = 'domain' AND audience_value IN (SELECT domain FROM teams WHERE leader_id = auth.uid())) OR
      (audience_type = 'team' AND audience_value IN (SELECT team_id FROM teams WHERE leader_id = auth.uid()))
    )
  );

-- Admins can do everything
CREATE POLICY "notifications_all_admin" ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
```

#### Storage Bucket Policies

```sql
-- pitch-decks bucket: team leaders can upload/read their own files
CREATE POLICY "pitch_decks_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

CREATE POLICY "pitch_decks_select" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-decks' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- Same pattern for documentation, proof-of-work, finalist-assets buckets
```

### File Storage Architecture

| Bucket | Access | Allowed Types | Max Size | Path Pattern |
|--------|--------|---------------|----------|--------------|
| `pitch-decks` | Authenticated | PDF, PPTX | 50 MB | `{team_uuid}/pitch-deck.{ext}` |
| `documentation` | Authenticated | PDF, DOCX | 25 MB | `{team_uuid}/docs/{filename}` |
| `proof-of-work` | Authenticated | PNG, JPG, WEBP | 10 MB | `{team_uuid}/pow/{filename}` |
| `finalist-assets` | Authenticated | PDF, DOCX, PNG, JPG, ZIP | 50 MB | `problem-statements/{ps_uuid}/{filename}` |

All buckets are configured with:
- `public: false` — no anonymous access
- Signed URLs for downloads (1-hour expiry for viewing)
- Signed upload URLs (15-minute expiry) generated server-side
- RLS policies restricting access to team's own folder (or admin access)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CSV parsing correctly partitions emails into matched, unmatched, and skipped

*For any* valid CSV file containing a set of email addresses, and any set of registrations in the database, the shortlisting engine SHALL partition the CSV emails into exactly three disjoint sets: (1) matched emails that correspond to pending registrations and become shortlisted, (2) unmatched emails that have no corresponding registration, and (3) skipped emails that correspond to already-shortlisted registrations — and the sum of these three counts SHALL equal the total number of email rows in the CSV.

**Validates: Requirements 1.2, 1.3, 1.5, 1.6**

### Property 2: CSV validation rejects malformed input

*For any* CSV input that is missing the "email" column header, is empty, or exceeds 1,000 data rows, the shortlisting engine SHALL reject the file and return an error indicating the specific validation failure.

**Validates: Requirements 1.4**

### Property 3: Shortlisting is idempotent

*For any* registration that already has "shortlisted" status, applying the shortlist action again SHALL leave the registration unchanged and count it as a skipped duplicate.

**Validates: Requirements 1.6**

### Property 4: Generated passwords meet complexity requirements

*For any* temporary password produced by the credential generator, the password SHALL have at least 12 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.

**Validates: Requirements 2.1**

### Property 5: Team IDs are unique and sequential

*For any* sequence of N generated Team IDs, each SHALL match the format `IH-XXXX` where XXXX is a zero-padded number, all IDs SHALL be unique, and they SHALL be assigned sequentially.

**Validates: Requirements 2.2**

### Property 6: Credential generation produces complete team records

*For any* shortlisted registration with M team members, the credential generator SHALL produce exactly one team record (with team_name, leader_id, team_id, and "active" status) and exactly M team_member records with correct name, email, phone, and role data.

**Validates: Requirements 2.3, 2.4**

### Property 7: Credential email contains required information

*For any* successfully created team account, the generated email content SHALL contain the Team_ID, the temporary password, and the portal login URL.

**Validates: Requirements 3.1**

### Property 8: Invalid email addresses are rejected without retry

*For any* string that does not match a valid email format, the email service SHALL mark the delivery as failed immediately without performing any retry attempts.

**Validates: Requirements 3.6**

### Property 9: Team ID resolves to correct email for authentication

*For any* team record in the database, logging in with that team's Team_ID and the correct password SHALL authenticate as the team leader associated with that Team_ID.

**Validates: Requirements 4.2**

### Property 10: First login forces password change

*For any* team account where `must_change_password` is true, successful authentication SHALL redirect to the password change form and SHALL NOT grant access to the dashboard until a new valid password is set.

**Validates: Requirements 4.6**

### Property 11: Email validation accepts only well-formed addresses

*For any* string, the email validation SHALL accept it if and only if it is a well-formed email address of no more than 254 characters.

**Validates: Requirements 5.3**

### Property 12: Phone validation accepts only valid phone numbers

*For any* string, the phone validation SHALL accept it if and only if it contains only digits, spaces, hyphens, or a leading plus sign, and the total digit count is between 7 and 15.

**Validates: Requirements 5.4**

### Property 13: GitHub URL validation

*For any* string, the GitHub URL validation SHALL accept it if and only if it matches the pattern `https://github.com/{owner}/{repo}` and is no more than 2,048 characters in length.

**Validates: Requirements 5.7, 7.1**

### Property 14: Problem statement visibility is time-gated

*For any* problem statement with a `release_at` timestamp, it SHALL be visible to finalist teams if and only if the current time is at or after `release_at`.

**Validates: Requirements 6.2, 6.3**

### Property 15: Problem statement creation validation

*For any* problem statement input, creation SHALL succeed if and only if the title is 1–200 characters, description is 1–5,000 characters, a domain is assigned, and the release timestamp is in the future.

**Validates: Requirements 6.1, 6.6**

### Property 16: File upload validation per deliverable type

*For any* file upload attempt, the system SHALL accept the file if and only if its MIME type is in the allowed list for the target bucket AND its size does not exceed the maximum for that deliverable type (50 MB for pitch decks, 25 MB for documentation, 10 MB for proof-of-work).

**Validates: Requirements 7.2, 7.4, 7.5, 13.3, 13.5**

### Property 17: Video URL validation

*For any* URL string, the demo video URL validation SHALL accept it if and only if the URL hostname (ignoring "www." prefix) is one of: youtube.com, youtu.be, vimeo.com, or drive.google.com.

**Validates: Requirements 7.3**

### Property 18: Submission deadline enforcement

*For any* submission attempt, the system SHALL accept it if and only if the current time is before the submission deadline. After the deadline, all submissions and updates SHALL be rejected.

**Validates: Requirements 7.6, 7.7**

### Property 19: Submission progress tracker accuracy

*For any* team's submission record, the progress tracker SHALL show "submitted" for each deliverable type that has a non-null value and "pending" for each deliverable type that is null, and the completion percentage SHALL equal (submitted count / 5) × 100.

**Validates: Requirements 7.8, 11.1**

### Property 20: Submission status transitions are valid

*For any* submission status update, the transition SHALL succeed if and only if it follows the allowed transitions: pending → under_review → reviewed, or any status → flagged. Additionally, flagging SHALL require a reason text between 10 and 500 characters.

**Validates: Requirements 9.3, 9.4**

### Property 21: Submission filtering returns correct results

*For any* combination of domain, status, and completeness filters, the filtered results SHALL contain only submissions that match ALL selected filter criteria simultaneously.

**Validates: Requirements 9.5**

### Property 22: Notification validation

*For any* announcement input, creation SHALL succeed if and only if the title is between 1 and 200 characters and the message body is between 1 and 5,000 characters.

**Validates: Requirements 10.1, 10.8**

### Property 23: Notification audience targeting

*For any* published notification with a target audience, it SHALL be visible to a team if and only if: (a) audience_type is "all", OR (b) audience_type is "domain" and the team's domain matches audience_value, OR (c) audience_type is "team" and the team's team_id matches audience_value.

**Validates: Requirements 10.2**

### Property 24: Unread count accuracy

*For any* team, the unread notification count SHALL equal the number of published notifications targeted at that team minus the number of notifications that team has marked as read.

**Validates: Requirements 10.4, 10.5**

### Property 25: Notifications ordered by publication time

*For any* set of published notifications visible to a team, they SHALL be displayed in descending order of `published_at` timestamp.

**Validates: Requirements 10.7**

### Property 26: Team search returns correct matches

*For any* search query of at least 1 character, the team list SHALL contain only teams where the team_name, Team_ID, or leader_email contains the query as a case-insensitive substring.

**Validates: Requirements 11.2**

### Property 27: Analytics metrics are consistent

*For any* set of teams and submissions, the analytics SHALL correctly compute: total finalist teams = count of all teams, active teams = count of teams with login within 48 hours, total submissions = sum of non-null deliverables across all submissions, and completion rate = percentage of teams with all 5 deliverables submitted.

**Validates: Requirements 12.1**

### Property 28: Domain breakdown consistency

*For any* set of teams, the sum of team counts across all domains in the breakdown SHALL equal the total number of teams.

**Validates: Requirements 12.2**

### Property 29: Role-based access control enforcement

*For any* (role, table, operation) tuple, the RLS policies SHALL grant access if and only if the role hierarchy permits it: Super_Admin has full access to all HMS tables; Moderator has read access to teams/team_members/submissions and write access to submission status; Team_Leader has read/write access only to records matching their own team_id.

**Validates: Requirements 14.1, 14.2**


## Error Handling

### Frontend Error Handling Strategy

| Error Type | Handling | User Feedback |
|-----------|----------|---------------|
| Network failure | TanStack Query retry (1 attempt) | Toast: "Connection error. Retrying..." |
| Auth session expired | Redirect to login page | Toast: "Session expired. Please sign in again." |
| Validation error (Zod) | Prevent submission, highlight fields | Inline field errors with expected format |
| File upload failure | Abort upload, retain form state | Toast: "Upload failed: {reason}" |
| RLS access denied | Catch Supabase error code | Toast: "Access denied" + redirect |
| Rate limit (client-side) | Disable submit button temporarily | Toast: "Please wait before submitting again" |
| Edge Function error | Display error from response body | Toast with specific error message |

### Edge Function Error Handling

| Function | Error | Recovery |
|----------|-------|----------|
| `generate-credentials` | Auth account creation fails | Log error, mark registration with "error" flag, continue batch |
| `generate-credentials` | Rate limit hit | Pause batch, retry after delay |
| `send-email` | Resend API failure | Retry 3× with exponential backoff (2s, 4s, 8s) |
| `send-email` | Invalid email format | Skip immediately, log as failed, no retry |
| `send-email` | Rate limit (10/s) | Queue and delay subsequent sends |
| `bulk-shortlist` | Malformed CSV | Return 400 with specific validation error |
| `bulk-shortlist` | Partial match failure | Process all rows, return summary with unmatched list |

### Database Error Handling

| Scenario | Handling |
|----------|----------|
| Unique constraint violation (team_id) | Regenerate Team ID and retry |
| Foreign key violation | Return descriptive error to frontend |
| RLS policy denial | Return generic "access denied" (no information leakage) |
| Connection timeout | Retry once, then surface error to user |
| Deadlock on concurrent updates | Retry with backoff (handled by Supabase client) |

### Account Lockout Logic

```typescript
// Lockout check (runs before auth attempt)
async function checkLockout(email: string): Promise<{ locked: boolean; unlockAt?: Date }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const { count } = await supabase
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("created_at", fifteenMinutesAgo.toISOString());

  if ((count ?? 0) >= 5) {
    // Find the 5th failure to calculate unlock time
    const { data } = await supabase
      .from("login_attempts")
      .select("created_at")
      .eq("email", email)
      .eq("success", false)
      .order("created_at", { ascending: false })
      .limit(1);
    
    const unlockAt = data?.[0] 
      ? new Date(new Date(data[0].created_at).getTime() + 15 * 60 * 1000)
      : undefined;
    
    return { locked: true, unlockAt };
  }
  
  return { locked: false };
}
```

### Submission Deadline Enforcement

```typescript
// Check deadline before any submission operation
async function checkDeadline(teamId: string): Promise<{ open: boolean; deadline?: Date }> {
  const { data: team } = await supabase
    .from("teams")
    .select("domain")
    .eq("id", teamId)
    .single();

  if (!team) return { open: false };

  const { data: ps } = await supabase
    .from("problem_statements")
    .select("deadline")
    .eq("domain", team.domain)
    .order("deadline", { ascending: false })
    .limit(1)
    .single();

  if (!ps?.deadline) return { open: true }; // No deadline set

  const deadline = new Date(ps.deadline);
  return { open: new Date() < deadline, deadline };
}
```

## Testing Strategy

### Testing Framework

- **Unit tests:** Vitest + Testing Library (already configured in project)
- **Property-based tests:** Vitest + [fast-check](https://github.com/dubzzz/fast-check) library
- **E2E tests:** Playwright (already configured)
- **Integration tests:** Vitest with Supabase local development (via `supabase start`)

### Property-Based Testing Configuration

Property-based tests will use `fast-check` with Vitest. Each property test runs a minimum of 100 iterations.

```typescript
// Example test structure
import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("HMS Validation Properties", () => {
  // Feature: hackathon-management-system, Property 4: Generated passwords meet complexity requirements
  it("generated passwords meet all complexity requirements", () => {
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        const password = generateTempPassword(seed);
        expect(password.length).toBeGreaterThanOrEqual(12);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/\d/);
        expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Test File Organization

```
src/__tests__/
├── hms/
│   ├── validation.property.test.ts    — Properties 2, 4, 5, 11, 12, 13, 15, 17, 22
│   ├── shortlisting.property.test.ts  — Properties 1, 3
│   ├── credentials.property.test.ts   — Properties 4, 5, 6, 7, 8
│   ├── submissions.property.test.ts   — Properties 16, 18, 19, 20, 21
│   ├── notifications.property.test.ts — Properties 22, 23, 24, 25
│   ├── teams.property.test.ts         — Properties 26, 27, 28
│   ├── auth.property.test.ts          — Properties 9, 10, 29
│   ├── auth.unit.test.ts              — Lockout logic, session handling
│   ├── submissions.unit.test.ts       — Status transitions, deadline edge cases
│   └── notifications.unit.test.ts     — Scheduling, audience resolution
├── integration/
│   ├── rls-policies.test.ts           — RLS enforcement across all tables
│   ├── edge-functions.test.ts         — Edge function request/response contracts
│   └── storage-policies.test.ts       — Storage bucket access control
└── e2e/
    ├── finalist-login.spec.ts         — Full login flow including Team ID
    ├── submission-flow.spec.ts        — End-to-end submission workflow
    └── admin-shortlisting.spec.ts     — Admin shortlisting + credential generation
```

### Unit Test Coverage Targets

| Module | Coverage Target | Focus Areas |
|--------|----------------|-------------|
| `hmsValidation.ts` | 95% | All Zod schemas, edge cases |
| `hmsAuth.ts` | 90% | Team ID resolution, lockout logic |
| `hms.ts` | 85% | Query builders, data transformations |
| Edge Functions | 90% | Business logic (mocked Supabase/Resend) |
| React components | 80% | User interactions, form submissions |

### Integration Test Strategy

- Use Supabase local development (`supabase start`) for RLS policy testing
- Test each RLS policy with different user roles (super_admin, moderator, team_leader, unauthenticated)
- Verify storage bucket policies prevent cross-team access
- Test Edge Functions with mocked external services (Resend API)

### E2E Test Scenarios

1. **Finalist login flow:** Team ID login → forced password change → dashboard access
2. **Submission workflow:** Upload all 5 deliverable types → verify progress tracker → verify admin view
3. **Admin shortlisting:** Upload CSV → verify summary → trigger credential generation → verify emails logged
4. **Notification flow:** Admin creates announcement → finalist sees badge → marks as read → badge decrements

