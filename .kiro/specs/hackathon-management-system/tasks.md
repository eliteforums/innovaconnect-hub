# Implementation Plan: Hackathon Management System

## Overview

This plan implements the HMS feature in incremental steps: database schema first, then shared libraries, followed by admin dashboard extensions, finalist portal pages, edge functions, and finally routing integration. Each task builds on the previous ones, ensuring no orphaned code.

## Tasks

- [x] 1. Database schema and storage setup
  - [x] 1.1 Create SQL migration for all HMS tables
    - Create `supabase/migrations/001_hms_schema.sql` with CREATE TABLE statements for: `admin_roles`, `teams`, `team_members`, `problem_statements`, `submissions`, `notifications`, `notification_reads`, `email_log`, `access_audit_log`, `login_attempts`
    - Include all columns, constraints, CHECK constraints, foreign keys, indexes, and default values as specified in the design document
    - Add `updated_at` trigger function for automatic timestamp updates on `teams`, `team_members`, `submissions`, `email_log`
    - _Requirements: 2.2, 2.3, 2.4, 14.1, 14.2_

  - [x] 1.2 Create RLS policies migration
    - Create `supabase/migrations/002_hms_rls_policies.sql` with all RLS policies for HMS tables
    - Enable RLS on all HMS tables
    - Implement policies for `teams`, `team_members`, `submissions`, `problem_statements`, `notifications`, `notification_reads`, `email_log`, `access_audit_log` as defined in the design
    - Ensure Super_Admin has full access, Moderator has read + submission review access, Team_Leader has own-team access only
    - _Requirements: 14.1, 14.2, 14.3, 5.6, 13.2_

  - [x] 1.3 Create storage buckets and policies migration
    - Create `supabase/migrations/003_hms_storage.sql` with storage bucket creation for: `pitch-decks`, `documentation`, `proof-of-work`, `finalist-assets`
    - All buckets set to `public: false`
    - Add RLS policies on `storage.objects` restricting team leaders to their own folder and granting admin full access
    - _Requirements: 13.1, 13.2, 13.4, 13.5, 13.6_

- [x] 2. Shared libraries
  - [x] 2.1 Create HMS types and Supabase query library
    - Create `src/lib/hms.ts` with all TypeScript interfaces: `Team`, `TeamMember`, `ProblemStatement`, `Submission`, `Notification`, `NotificationRead`, `EmailLog`, `AdminRole`, `AccessAuditLog`, `LoginAttempt`, `ResourceFile`
    - Export type aliases: `TeamStatus`, `SubmissionStatus`, `NotificationAudienceType`, `DeliverableType`
    - Implement Supabase query functions: `fetchTeams`, `fetchTeamById`, `fetchTeamByTeamId`, `fetchTeamMembers`, `updateTeamProfile`, `fetchProblemStatements`, `fetchSubmission`, `upsertSubmission`, `fetchNotifications`, `markNotificationRead`, `fetchUnreadCount`, `fetchEmailLog`, `fetchAnalytics`
    - Import `supabase` from `@/lib/supabase`
    - _Requirements: 5.1, 5.2, 7.1, 7.8, 10.4, 10.5, 11.1, 12.1_

  - [x] 2.2 Create HMS validation schemas
    - Create `src/lib/hmsValidation.ts` with all Zod schemas as defined in the design: `teamIdSchema`, `passwordSchema`, `tempPasswordSchema`, `emailSchema`, `phoneSchema`, `githubUrlSchema`, `videoUrlSchema`, `problemStatementSchema`, `notificationSchema`, `flagReasonSchema`, `csvFileSchema`
    - Export all schemas for use in form components and edge functions
    - _Requirements: 2.1, 4.6, 5.3, 5.4, 5.7, 6.1, 7.1, 7.3, 9.4, 10.1_

  - [ ]* 2.3 Write property tests for validation schemas
    - Create `src/__tests__/hms/validation.property.test.ts`
    - **Property 4: Generated passwords meet complexity requirements**
    - **Property 11: Email validation accepts only well-formed addresses**
    - **Property 12: Phone validation accepts only valid phone numbers**
    - **Property 13: GitHub URL validation**
    - **Property 15: Problem statement creation validation**
    - **Property 17: Video URL validation**
    - **Property 22: Notification validation**
    - Use `fast-check` with `numRuns: 100` for each property
    - **Validates: Requirements 2.1, 5.3, 5.4, 5.7, 6.1, 7.3, 10.1**

  - [x] 2.4 Create HMS auth helpers
    - Create `src/lib/hmsAuth.ts` with: `resolveTeamId` (looks up leader_email from team_id), `checkLockout` (queries login_attempts for 5 failures in 15 min), `recordLoginAttempt`, `finalistSignIn` (handles both email and Team ID login), `checkMustChangePassword`
    - Implement lockout logic as specified in the design document
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 2.5 Write property tests for auth helpers
    - Create `src/__tests__/hms/auth.property.test.ts`
    - **Property 9: Team ID resolves to correct email for authentication**
    - **Property 10: First login forces password change**
    - Use mocked Supabase client for testing
    - **Validates: Requirements 4.2, 4.6**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Admin HMS sections — Shortlisting and Credentials
  - [x] 4.1 Create ShortlistingSection component
    - Create `src/components/admin/sections/hms/ShortlistingSection.tsx`
    - Implement manual multi-select shortlisting of pending registrations
    - Implement CSV file upload with drag-and-drop, validation (email header, ≤1000 rows, non-empty)
    - Display summary after action: shortlisted count, unmatched count, skipped duplicates
    - Call `bulk-shortlist` edge function for CSV processing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 4.2 Create CredentialsSection component
    - Create `src/components/admin/sections/hms/CredentialsSection.tsx`
    - Display list of shortlisted registrations pending credential generation
    - "Generate Credentials" button that calls `generate-credentials` edge function
    - Display progress/summary: success count, failed count, skipped count, error details
    - "Failed Emails" section showing failed deliveries with resend button
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 3.1, 3.4_

  - [ ]* 4.3 Write property tests for shortlisting logic
    - Create `src/__tests__/hms/shortlisting.property.test.ts`
    - **Property 1: CSV parsing correctly partitions emails into matched, unmatched, and skipped**
    - **Property 2: CSV validation rejects malformed input**
    - **Property 3: Shortlisting is idempotent**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 5. Admin HMS sections — Problem Statements and Submissions
  - [x] 5.1 Create ProblemStatementsSection component
    - Create `src/components/admin/sections/hms/ProblemStatementsSection.tsx`
    - Form for creating problem statements with title, description, domain, release_at, deadline fields
    - Resource file upload (PDF, DOCX, PNG, JPG, ZIP; max 50MB each; max 10 files)
    - List of existing problem statements with edit capability
    - "Updated" badge toggle for published statements
    - Validation using `problemStatementSchema` from hmsValidation
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.2 Create SubmissionsSection component
    - Create `src/components/admin/sections/hms/SubmissionsSection.tsx`
    - Filterable list of all team submissions with status indicators (pending, under_review, reviewed, flagged)
    - Filters: domain, status, completeness percentage
    - Detail view showing all deliverables (GitHub URL as clickable link, pitch deck, video, docs, PoW)
    - Status transition controls (pending → under_review → reviewed, any → flagged)
    - Flag reason input (10-500 chars) required when flagging
    - Display last-submitted timestamp as relative time with absolute on hover
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 5.3 Write property tests for submission logic
    - Create `src/__tests__/hms/submissions.property.test.ts`
    - **Property 16: File upload validation per deliverable type**
    - **Property 19: Submission progress tracker accuracy**
    - **Property 20: Submission status transitions are valid**
    - **Property 21: Submission filtering returns correct results**
    - **Validates: Requirements 7.2, 7.4, 7.5, 7.8, 9.3, 9.4, 9.5**

- [x] 6. Admin HMS sections — Notifications, Analytics, and Team Management
  - [x] 6.1 Create NotificationsSection component
    - Create `src/components/admin/sections/hms/NotificationsSection.tsx`
    - Form for creating announcements: title (1-200 chars), message (1-5000 chars), audience type (all/domain/team), audience value, scheduled_at
    - Publish immediately or schedule for later
    - List of existing notifications with status (draft/published/scheduled)
    - Email notification trigger via `send-email` edge function
    - Validation using `notificationSchema` from hmsValidation
    - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.8_

  - [x] 6.2 Create AnalyticsSection component
    - Create `src/components/admin/sections/hms/AnalyticsSection.tsx`
    - Display metrics: total finalist teams, active teams (login within 48h), total submissions, completion rate
    - Domain-wise breakdown table: team count and submission count per domain
    - Timeline chart (using recharts) showing submissions per day
    - Zero-state messages when no data exists
    - Auto-load on mount without manual refresh
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 6.3 Create TeamManagementSection component
    - Create `src/components/admin/sections/hms/TeamManagementSection.tsx`
    - Paginated list (20 per page) showing team name, Team_ID, domain, status, submission progress %
    - Search by team name, Team_ID, or leader email (case-insensitive substring)
    - Filters: domain, status
    - Team detail view: full profile, all members, submission history with timestamps, activity timeline
    - Empty state when no results match
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 6.4 Write property tests for notifications and teams
    - Create `src/__tests__/hms/notifications.property.test.ts`
    - **Property 23: Notification audience targeting**
    - **Property 24: Unread count accuracy**
    - **Property 25: Notifications ordered by publication time**
    - Create `src/__tests__/hms/teams.property.test.ts`
    - **Property 26: Team search returns correct matches**
    - **Property 27: Analytics metrics are consistent**
    - **Property 28: Domain breakdown consistency**
    - **Validates: Requirements 10.2, 10.4, 10.5, 10.7, 11.2, 12.1, 12.2**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate HMS sections into AdminDashboard
  - [x] 8.1 Register HMS nav items and section components
    - Modify `src/pages/admin/AdminDashboard.tsx`:
      - Add imports for all 7 HMS section components from `@/components/admin/sections/hms/`
      - Add HMS nav items to `NAV_ITEMS` array with group "HMS": shortlisting, credentials, problem-statements, hms-submissions, hms-notifications, hms-analytics, hms-teams
      - Add HMS entries to `SECTION_COMPONENTS` map
      - Add appropriate Lucide icons for each HMS section
    - _Requirements: 14.3_

- [x] 9. Finalist Portal pages
  - [x] 9.1 Create FinalistLogin page
    - Create `src/pages/finalist/FinalistLogin.tsx`
    - Login form accepting either email or Team ID (auto-detect format IH-XXXX)
    - Password field
    - Call `finalistSignIn` from hmsAuth
    - Display generic error on failure (no info leakage about email/Team ID existence)
    - Account lockout message when locked (15 min after 5 failures)
    - Redirect to force-password-change if `must_change_password` is true, otherwise to dashboard
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8_

  - [x] 9.2 Create FinalistForcePassword page
    - Create `src/pages/finalist/FinalistForcePassword.tsx`
    - New password form with confirmation field
    - Validate using `passwordSchema` (8+ chars, uppercase, lowercase, digit, special char)
    - On success: update password via Supabase Auth, set `must_change_password = false`, redirect to dashboard
    - Cannot navigate away without completing (redirect back on next login if abandoned)
    - _Requirements: 4.6, 4.7_

  - [x] 9.3 Create FinalistLayout with sidebar navigation
    - Create `src/pages/finalist/FinalistLayout.tsx`
    - Shared layout with sidebar nav: Dashboard, Profile, Problem Statements, Submissions, Announcements
    - Display team name and Team_ID in sidebar header
    - Sign out button
    - Notification badge showing unread count
    - Auth guard: redirect to `/finalist/login` if not authenticated
    - _Requirements: 4.8, 10.4_

  - [x] 9.4 Create FinalistDashboard page
    - Create `src/pages/finalist/FinalistDashboard.tsx`
    - Overview showing: team status, submission progress tracker, upcoming deadlines, recent announcements
    - Quick links to submissions and problem statements
    - _Requirements: 7.8_

  - [x] 9.5 Create FinalistProfile page
    - Create `src/pages/finalist/FinalistProfile.tsx`
    - Display team name, Team_ID, domain as read-only
    - Editable fields for each team member: email (validated), phone (validated), role
    - GitHub repository URL field with validation
    - Save changes with inline error messages on validation failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 9.6 Create FinalistProblemStatements page
    - Create `src/pages/finalist/FinalistProblemStatements.tsx`
    - Display released problem statements for the team's domain (only where `release_at <= now()`)
    - Show title, description, deadline, "Updated" badge if applicable
    - Resource file download links (signed URLs)
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 9.7 Create FinalistSubmissions page
    - Create `src/pages/finalist/FinalistSubmissions.tsx`
    - Progress tracker showing status of each deliverable type
    - GitHub URL input with validation
    - Pitch deck file upload (PDF/PPTX, max 50MB)
    - Demo video URL input with validation (YouTube, Vimeo, Google Drive)
    - Documentation file upload (up to 5 PDF/DOCX, max 25MB each)
    - Proof-of-work image upload (up to 10 PNG/JPG/WEBP, max 10MB each)
    - Deadline enforcement: disable all inputs and show "Submissions Closed" after deadline
    - Allow replacing previously submitted deliverables before deadline
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [x] 9.8 Create FinalistAnnouncements page
    - Create `src/pages/finalist/FinalistAnnouncements.tsx`
    - List announcements ordered by `published_at` descending
    - Mark as read when viewed (insert into `notification_reads`)
    - Show only notifications targeted at this team (all, matching domain, or matching team_id)
    - _Requirements: 10.2, 10.4, 10.5, 10.7_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Edge Functions
  - [x] 11.1 Create generate-credentials edge function
    - Create `supabase/functions/generate-credentials/index.ts`
    - Validate caller has `super_admin` role via admin_roles table
    - Accept `registration_ids` array in request body
    - Process in batches of 50 with 1-second delay between batches
    - For each registration: check if auth account exists (skip if yes), generate temp password (12+ chars, mixed case, digit, special), create auth user via `supabase.auth.admin.createUser`, generate sequential Team ID, INSERT into teams and team_members
    - Queue email via send-email function call
    - Return summary: success, failed, skipped counts + error details
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1_

  - [x] 11.2 Create send-email edge function
    - Create `supabase/functions/send-email/index.ts`
    - Accept `to`, `template`, `data`, optional `team_id` in request body
    - Validate email format (reject immediately if invalid, no retry)
    - Rate limit: max 10 emails/second
    - Call Resend API with template-specific HTML (credentials, announcement, reminder templates)
    - Retry up to 3 times with exponential backoff (2s, 4s, 8s) on failure
    - Log result to `email_log` table
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

  - [x] 11.3 Create bulk-shortlist edge function
    - Create `supabase/functions/bulk-shortlist/index.ts`
    - Validate caller has `super_admin` role
    - Accept CSV file via multipart/form-data
    - Validate CSV: check for `email` header, non-empty, ≤1000 rows
    - Parse emails, query registrations for matches with `status = 'pending'`
    - Update matched registrations to `status = 'shortlisted'`
    - Return summary: shortlisted count, unmatched count, skipped duplicates, unmatched emails list
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 11.4 Write property tests for credential generation
    - Create `src/__tests__/hms/credentials.property.test.ts`
    - **Property 4: Generated passwords meet complexity requirements**
    - **Property 5: Team IDs are unique and sequential**
    - **Property 6: Credential generation produces complete team records**
    - **Property 7: Credential email contains required information**
    - **Property 8: Invalid email addresses are rejected without retry**
    - Test the pure logic functions extracted from edge functions (password generation, Team ID generation, email content building)
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 3.1, 3.6**

- [x] 12. App routing and dependency setup
  - [x] 12.1 Add finalist routes to App.tsx
    - Modify `src/App.tsx`:
      - Add lazy imports for all finalist pages: `FinalistLogin`, `FinalistForcePassword`, `FinalistLayout`, `FinalistDashboard`, `FinalistProfile`, `FinalistProblemStatements`, `FinalistSubmissions`, `FinalistAnnouncements`
      - Add `/finalist/login` route
      - Add `/finalist/change-password` route
      - Add `/finalist/*` routes nested under `FinalistLayout` for: dashboard, profile, problem-statements, submissions, announcements
    - _Requirements: 4.1, 4.4, 4.8, 14.4_

  - [x] 12.2 Add fast-check dev dependency
    - Add `fast-check` to devDependencies in `package.json`
    - Run install to update lock file
    - _Requirements: (testing infrastructure)_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementation uses TypeScript
- Edge functions use Deno runtime (Supabase Edge Functions standard)
- All file uploads use signed URLs — no public bucket access
- `fast-check` must be installed before running property-based tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "2.4", "12.2"] },
    { "id": 4, "tasks": ["2.5", "4.1", "4.2"] },
    { "id": 5, "tasks": ["4.3", "5.1", "5.2"] },
    { "id": 6, "tasks": ["5.3", "6.1", "6.2", "6.3"] },
    { "id": 7, "tasks": ["6.4", "8.1"] },
    { "id": 8, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 9, "tasks": ["9.4", "9.5", "9.6", "9.7", "9.8"] },
    { "id": 10, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 11, "tasks": ["11.4", "12.1"] }
  ]
}
```
