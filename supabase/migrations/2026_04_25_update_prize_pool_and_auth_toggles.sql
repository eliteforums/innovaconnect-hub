-- ============================================================
-- Migration: 2026-04-25
-- Updates:
--   1. Change prize pool displays from "₹3 LAKHS+" to "₹50 LAKHS+" across all site_content sections.
--   2. Add `login_enabled` and `register_enabled` flags (default FALSE) to the `settings` section
--      so admins can toggle the Navbar Login / Register buttons from the admin panel.
--
-- Run this after the initial schema.sql to migrate an existing database in place.
-- Safe to re-run: each statement is idempotent (values are overwritten with the desired state).
-- ============================================================

BEGIN;

-- ---- HERO: update prize_pool + highlighted key_fact ----
UPDATE site_content
SET content = jsonb_set(
      jsonb_set(
        content,
        '{prize_pool}',
        '"₹50 LAKHS+"'::jsonb,
        true
      ),
      '{key_facts}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN (kf->>'label') = 'PRIZE POOL — CASH, GOODIES & MORE'
              THEN jsonb_set(kf, '{number}', '"₹50 LAKHS+"'::jsonb, true)
            ELSE kf
          END
        )
        FROM jsonb_array_elements(content->'key_facts') AS kf
      ),
      true
    )
WHERE section = 'hero';

-- ---- OUTCOMES: update prize_pool_amount + first outcome item ----
UPDATE site_content
SET content = jsonb_set(
      jsonb_set(
        content,
        '{prize_pool_amount}',
        '"₹50 LAKHS+"'::jsonb,
        true
      ),
      '{outcomes}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN (o->>'title') IN ('₹3 LAKHS PRIZE POOL', '₹50 LAKHS+ PRIZE POOL')
              THEN jsonb_build_object(
                'title', '₹50 LAKHS+ PRIZE POOL',
                'desc',  'Compete for a massive prize pool of ₹50 Lakhs+ including cash prizes and exciting goodies for top performers and winners.',
                'accent', COALESCE(o->>'accent', 'border-editorial-pink')
              )
            ELSE o
          END
        )
        FROM jsonb_array_elements(content->'outcomes') AS o
      ),
      true
    )
WHERE section = 'outcomes';

-- ---- SETTINGS: add login_enabled + register_enabled defaults (FALSE) ----
UPDATE site_content
SET content = content
             || jsonb_build_object(
                  'login_enabled',
                  COALESCE((content->>'login_enabled')::boolean, FALSE)
                )
             || jsonb_build_object(
                  'register_enabled',
                  COALESCE((content->>'register_enabled')::boolean, FALSE)
                )
WHERE section = 'settings';

COMMIT;