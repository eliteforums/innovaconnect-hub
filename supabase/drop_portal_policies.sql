-- ============================================================
-- InnovaHack 2026 — Drop Portal Policies (Run this FIRST)
-- ============================================================
-- Run this script in the Supabase SQL Editor BEFORE running
-- portal_auth.sql if you get "policy already exists" errors.
-- This is a one-time cleanup script — safe to run multiple times.
-- ============================================================

-- registrations
DROP POLICY IF EXISTS "registrations_admin_read"            ON registrations;
DROP POLICY IF EXISTS "registrations_owner_read"            ON registrations;

-- community_partners
DROP POLICY IF EXISTS "community_partners_public_read_approved" ON community_partners;
DROP POLICY IF EXISTS "community_partners_admin_all"            ON community_partners;
DROP POLICY IF EXISTS "community_partners_self_read"            ON community_partners;

-- partner_proposals
DROP POLICY IF EXISTS "partner_proposals_admin_read"        ON partner_proposals;
DROP POLICY IF EXISTS "partner_proposals_owner_read"        ON partner_proposals;
DROP POLICY IF EXISTS "partner_proposals_public_insert"     ON partner_proposals;
DROP POLICY IF EXISTS "partner_proposals_admin_update"      ON partner_proposals;
DROP POLICY IF EXISTS "partner_proposals_admin_delete"      ON partner_proposals;

-- admin_users
DROP POLICY IF EXISTS "admin_users_authenticated_read"      ON admin_users;
