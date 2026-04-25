-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Update registration fee to ₹250 per person (Round 2 finalists)
-- ─────────────────────────────────────────────────────────────────────────────
-- Purpose:
--   Round 1 is now completely FREE for all participants.
--   Round 2 (Offline/Hybrid round) charges ₹250 per person for finalists only.
--
-- This migration updates site_content JSON in the public.site_content table so
-- published site values match the new fee structure:
--   1. hero.key_facts — replace ₹50 registration fee entry with ₹250 finalist
--      fee, and update the R1/R2 mode row.
--   2. fee section — update fee_amount, fee_label, mode_r1, mode_r2, and
--      roi_multiplier.
--   3. settings.registration_fee — bump to ₹250.
--   4. faq — refresh the registration-fee FAQ entry.
--   5. about.stats — update the registration fee stat card.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Update hero section key_facts
UPDATE public.site_content
SET content = jsonb_set(
  content,
  '{key_facts}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN kf->>'label' = 'REGISTRATION FEE'
          THEN jsonb_build_object(
                 'number', '₹250',
                 'label', 'REGISTRATION FEE (FOR FINALISTS)'
               )
             || COALESCE(kf - 'number' - 'label', '{}'::jsonb)
        WHEN kf->>'number' = 'R1: ONLINE'
          THEN jsonb_build_object(
                 'number', 'R1: FREE',
                 'label', 'R2: PAID (HYBRID)'
               )
             || COALESCE(kf - 'number' - 'label', '{}'::jsonb)
        ELSE kf
      END
    )
    FROM jsonb_array_elements(content->'key_facts') kf
  ),
  false
)
WHERE section = 'hero'
  AND content ? 'key_facts';

-- 2. Update fee section
UPDATE public.site_content
SET content = content
  || jsonb_build_object(
       'fee_amount', '₹250',
       'fee_label', 'PER PERSON — FOR FINALISTS (ROUND 2) ONLY. ROUND 1 IS FREE.',
       'mode_r1', 'Fully Online — participate from anywhere (FREE)',
       'mode_r2', 'Hybrid — in-person in Mumbai or online (PAID)',
       'roi_multiplier', '180x ROI'
     )
WHERE section = 'fee';

-- 3. Update settings registration_fee
UPDATE public.site_content
SET content = jsonb_set(content, '{registration_fee}', '"₹250"'::jsonb, false)
WHERE section = 'settings';

-- 4. Update FAQ entry about registration fee
UPDATE public.site_content
SET content = jsonb_set(
  content,
  '{faqs}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN fq->>'q' ILIKE '%registration fee%'
          THEN jsonb_build_object(
                 'q', 'What is the ₹250 registration fee?',
                 'a', 'Round 1 is completely FREE for all participants. The ₹250 per person registration fee applies only to finalists who qualify for Round 2 (the offline/hybrid round). It helps us ensure every finalist is genuinely committed to participating in the in-person event.'
               )
        ELSE fq
      END
    )
    FROM jsonb_array_elements(content->'faqs') fq
  ),
  false
)
WHERE section = 'faq'
  AND content ? 'faqs';

-- 5. Update about.stats registration fee
UPDATE public.site_content
SET content = jsonb_set(
  content,
  '{stats}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN st->>'label' = 'REGISTRATION FEE'
          THEN jsonb_build_object(
                 'number', '₹250',
                 'label', 'FINALIST REGISTRATION FEE'
               )
        ELSE st
      END
    )
    FROM jsonb_array_elements(content->'stats') st
  ),
  false
)
WHERE section = 'about'
  AND content ? 'stats';

COMMIT;