-- ============================================================
-- InnovaHack 2026 — Portal Auth SQL
-- ============================================================
-- Run this AFTER schema.sql and referral_system.sql.
-- This file is fully IDEMPOTENT — safe to run multiple times.
-- Every policy is dropped before being recreated.
-- ============================================================


-- ============================================================
-- SECTION 1: registrations — portal owner-read policy
-- ============================================================

-- Drop ALL existing SELECT policies on registrations so we can
-- replace them cleanly without conflicts
DROP POLICY IF EXISTS "registrations_admin_read"   ON registrations;
DROP POLICY IF EXISTS "registrations_owner_read"   ON registrations;

-- Authenticated users can read:
--   • Their own row (email matches auth session email)
--   • Admins can read all rows (handled by admin panel using
--     service role key — not needed here via anon/user key)
CREATE POLICY "registrations_owner_read"
  ON registrations FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND email = auth.email()
  );


-- ============================================================
-- SECTION 2: community_partners — self-read + admin policies
-- ============================================================

DROP POLICY IF EXISTS "community_partners_public_read_approved" ON community_partners;
DROP POLICY IF EXISTS "community_partners_admin_all"            ON community_partners;
DROP POLICY IF EXISTS "community_partners_self_read"            ON community_partners;

-- Authenticated users can read their own community partner row
CREATE POLICY "community_partners_self_read"
  ON community_partners FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND email = auth.email()
  );

-- Authenticated users (admins) have full write access
CREATE POLICY "community_partners_admin_all"
  ON community_partners FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public (anon) can read approved partners
-- Required for ref code validation on the /register page
CREATE POLICY "community_partners_public_read_approved"
  ON community_partners FOR SELECT
  USING (status = 'approved');


-- ============================================================
-- SECTION 3: partner_proposals — owner-read + admin policies
-- ============================================================

DROP POLICY IF EXISTS "partner_proposals_admin_read"  ON partner_proposals;
DROP POLICY IF EXISTS "partner_proposals_owner_read"  ON partner_proposals;

-- Authenticated users can read their own proposal rows
-- (matches on either email or work_email field)
CREATE POLICY "partner_proposals_owner_read"
  ON partner_proposals FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      email      = auth.email()
      OR work_email = auth.email()
    )
  );

-- Authenticated admins can read ALL proposals
CREATE POLICY "partner_proposals_admin_read"
  ON partner_proposals FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================
-- SECTION 4: admin_users table
-- Stores admin email addresses for role separation
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop before recreating to stay idempotent
DROP POLICY IF EXISTS "admin_users_authenticated_read" ON admin_users;

CREATE POLICY "admin_users_authenticated_read"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Add your admin email(s) here ────────────────────────────
-- Run these INSERT statements manually after creating the file.
-- Replace the placeholder with your real admin email address.
-- Example:
--   INSERT INTO admin_users (email)
--   VALUES ('admin@eliteforums.in')
--   ON CONFLICT (email) DO NOTHING;
-- ────────────────────────────────────────────────────────────


-- ============================================================
-- SECTION 5: is_admin() helper function
-- Returns TRUE when the current authenticated user's email
-- is in the admin_users table.
-- Usage in RLS: USING ( is_admin() )
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM   admin_users
    WHERE  email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- SECTION 6: GRANT anon SELECT on community_partners
-- The /register page calls validateRefCode() as an anonymous
-- (not-logged-in) user, so anon must be able to SELECT rows
-- where status = 'approved' (covered by the policy above).
-- ============================================================

GRANT SELECT ON community_partners TO anon;


-- ============================================================
-- SETUP NOTES — Password-Based Portal Login
-- ============================================================
--
-- The portal uses EMAIL + PASSWORD authentication.
-- Users set their password for the first time via "Forgot Password".
--
-- STEP 1 — Enable Email Auth
--   Supabase Dashboard → Authentication → Providers → Email
--   • Toggle ON
--   • Optionally turn OFF "Confirm email" for faster onboarding
--
-- STEP 2 — Create portal user accounts
--   For every person who needs portal access, create a Supabase
--   Auth user with their registered email.
--   Dashboard → Authentication → Users → "Add user"
--
--   Participants   → email from the registrations table
--   Community Ptrs → email from the community_partners table
--   College / Spns → email from the partner_proposals table
--
-- STEP 3 — Password Reset redirect URLs
--   Dashboard → Authentication → URL Configuration → Redirect URLs
--   Add ALL of:
--     http://localhost:5173/portal/reset-password
--     https://innovahack.in/portal/reset-password
--     https://<your-preview>.vercel.app/portal/reset-password
--
--   Set Site URL to your production domain:
--     https://innovahack.in
--
-- STEP 4 — Customise the reset email (optional)
--   Dashboard → Authentication → Email Templates → Reset Password
--
-- STEP 5 — First-time user flow
--   User visits /portal/login → enters email + password.
--   If no password is set → clicks "Forgot Password" →
--   receives reset link → lands on /portal/reset-password →
--   sets password → auto-redirected to /portal.
--
-- ============================================================
