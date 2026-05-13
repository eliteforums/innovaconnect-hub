-- ============================================================
-- HMS RLS Policies Migration: 002_hms_rls_policies.sql
-- Enables Row Level Security and creates all access policies
-- for Hackathon Management System tables.
--
-- Role hierarchy:
--   Super_Admin  → full access to all HMS tables
--   Moderator    → read access + submission review
--   Team_Leader  → own-team access only
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL HMS TABLES
-- ============================================================
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: admin_roles
-- Only super_admins can manage roles; admins can read their own
-- ============================================================

-- Super admins can do everything on admin_roles
CREATE POLICY "admin_roles_all_super_admin" ON admin_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles ar WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
  ));

-- Any admin can read their own role
CREATE POLICY "admin_roles_select_own" ON admin_roles FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- POLICIES: teams
-- ============================================================

-- Team leaders can read their own team
CREATE POLICY "teams_select_own" ON teams FOR SELECT
  USING (leader_id = auth.uid());

-- Team leaders can update their own team (e.g., github_url)
CREATE POLICY "teams_update_own" ON teams FOR UPDATE
  USING (leader_id = auth.uid())
  WITH CHECK (leader_id = auth.uid());

-- Admins (super_admin or moderator) can read all teams
CREATE POLICY "teams_select_admin" ON teams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- Super admins can insert/update/delete teams
CREATE POLICY "teams_all_super_admin" ON teams FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- ============================================================
-- POLICIES: team_members
-- ============================================================

-- Team leaders can read their own team members
CREATE POLICY "team_members_select_own" ON team_members FOR SELECT
  USING (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Team leaders can update their own team members
CREATE POLICY "team_members_update_own" ON team_members FOR UPDATE
  USING (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ))
  WITH CHECK (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Admins (super_admin or moderator) can read all team members
CREATE POLICY "team_members_select_admin" ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- Super admins can do everything on team_members
CREATE POLICY "team_members_all_super_admin" ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- ============================================================
-- POLICIES: submissions
-- ============================================================

-- Team leaders can read their own submission
CREATE POLICY "submissions_select_own" ON submissions FOR SELECT
  USING (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Team leaders can insert their own submission
CREATE POLICY "submissions_upsert_own" ON submissions FOR INSERT
  WITH CHECK (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Team leaders can update their own submission
CREATE POLICY "submissions_update_own" ON submissions FOR UPDATE
  USING (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ))
  WITH CHECK (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Admins (super_admin or moderator) can read all submissions
CREATE POLICY "submissions_select_admin" ON submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- Moderators (and super_admins) can update submission status
CREATE POLICY "submissions_update_moderator" ON submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- Super admins can do everything on submissions
CREATE POLICY "submissions_all_super_admin" ON submissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- ============================================================
-- POLICIES: problem_statements
-- ============================================================

-- Finalists can read released problem statements in their domain
CREATE POLICY "ps_select_finalist" ON problem_statements FOR SELECT
  USING (
    release_at <= now() AND
    domain IN (SELECT domain FROM teams WHERE leader_id = auth.uid())
  );

-- Admins can do everything on problem_statements
CREATE POLICY "ps_all_admin" ON problem_statements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- ============================================================
-- POLICIES: notifications
-- ============================================================

-- Finalists can read published notifications targeted at them
CREATE POLICY "notifications_select_finalist" ON notifications FOR SELECT
  USING (
    published_at IS NOT NULL AND published_at <= now() AND (
      audience_type = 'all' OR
      (audience_type = 'domain' AND audience_value IN (
        SELECT domain FROM teams WHERE leader_id = auth.uid()
      )) OR
      (audience_type = 'team' AND audience_value IN (
        SELECT team_id FROM teams WHERE leader_id = auth.uid()
      ))
    )
  );

-- Admins can do everything on notifications
CREATE POLICY "notifications_all_admin" ON notifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- ============================================================
-- POLICIES: notification_reads
-- ============================================================

-- Team leaders can insert reads for their own team
CREATE POLICY "notification_reads_insert_own" ON notification_reads FOR INSERT
  WITH CHECK (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Team leaders can read their own reads
CREATE POLICY "notification_reads_select_own" ON notification_reads FOR SELECT
  USING (team_id IN (
    SELECT id FROM teams WHERE leader_id = auth.uid()
  ));

-- Admins can read all notification reads
CREATE POLICY "notification_reads_select_admin" ON notification_reads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- Super admins can do everything on notification_reads
CREATE POLICY "notification_reads_all_super_admin" ON notification_reads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- ============================================================
-- POLICIES: email_log
-- Only admins can read/write
-- ============================================================

-- Admins can do everything on email_log
CREATE POLICY "email_log_all_admin" ON email_log FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- ============================================================
-- POLICIES: access_audit_log
-- Only admins can read; any authenticated user can insert
-- ============================================================

-- Any authenticated user can insert audit log entries
CREATE POLICY "access_audit_log_insert_authenticated" ON access_audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can read all audit log entries
CREATE POLICY "access_audit_log_select_admin" ON access_audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));

-- ============================================================
-- POLICIES: login_attempts
-- Anyone can insert (for recording attempts); only admins can read
-- ============================================================

-- Any authenticated user can insert login attempts
CREATE POLICY "login_attempts_insert_authenticated" ON login_attempts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can read all login attempts
CREATE POLICY "login_attempts_select_admin" ON login_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  ));
