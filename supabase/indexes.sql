-- ============================================================
-- InnovaHack 2026 — Additional Database Indexes & Functions
-- ============================================================
-- Run this AFTER schema.sql and referral_system.sql.
-- These optimizations are critical for handling 20,000+ users.
-- ============================================================


-- ============================================================
-- REMOVE DUPLICATE INDEX on site_content.section
-- UNIQUE constraint already creates a B-tree index.
-- The explicit index is redundant and wastes write performance.
-- ============================================================
DROP INDEX IF EXISTS idx_site_content_section;


-- ============================================================
-- UNIQUE CONSTRAINT on registrations.email
-- Prevents duplicate registrations from the same email address.
-- Without this, a user can submit the form multiple times.
-- ============================================================
ALTER TABLE registrations
  ADD CONSTRAINT IF NOT EXISTS registrations_email_unique UNIQUE (email);


-- ============================================================
-- GIN INDEX on registrations.team_members (JSONB)
-- Enables fast search within the team members JSONB array.
-- e.g. "find all registrations where a specific email is a team member"
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_team_members_gin
  ON registrations USING GIN (team_members);


-- ============================================================
-- COMPOSITE INDEX: registrations(status, created_at)
-- Speeds up filtered admin queries like "all shortlisted, newest first"
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_status_created
  ON registrations (status, created_at DESC);


-- ============================================================
-- COMPOSITE INDEX: registrations(team_type, created_at)
-- Speeds up team-type filtered queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_team_created
  ON registrations (team_type, created_at DESC);


-- ============================================================
-- INDEX: registrations.ref_code
-- Speeds up referral leaderboard queries
-- Already exists in referral_system.sql — this is a safety net
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_ref_code_nn
  ON registrations (ref_code)
  WHERE ref_code IS NOT NULL;


-- ============================================================
-- INDEX: partner_proposals(email, proposal_type)
-- Speeds up portal login role resolution
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_partner_proposals_email_type
  ON partner_proposals (email, proposal_type);

CREATE INDEX IF NOT EXISTS idx_partner_proposals_work_email
  ON partner_proposals (work_email)
  WHERE work_email IS NOT NULL;


-- ============================================================
-- INDEX: community_partners.email
-- Speeds up portal login role resolution for community partners
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_community_partners_email
  ON community_partners (email);


-- ============================================================
-- FUNCTION: get_registration_stats()
-- Returns aggregate counts — used by admin Overview dashboard.
-- This avoids transferring all rows to the client just to count them.
-- ============================================================
CREATE OR REPLACE FUNCTION get_registration_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total',       COUNT(*),
    'pending',     COUNT(*) FILTER (WHERE status = 'pending'),
    'shortlisted', COUNT(*) FILTER (WHERE status = 'shortlisted'),
    'confirmed',   COUNT(*) FILTER (WHERE status = 'confirmed'),
    'rejected',    COUNT(*) FILTER (WHERE status = 'rejected'),
    'solo',        COUNT(*) FILTER (WHERE team_type = 'solo'),
    'duo',         COUNT(*) FILTER (WHERE team_type = 'duo'),
    'trio',        COUNT(*) FILTER (WHERE team_type = 'trio'),
    'quad',        COUNT(*) FILTER (WHERE team_type = 'quad'),
    'today',       COUNT(*) FILTER (
                     WHERE created_at::date = CURRENT_DATE
                   ),
    'this_week',   COUNT(*) FILTER (
                     WHERE created_at >= date_trunc('week', NOW())
                   )
  )
  INTO v_result
  FROM registrations;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users (admins)
GRANT EXECUTE ON FUNCTION get_registration_stats() TO authenticated;


-- ============================================================
-- FUNCTION: get_inquiry_stats()
-- Returns aggregate counts for contact inquiries
-- ============================================================
CREATE OR REPLACE FUNCTION get_inquiry_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total',    COUNT(*),
    'new',      COUNT(*) FILTER (WHERE status = 'new'),
    'read',     COUNT(*) FILTER (WHERE status = 'read'),
    'replied',  COUNT(*) FILTER (WHERE status = 'replied'),
    'archived', COUNT(*) FILTER (WHERE status = 'archived')
  )
  INTO v_result
  FROM contact_inquiries;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_inquiry_stats() TO authenticated;


-- ============================================================
-- SUPABASE PERFORMANCE TIPS (apply in dashboard)
-- ============================================================
-- 1. Use the POOLER connection string in production (not direct).
--    Dashboard → Settings → Database → Connection pooling
--    Use "Transaction" mode for serverless/edge functions.
--    Use "Session" mode for long-lived server connections.
--
-- 2. Enable "Compute" auto-scaling if on a paid plan.
--
-- 3. Add the following to your Supabase project settings:
--    statement_timeout = 30s  (prevent runaway queries)
--    idle_in_transaction_session_timeout = 60s
-- ============================================================
