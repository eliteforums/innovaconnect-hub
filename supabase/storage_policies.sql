-- ============================================================
-- InnovaHack 2026 — Storage Bucket Policies
-- ============================================================
-- Run this in your Supabase SQL Editor after creating the
-- storage buckets (resumes + sponsors) in the dashboard.
-- This file is fully IDEMPOTENT — safe to run multiple times.
-- ============================================================


-- ============================================================
-- BUCKET: resumes (PRIVATE)
-- Who can do what:
--   INSERT  → anyone (public form submission uploads resume)
--   SELECT  → authenticated users only (admins viewing resumes)
--   UPDATE  → authenticated users only (admin can replace file)
--   DELETE  → authenticated users only (admin can remove file)
-- ============================================================

-- DROP existing policies first so re-runs don't error
DROP POLICY IF EXISTS "resumes_public_insert"         ON storage.objects;
DROP POLICY IF EXISTS "resumes_admin_select"          ON storage.objects;
DROP POLICY IF EXISTS "resumes_admin_update"          ON storage.objects;
DROP POLICY IF EXISTS "resumes_admin_delete"          ON storage.objects;

-- Allow anyone to upload a resume (called during registration)
CREATE POLICY "resumes_public_insert"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'resumes');

-- Only authenticated users (admins / portal users) can read resumes
CREATE POLICY "resumes_admin_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes');

-- Only authenticated users can overwrite / update a resume
CREATE POLICY "resumes_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes')
  WITH CHECK (bucket_id = 'resumes');

-- Only authenticated users can delete a resume
CREATE POLICY "resumes_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes');


-- ============================================================
-- BUCKET: sponsors (PUBLIC)
-- Who can do what:
--   SELECT  → everyone (logos are public on the website)
--   INSERT  → authenticated users only (admin uploading logos)
--   UPDATE  → authenticated users only (admin replacing logos)
--   DELETE  → authenticated users only (admin removing logos)
-- ============================================================

DROP POLICY IF EXISTS "sponsors_public_select"        ON storage.objects;
DROP POLICY IF EXISTS "sponsors_admin_insert"         ON storage.objects;
DROP POLICY IF EXISTS "sponsors_admin_update"         ON storage.objects;
DROP POLICY IF EXISTS "sponsors_admin_delete"         ON storage.objects;

-- Anyone can read sponsor logos (needed for public website display)
CREATE POLICY "sponsors_public_select"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'sponsors');

-- Only authenticated users (admins) can upload sponsor logos
CREATE POLICY "sponsors_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sponsors');

-- Only authenticated users can replace a sponsor logo
CREATE POLICY "sponsors_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'sponsors')
  WITH CHECK (bucket_id = 'sponsors');

-- Only authenticated users can delete a sponsor logo
CREATE POLICY "sponsors_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'sponsors');


-- ============================================================
-- VERIFY — after running, check policies were created:
-- SELECT policyname, tablename, cmd, roles
-- FROM   pg_policies
-- WHERE  tablename = 'objects'
--   AND  schemaname = 'storage'
-- ORDER  BY policyname;
-- ============================================================
