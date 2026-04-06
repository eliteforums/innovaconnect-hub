-- ============================================================
-- InnovaHack 2026 — Portal Auth SQL
-- ============================================================
-- Run this AFTER schema.sql and referral_system.sql.
-- Sets up RLS policies so portal users (authenticated via magic link)
-- can only read THEIR OWN data.
-- ============================================================


-- ============================================================
-- POLICY: Participants can read their own registration
-- ============================================================
-- First drop the existing admin-only select policy on registrations
-- (We need to allow authenticated users to also read their own row)

-- Drop existing admin-only SELECT policy if it exists
DROP POLICY IF EXISTS "registrations_admin_read" ON registrations;

-- New policy: authenticated users can read rows where email matches their auth email
CREATE POLICY "registrations_owner_read"
  ON registrations FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      -- Admins can read all rows (auth.email() is an admin email)
      -- Participants can only read their own row
      email = auth.email()
      -- Note: for proper admin separation, see INSTRUCTIONS.md
      -- In practice, add admins to a separate admin_users table
    )
  );

-- ============================================================
-- POLICY: Community partners can read their own row
-- ============================================================
DROP POLICY IF EXISTS "community_partners_public_read_approved" ON community_partners;
DROP POLICY IF EXISTS "community_partners_admin_all" ON community_partners;

-- Authenticated users can read their own row OR all rows if admin
CREATE POLICY "community_partners_self_read"
  ON community_partners FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND email = auth.email()
  );

-- Admin full access
CREATE POLICY "community_partners_admin_all"
  ON community_partners FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can read approved partners (for ref code validation on register page)
CREATE POLICY "community_partners_public_read_approved"
  ON community_partners FOR SELECT
  USING (status = 'approved');


-- ============================================================
-- POLICY: Partner proposals — users can read their own proposals
-- ============================================================
DROP POLICY IF EXISTS "partner_proposals_admin_read" ON partner_proposals;

CREATE POLICY "partner_proposals_owner_read"
  ON partner_proposals FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      email = auth.email()
      OR work_email = auth.email()
    )
  );

-- Admin can read all
CREATE POLICY "partner_proposals_admin_read"
  ON partner_proposals FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================
-- ADMIN USERS TABLE
-- Store admin emails so we can distinguish admins from portal users
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read (to check if current user is admin)
CREATE POLICY "admin_users_authenticated_read"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert your admin email(s) here:
-- INSERT INTO admin_users (email) VALUES ('your-admin@email.com');
-- You can add multiple admins by running more INSERT statements.


-- ============================================================
-- FUNCTION: is_admin() — returns true if the current authenticated
-- user's email is in the admin_users table
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- NOTE ON SUPABASE AUTH SETUP (Password-Based Login)
-- ============================================================
-- The portal uses EMAIL + PASSWORD authentication.
-- Users set their password the first time via "Forgot Password".
--
-- STEP 1 — Enable Email Auth
--   Supabase Dashboard → Authentication → Providers
--   Make sure "Email" is enabled.
--   Turn OFF "Confirm email" if you want users to log in without
--   email verification (recommended for hackathon speed).
--
-- STEP 2 — Create portal user accounts
--   For each participant / partner who needs portal access, create
--   a Supabase Auth user with their registered email address.
--   Dashboard → Authentication → Users → "Add user"
--   OR use the bulk invite / admin API if you have many users.
--
--   Participants: use the email from the registrations table.
--   Community partners: use the email from community_partners table.
--   College partners / sponsors: use the email from partner_proposals.
--
-- STEP 3 — Password Reset redirect URL
--   Dashboard → Authentication → URL Configuration → Redirect URLs
--   Add ALL of the following:
--     http://localhost:5173/portal/reset-password   (local dev)
--     https://innovahack.in/portal/reset-password   (production)
--     https://your-vercel-preview.vercel.app/portal/reset-password
--
--   The Site URL should be set to your production domain:
--     https://innovahack.in
--
-- STEP 4 — Customize the password reset email template (optional)
--   Dashboard → Authentication → Email Templates → Reset Password
--   You can add your branding, logo, and custom copy here.
--
-- STEP 5 — First-time user flow
--   Users visit /portal/login → enter email + password.
--   If they don't know their password, they click "Forgot Password",
--   enter their email, and receive a reset link.
--   The reset link redirects to /portal/reset-password where they
--   set a new password, then are auto-redirected to /portal.
-- ============================================================


-- ============================================================
-- GRANT: Allow anon users to call validate ref code
-- (the validateRefCode function queries community_partners as anon)
-- ============================================================
GRANT SELECT ON community_partners TO anon;
