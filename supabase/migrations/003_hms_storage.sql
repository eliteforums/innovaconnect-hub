-- ============================================================
-- HMS Storage Migration: 003_hms_storage.sql
-- Creates storage buckets and RLS policies for file uploads
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS
-- All buckets are private (no public access)
-- ============================================================

-- pitch-decks: PDF, PPTX up to 50 MB
-- Path pattern: {team_uuid}/pitch-deck.{ext}
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch-decks', 'pitch-decks', false)
ON CONFLICT (id) DO NOTHING;

-- documentation: PDF, DOCX up to 25 MB
-- Path pattern: {team_uuid}/docs/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentation', 'documentation', false)
ON CONFLICT (id) DO NOTHING;

-- proof-of-work: PNG, JPG, WEBP up to 10 MB
-- Path pattern: {team_uuid}/pow/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-of-work', 'proof-of-work', false)
ON CONFLICT (id) DO NOTHING;

-- finalist-assets: PDF, DOCX, PNG, JPG, ZIP up to 50 MB
-- Path pattern: problem-statements/{ps_uuid}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('finalist-assets', 'finalist-assets', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES ON storage.objects
-- Team leaders can only access their own team folder
-- Admins have full access to all buckets
-- ============================================================

-- ------------------------------------------------------------
-- pitch-decks bucket policies
-- ------------------------------------------------------------

-- Team leaders can upload files to their own team folder
CREATE POLICY "pitch_decks_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can read their own files; admins can read all
CREATE POLICY "pitch_decks_select_own_or_admin" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-decks' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- Team leaders can update (replace) their own files
CREATE POLICY "pitch_decks_update_own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can delete their own files; admins can delete all
CREATE POLICY "pitch_decks_delete_own_or_admin" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pitch-decks' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- documentation bucket policies
-- ------------------------------------------------------------

-- Team leaders can upload files to their own team folder
CREATE POLICY "documentation_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentation' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can read their own files; admins can read all
CREATE POLICY "documentation_select_own_or_admin" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentation' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- Team leaders can update (replace) their own files
CREATE POLICY "documentation_update_own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentation' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'documentation' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can delete their own files; admins can delete all
CREATE POLICY "documentation_delete_own_or_admin" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentation' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- proof-of-work bucket policies
-- ------------------------------------------------------------

-- Team leaders can upload files to their own team folder
CREATE POLICY "proof_of_work_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'proof-of-work' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can read their own files; admins can read all
CREATE POLICY "proof_of_work_select_own_or_admin" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'proof-of-work' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- Team leaders can update (replace) their own files
CREATE POLICY "proof_of_work_update_own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'proof-of-work' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'proof-of-work' AND
    (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid())
  );

-- Team leaders can delete their own files; admins can delete all
CREATE POLICY "proof_of_work_delete_own_or_admin" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'proof-of-work' AND (
      (storage.foldername(name))[1] IN (SELECT id::text FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- finalist-assets bucket policies
-- Only admins can upload; finalists can read (for problem statement resources)
-- ------------------------------------------------------------

-- Only admins can upload to finalist-assets
CREATE POLICY "finalist_assets_insert_admin" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'finalist-assets' AND
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );

-- Finalists can read files (problem statement resources); admins can read all
CREATE POLICY "finalist_assets_select_finalist_or_admin" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'finalist-assets' AND (
      EXISTS (SELECT 1 FROM teams WHERE leader_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
    )
  );

-- Only admins can update finalist-assets
CREATE POLICY "finalist_assets_update_admin" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'finalist-assets' AND
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'finalist-assets' AND
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );

-- Only admins can delete from finalist-assets
CREATE POLICY "finalist_assets_delete_admin" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'finalist-assets' AND
    EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid())
  );
