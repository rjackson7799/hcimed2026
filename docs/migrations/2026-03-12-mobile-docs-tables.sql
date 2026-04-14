-- ============================================================
-- Mobile Docs Facility Directory — Database Migration
-- Creates facilities_directory and related tables, indexes,
-- RLS policies, triggers, and seed data.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Table: facilities_directory
-- Master registry of all locations where Mobile Docs delivers
-- or may deliver care.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SNF', 'Board & Care', 'Homebound')),
  status TEXT NOT NULL DEFAULT 'Prospecting' CHECK (status IN ('Prospecting', 'Onboarding', 'Active', 'Inactive')),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  phone TEXT,
  total_beds INTEGER,
  pos_code INTEGER,
  distance_miles NUMERIC(5,1),
  drive_minutes INTEGER,
  visit_cadence TEXT DEFAULT 'TBD' CHECK (visit_cadence IN ('Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'As Needed', 'TBD')),
  assigned_provider_id UUID REFERENCES ph_providers(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fd_directory_tenant ON facilities_directory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fd_directory_provider ON facilities_directory(assigned_provider_id);
CREATE INDEX IF NOT EXISTS idx_fd_directory_status_archived ON facilities_directory(status, is_archived);

-- ──────────────────────────────────────────────────────────────
-- Table: facility_contacts
-- Contact persons associated with each facility.
-- Supports multiple contacts per facility.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities_directory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('DON', 'Administrator', 'Owner', 'Discharge Planner', 'Social Worker', 'Caregiver', 'MA Plan Coordinator', 'Other')),
  title TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  contact_type TEXT NOT NULL DEFAULT 'Administrative' CHECK (contact_type IN ('Administrative', 'Clinical', 'Caregiver', 'Referral')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fd_contacts_facility ON facility_contacts(facility_id);
CREATE INDEX IF NOT EXISTS idx_fd_contacts_primary ON facility_contacts(facility_id, is_primary);

-- ──────────────────────────────────────────────────────────────
-- Table: facility_notes
-- Append-only timestamped activity log per facility.
-- No update or delete in v1.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities_directory(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'General' CHECK (note_type IN ('General', 'Visit Summary', 'Outreach', 'Partnership', 'Clinical', 'Administrative')),
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fd_notes_facility_date ON facility_notes(facility_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fd_notes_pinned_date ON facility_notes(is_pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_fd_notes_author ON facility_notes(author_id);

-- ──────────────────────────────────────────────────────────────
-- Table: facility_census
-- Point-in-time patient census snapshots per facility.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_census (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities_directory(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  active_patients INTEGER NOT NULL DEFAULT 0,
  new_admissions INTEGER NOT NULL DEFAULT 0,
  discharges INTEGER NOT NULL DEFAULT 0,
  ccm_enrolled INTEGER NOT NULL DEFAULT 0,
  rpm_enrolled INTEGER NOT NULL DEFAULT 0,
  awv_eligible INTEGER NOT NULL DEFAULT 0,
  updated_by UUID NOT NULL REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_fd_census_facility_date ON facility_census(facility_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_fd_census_date ON facility_census(snapshot_date);

-- ──────────────────────────────────────────────────────────────
-- Table: facility_pipeline
-- Status transition audit trail for pipeline tracking.
-- Append-only — no updates or deletes.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities_directory(id) ON DELETE CASCADE,
  from_status TEXT CHECK (from_status IN ('Prospecting', 'Onboarding', 'Active', 'Inactive')),
  to_status TEXT NOT NULL CHECK (to_status IN ('Prospecting', 'Onboarding', 'Active', 'Inactive')),
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fd_pipeline_facility_date ON facility_pipeline(facility_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_fd_pipeline_date ON facility_pipeline(changed_at);

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security Policies
-- Admin role gets full access on all 5 tables.
-- ──────────────────────────────────────────────────────────────

ALTER TABLE facilities_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fd_facilities_directory_admin" ON facilities_directory FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE facility_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fd_facility_contacts_admin" ON facility_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE facility_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fd_facility_notes_admin" ON facility_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE facility_census ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fd_facility_census_admin" ON facility_census FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE facility_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fd_facility_pipeline_admin" ON facility_pipeline FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────────────────────
-- Updated_at trigger for mutable tables
-- Shared function for facilities_directory and facility_contacts
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_fd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fd_facilities_directory_updated_at
  BEFORE UPDATE ON facilities_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_fd_updated_at();

CREATE TRIGGER fd_facility_contacts_updated_at
  BEFORE UPDATE ON facility_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_fd_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Facilities Directory
-- Canonical 14-facility roster from the Mobile Docs dashboard.
-- Realistic Pasadena / San Gabriel Valley addresses.
-- ──────────────────────────────────────────────────────────────
INSERT INTO facilities_directory (
  name, type, status, address_line1, address_line2, city, state, zip,
  latitude, longitude, phone, total_beds, pos_code,
  distance_miles, drive_minutes, visit_cadence, is_archived
) VALUES
  -- Active facilities (8)
  ('Huntington Senior Living', 'SNF', 'Active',
   '100 W California Blvd', NULL, 'Pasadena', 'CA', '91105',
   34.1478120, -118.1445170, '(626) 555-0101', 86, 32,
   1.2, 5, 'Weekly', false),

  ('Elegant Care Villa', 'SNF', 'Active',
   '450 S Lake Ave', 'Suite 100', 'Pasadena', 'CA', '91101',
   34.1399870, -118.1330990, '(626) 555-0102', 65, 32,
   0.8, 4, 'Weekly', false),

  ('Pacific Gardens SNF', 'SNF', 'Active',
   '2200 E Colorado Blvd', NULL, 'Pasadena', 'CA', '91107',
   34.1458560, -118.1028640, '(626) 555-0103', 120, 32,
   3.1, 10, 'Weekly', false),

  ('Sunset Hills SNF', 'SNF', 'Active',
   '1800 N Fair Oaks Ave', NULL, 'Pasadena', 'CA', '91103',
   34.1678230, -118.1490560, '(626) 555-0104', 45, 32,
   2.4, 8, 'Weekly', false),

  ('Valley Board & Care', 'Board & Care', 'Active',
   '315 N Garfield Ave', NULL, 'Pasadena', 'CA', '91101',
   34.1525430, -118.1365780, '(626) 555-0105', 6, 33,
   0.5, 3, 'Biweekly', false),

  ('Rose Hills Board & Care', 'Board & Care', 'Active',
   '820 E Washington Blvd', NULL, 'Pasadena', 'CA', '91104',
   34.1521890, -118.1234560, '(626) 555-0106', 6, 33,
   1.8, 7, 'Biweekly', false),

  ('Golden Oaks Board & Care', 'Board & Care', 'Active',
   '1040 N Allen Ave', NULL, 'Pasadena', 'CA', '91104',
   34.1612340, -118.1267890, '(626) 555-0107', 6, 33,
   2.0, 7, 'Biweekly', false),

  ('Williams Residence', 'Homebound', 'Active',
   '555 S Madison Ave', NULL, 'Pasadena', 'CA', '91106',
   34.1378900, -118.1412340, NULL, NULL, 99,
   1.0, 4, 'Monthly', false),

  -- Prospecting facilities (3)
  ('Rosemead Senior Care', 'SNF', 'Prospecting',
   '3500 Rosemead Blvd', NULL, 'Rosemead', 'CA', '91770',
   34.0635120, -118.0728900, '(626) 555-0201', 78, 32,
   8.5, 18, 'TBD', false),

  ('Arcadia Board & Care', 'Board & Care', 'Prospecting',
   '120 E Duarte Rd', NULL, 'Arcadia', 'CA', '91006',
   34.1394560, -118.0356780, '(626) 555-0202', 6, 33,
   6.2, 14, 'TBD', false),

  ('Chen Residence', 'Homebound', 'Prospecting',
   '780 S San Gabriel Blvd', NULL, 'San Gabriel', 'CA', '91776',
   34.0856780, -118.1023450, NULL, NULL, 99,
   5.4, 12, 'TBD', false),

  -- Onboarding facilities (3)
  ('Park View SNF', 'SNF', 'Onboarding',
   '900 S Fremont Ave', NULL, 'Alhambra', 'CA', '91803',
   34.0878900, -118.1378900, '(626) 555-0301', 55, 32,
   4.8, 12, 'TBD', false),

  ('Magnolia Care Home', 'Board & Care', 'Onboarding',
   '245 W Main St', NULL, 'Alhambra', 'CA', '91801',
   34.0945670, -118.1312340, '(626) 555-0302', 6, 33,
   4.2, 11, 'TBD', false),

  ('Rivera Residence', 'Homebound', 'Onboarding',
   '1200 N Atlantic Blvd', NULL, 'Alhambra', 'CA', '91801',
   34.1012340, -118.1278900, NULL, NULL, 99,
   3.9, 10, 'TBD', false),

  -- Inactive facilities (2)
  ('Alhambra Gardens', 'SNF', 'Inactive',
   '500 S Garfield Ave', NULL, 'Alhambra', 'CA', '91801',
   34.0867890, -118.1345670, '(626) 555-0401', 40, 32,
   4.5, 11, 'TBD', true),

  ('Sierra Vista B&C', 'Board & Care', 'Inactive',
   '330 W Valley Blvd', NULL, 'San Gabriel', 'CA', '91776',
   34.0912340, -118.1056780, '(626) 555-0402', 6, 33,
   5.0, 13, 'TBD', true);

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Facility Contacts
-- One primary contact per facility.
-- ──────────────────────────────────────────────────────────────
INSERT INTO facility_contacts (facility_id, name, role, title, phone, email, is_primary, contact_type)
SELECT fd.id, c.name, c.role, c.title, c.phone, c.email, true, c.contact_type
FROM facilities_directory fd
JOIN (VALUES
  ('Huntington Senior Living',  'Maria Santos',      'DON',                'Director of Nursing',    '(626) 555-1101', 'msantos@huntingtonsl.com',    'Clinical'),
  ('Elegant Care Villa',        'James Park',        'Administrator',      'Facility Administrator', '(626) 555-1102', 'jpark@elegantcare.com',       'Administrative'),
  ('Pacific Gardens SNF',       'Linda Chen',        'DON',                'Director of Nursing',    '(626) 555-1103', 'lchen@pacificgardens.com',    'Clinical'),
  ('Sunset Hills SNF',          'Robert Kim',        'Administrator',      'Executive Director',     '(626) 555-1104', 'rkim@sunsethills.com',        'Administrative'),
  ('Valley Board & Care',       'Patricia Gomez',    'Owner',              'Owner/Operator',         '(626) 555-1105', 'pgomez@valleybc.com',         'Administrative'),
  ('Rose Hills Board & Care',   'David Nguyen',      'Owner',              'Owner/Operator',         '(626) 555-1106', 'dnguyen@rosehillsbc.com',     'Administrative'),
  ('Golden Oaks Board & Care',  'Susan Lee',         'Owner',              'Owner/Operator',         '(626) 555-1107', 'slee@goldenoaksbc.com',       'Administrative'),
  ('Williams Residence',        'Karen Williams',    'Caregiver',          'Family Caregiver',       '(626) 555-1108', 'kwilliams@email.com',         'Caregiver'),
  ('Rosemead Senior Care',      'Tony Reyes',        'Administrator',      'Facility Administrator', '(626) 555-1201', 'treyes@rosemeadsc.com',       'Administrative'),
  ('Arcadia Board & Care',      'Helen Tran',        'Owner',              'Owner/Operator',         '(626) 555-1202', 'htran@arcadiabc.com',         'Administrative'),
  ('Chen Residence',            'Michael Chen',      'Caregiver',          'Son / Primary Caregiver','(626) 555-1203', 'mchen@email.com',             'Caregiver'),
  ('Park View SNF',             'Angela Martinez',   'DON',                'Director of Nursing',    '(626) 555-1301', 'amartinez@parkviewsnf.com',   'Clinical'),
  ('Magnolia Care Home',        'George Huang',      'Owner',              'Owner/Operator',         '(626) 555-1302', 'ghuang@magnoliacare.com',     'Administrative'),
  ('Rivera Residence',          'Carmen Rivera',     'Caregiver',          'Daughter / Caregiver',   '(626) 555-1303', 'crivera@email.com',           'Caregiver'),
  ('Alhambra Gardens',          'Frank Wilson',      'Administrator',      'Former Administrator',   '(626) 555-1401', 'fwilson@alhambragardens.com', 'Administrative'),
  ('Sierra Vista B&C',          'Nancy Yamamoto',    'Owner',              'Former Owner',           '(626) 555-1402', 'nyamamoto@sierravista.com',   'Administrative')
) AS c(facility_name, name, role, title, phone, email, contact_type)
ON fd.name = c.facility_name;

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Facility Census
-- Initial census snapshot for active facilities (2026-03-01).
-- Patient counts match the mock dashboard data.
-- ──────────────────────────────────────────────────────────────
INSERT INTO facility_census (facility_id, snapshot_date, active_patients, new_admissions, discharges, ccm_enrolled, rpm_enrolled, awv_eligible, updated_by)
SELECT fd.id, '2026-03-01'::date, c.active_patients, c.new_admissions, c.discharges, c.ccm_enrolled, c.rpm_enrolled, c.awv_eligible,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
FROM facilities_directory fd
JOIN (VALUES
  ('Huntington Senior Living',  22, 3, 1, 8, 5, 12),
  ('Elegant Care Villa',        18, 2, 1, 6, 4, 10),
  ('Pacific Gardens SNF',       15, 1, 2, 5, 3,  8),
  ('Sunset Hills SNF',           8, 2, 0, 3, 2,  5),
  ('Valley Board & Care',        5, 1, 0, 2, 1,  3),
  ('Rose Hills Board & Care',    4, 0, 0, 2, 1,  3),
  ('Golden Oaks Board & Care',   3, 1, 0, 1, 1,  2),
  ('Williams Residence',         1, 0, 0, 1, 1,  1)
) AS c(facility_name, active_patients, new_admissions, discharges, ccm_enrolled, rpm_enrolled, awv_eligible)
ON fd.name = c.facility_name
WHERE fd.status = 'Active';

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Facility Pipeline
-- Status transition history matching mock pipeline activity.
-- Uses first admin profile as changed_by.
-- ──────────────────────────────────────────────────────────────
INSERT INTO facility_pipeline (facility_id, from_status, to_status, changed_by, change_reason, changed_at)
SELECT fd.id, p.from_status, p.to_status,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  p.change_reason, p.changed_at::timestamptz
FROM facilities_directory fd
JOIN (VALUES
  ('Golden Oaks Board & Care', 'Onboarding',  'Active',      'First patient visit completed',                    '2026-03-10T10:00:00Z'),
  ('Park View SNF',            'Prospecting',  'Onboarding',  'Meeting with DON scheduled',                       '2026-03-07T14:00:00Z'),
  ('Rosemead Senior Care',     NULL,           'Prospecting', 'Initial outreach call — left voicemail',           '2026-03-03T09:00:00Z'),
  ('Sunset Hills SNF',         'Onboarding',  'Active',      '5 initial patients admitted',                      '2026-02-28T11:00:00Z'),
  ('Alhambra Gardens',         'Active',      'Inactive',    'Partnership terminated — all patients discharged', '2026-02-25T16:00:00Z'),
  ('Arcadia Board & Care',     NULL,           'Prospecting', 'Referral from Valley Board & Care owner',          '2026-02-20T10:00:00Z')
) AS p(facility_name, from_status, to_status, change_reason, changed_at)
ON fd.name = p.facility_name;
