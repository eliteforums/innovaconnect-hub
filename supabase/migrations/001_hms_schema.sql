-- ============================================================
-- HMS Schema Migration: 001_hms_schema.sql
-- Creates all Hackathon Management System tables
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNCTION: update_updated_at_column()
-- Trigger function to automatically set updated_at = now()
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: admin_roles
-- Maps auth users to admin roles (super_admin, moderator)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: teams
-- Finalist team records
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id              TEXT NOT NULL UNIQUE CHECK (team_id ~ '^IH-\d{4}$'),
  team_name            TEXT NOT NULL,
  leader_id            UUID NOT NULL REFERENCES auth.users(id),
  leader_email         TEXT NOT NULL,
  domain               TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disqualified')),
  github_url           TEXT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  registration_id      UUID REFERENCES registrations(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_team_id ON teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_domain ON teams(domain);

-- Trigger: auto-update updated_at on teams
CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: team_members
-- Individual team member records
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Trigger: auto-update updated_at on team_members
CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: problem_statements
-- Hackathon problem statements
-- ============================================================
CREATE TABLE IF NOT EXISTS problem_statements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL CHECK (length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) <= 5000),
  domain      TEXT NOT NULL,
  deadline    TIMESTAMPTZ NULL,
  release_at  TIMESTAMPTZ NOT NULL,
  resources   JSONB NOT NULL DEFAULT '[]',
  is_updated  BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problem_statements_domain ON problem_statements(domain);
CREATE INDEX IF NOT EXISTS idx_problem_statements_release_at ON problem_statements(release_at);

-- ============================================================
-- TABLE: submissions
-- Team project submissions (one per team)
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id            UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  github_url         TEXT NULL,
  pitch_deck_url     TEXT NULL,
  video_url          TEXT NULL,
  documentation_urls JSONB NOT NULL DEFAULT '[]',
  pow_urls           JSONB NOT NULL DEFAULT '[]',
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'reviewed', 'flagged')),
  flag_reason        TEXT NULL CHECK (flag_reason IS NULL OR (length(flag_reason) >= 10 AND length(flag_reason) <= 500)),
  reviewed_by        UUID NULL REFERENCES auth.users(id),
  reviewed_at        TIMESTAMPTZ NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Trigger: auto-update updated_at on submissions
CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: notifications
-- Admin announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  message        TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 5000),
  audience_type  TEXT NOT NULL CHECK (audience_type IN ('all', 'domain', 'team')),
  audience_value TEXT NULL,
  published_at   TIMESTAMPTZ NULL,
  scheduled_at   TIMESTAMPTZ NULL,
  created_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_published_at ON notifications(published_at);
CREATE INDEX IF NOT EXISTS idx_notifications_audience ON notifications(audience_type, audience_value);

-- ============================================================
-- TABLE: notification_reads
-- Tracks which teams have read which notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_reads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (notification_id, team_id)
);

-- ============================================================
-- TABLE: email_log
-- Email delivery tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient  TEXT NOT NULL,
  template   TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  retries    INTEGER NOT NULL DEFAULT 0,
  error      TEXT NULL,
  team_id    UUID NULL REFERENCES teams(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_team_id ON email_log(team_id);

-- Trigger: auto-update updated_at on email_log
CREATE TRIGGER trg_email_log_updated_at
  BEFORE UPDATE ON email_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: access_audit_log
-- Records unauthorized access attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS access_audit_log (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL,
  route     TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: login_attempts
-- Tracks failed login attempts for lockout
-- ============================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  success    BOOLEAN NOT NULL,
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
