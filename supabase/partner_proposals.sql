-- ============================================================
-- TABLE: partner_proposals
-- Stores all partner/sponsor proposal form submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_proposals (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_type         TEXT NOT NULL,
  -- proposal_type values:
  --   hiring_partner, tech_partner, education_partner,
  --   domain_sponsor, college_partner, community_partner

  -- Common contact fields (present in all forms)
  contact_person_name   TEXT,
  work_email            TEXT,
  email                 TEXT,
  phone_number          TEXT,
  additional_message    TEXT,

  -- Company/Org identity (varies by form type)
  company_name          TEXT,
  organisation_name     TEXT,
  community_name        TEXT,
  college_university_name TEXT,
  website               TEXT,
  company_website       TEXT,
  community_website_link TEXT,

  -- Hiring Partner specific
  industry_sector       TEXT,
  designation           TEXT,
  number_of_roles       TEXT,
  roles_job_profiles    TEXT,
  hiring_timeline       TEXT,
  assured_hiring_commitment TEXT,

  -- Tech Partner specific
  product_platform_name TEXT,
  what_are_you_offering TEXT,
  target_developers     TEXT,
  budget_in_kind_value  TEXT,

  -- Education Partner specific
  type_of_organisation  TEXT,
  number_of_beneficiaries TEXT,
  collaboration_type    TEXT,

  -- Domain Sponsor specific
  industry              TEXT,
  preferred_domain_track TEXT,
  sponsorship_budget    TEXT,
  custom_challenge      TEXT,
  custom_challenge_description TEXT,

  -- College Partner specific
  city                  TEXT,
  state                 TEXT,
  college_website       TEXT,
  estimated_student_participation TEXT,
  technical_coding_club TEXT,
  club_society_name     TEXT,
  how_will_you_promote  TEXT,

  -- Community Partner specific
  community_platform    TEXT,
  community_size        TEXT,
  community_focus       TEXT,
  sponsorship_outreach  TEXT,

  -- Admin fields
  status                TEXT DEFAULT 'new' CHECK (status IN ('new','reviewed','contacted','converted','rejected')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_proposals_type      ON partner_proposals (proposal_type);
CREATE INDEX IF NOT EXISTS idx_partner_proposals_status    ON partner_proposals (status);
CREATE INDEX IF NOT EXISTS idx_partner_proposals_created   ON partner_proposals (created_at DESC);

ALTER TABLE partner_proposals ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form submission)
CREATE POLICY "partner_proposals_public_insert"
  ON partner_proposals FOR INSERT
  WITH CHECK (TRUE);

-- Only authenticated admins can read/update/delete
CREATE POLICY "partner_proposals_admin_read"
  ON partner_proposals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "partner_proposals_admin_update"
  ON partner_proposals FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "partner_proposals_admin_delete"
  ON partner_proposals FOR DELETE
  USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE TRIGGER trigger_partner_proposals_updated_at
  BEFORE UPDATE ON partner_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
