-- ============================================================
-- HMS Performance Migration: 004_hms_performance.sql
-- Additional indexes and optimizations for 50K+ user scale
-- ============================================================

-- ============================================================
-- COMPOSITE INDEXES for common query patterns
-- ============================================================

-- Teams: search by name, team_id, or email (admin team management)
CREATE INDEX IF NOT EXISTS idx_teams_leader_email ON teams(leader_email);
CREATE INDEX IF NOT EXISTS idx_teams_status_domain ON teams(status, domain);

-- Submissions: admin filtering by status + domain (via join)
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON submissions(updated_at DESC);

-- Notifications: finalist query pattern (published + audience targeting)
CREATE INDEX IF NOT EXISTS idx_notifications_published_audience 
  ON notifications(published_at, audience_type, audience_value) 
  WHERE published_at IS NOT NULL;

-- Notification reads: fast unread count calculation
CREATE INDEX IF NOT EXISTS idx_notification_reads_team_notif 
  ON notification_reads(team_id, notification_id);

-- Login attempts: lockout check (email + recent failures)
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_success_created 
  ON login_attempts(email, success, created_at DESC);

-- Email log: admin failed emails view
CREATE INDEX IF NOT EXISTS idx_email_log_status_created 
  ON email_log(status, created_at DESC);

-- Registrations: shortlisting queries (status filter)
CREATE INDEX IF NOT EXISTS idx_registrations_status 
  ON registrations(status);

CREATE INDEX IF NOT EXISTS idx_registrations_email 
  ON registrations(email);

-- ============================================================
-- PARTIAL INDEXES for hot paths
-- ============================================================

-- Only active teams (most queries filter by active status)
CREATE INDEX IF NOT EXISTS idx_teams_active 
  ON teams(domain, team_name) 
  WHERE status = 'active';

-- Only pending submissions (admin review queue)
CREATE INDEX IF NOT EXISTS idx_submissions_pending 
  ON submissions(team_id) 
  WHERE status = 'pending';

-- Only future-scheduled notifications (for scheduled publish check)
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled 
  ON notifications(scheduled_at) 
  WHERE published_at IS NULL AND scheduled_at IS NOT NULL;

-- Only failed emails (admin resend queue)
CREATE INDEX IF NOT EXISTS idx_email_log_failed 
  ON email_log(recipient, created_at DESC) 
  WHERE status = 'failed';

-- ============================================================
-- STATISTICS for query planner optimization
-- ============================================================

-- Increase statistics targets for frequently filtered columns
ALTER TABLE teams ALTER COLUMN domain SET STATISTICS 1000;
ALTER TABLE teams ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE submissions ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE registrations ALTER COLUMN status SET STATISTICS 1000;

-- Analyze tables to update statistics
ANALYZE teams;
ANALYZE team_members;
ANALYZE submissions;
ANALYZE notifications;
ANALYZE notification_reads;
ANALYZE login_attempts;
ANALYZE email_log;
ANALYZE registrations;

-- ============================================================
-- CONNECTION POOLING NOTE
-- ============================================================
-- For 50K+ users, enable PgBouncer in Supabase Dashboard:
-- Project Settings → Database → Connection Pooling → Enable
-- Pool Mode: Transaction (recommended for web apps)
-- Pool Size: 15-25 (Pro plan default)
--
-- This allows hundreds of concurrent connections to be multiplexed
-- through a smaller pool of actual PostgreSQL connections.
-- ============================================================
