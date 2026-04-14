-- AWV Tracker Module — Database Migration
-- Tables for Annual Wellness Visit tracking: patients, tracking, uploads, rates, add-ons
-- Run after existing portal tables are in place.

-- ─── awv_patients ─────────────────────────────────────────────────
-- Minimal PHI: eCW patient ID + last name only. No first name, DOB, or SSN.

CREATE TABLE IF NOT EXISTS awv_patients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL DEFAULT auth.uid(),
  ecw_patient_id text NOT NULL,
  last_name     text NOT NULL,
  medicare_status text NOT NULL DEFAULT 'Unknown'
    CHECK (medicare_status IN ('Active', 'Inactive', 'Unknown')),
  payer_name    text,
  service_line  text NOT NULL DEFAULT 'HCI Office'
    CHECK (service_line IN ('HCI Office', 'Mobile Docs')),
  facility_id   text,
  assigned_provider_id text NOT NULL,
  last_awv_date date,
  last_awv_type text CHECK (last_awv_type IN ('IPPE', 'Initial AWV', 'Subsequent AWV')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ecw_patient_id)
);

CREATE INDEX idx_awv_patients_ecw ON awv_patients (ecw_patient_id);
CREATE INDEX idx_awv_patients_provider ON awv_patients (assigned_provider_id);
CREATE INDEX idx_awv_patients_service_line ON awv_patients (service_line);

-- ─── awv_tracking ─────────────────────────────────────────────────
-- One row per eligibility cycle per patient. Rolling 12-month window.

CREATE TABLE IF NOT EXISTS awv_tracking (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          uuid NOT NULL REFERENCES awv_patients(id) ON DELETE CASCADE,
  eligibility_status  text NOT NULL DEFAULT 'Pending Review'
    CHECK (eligibility_status IN ('Pending Review', 'Eligible', 'Not Eligible')),
  eligibility_reason  text,
  completion_status   text NOT NULL DEFAULT 'Not Started'
    CHECK (completion_status IN ('Not Started', 'Scheduled', 'Completed', 'Refused', 'Unable to Complete')),
  scheduled_date      date,
  completion_date     date,
  awv_type            text CHECK (awv_type IN ('IPPE', 'Initial AWV', 'Subsequent AWV')),
  cpt_code            text CHECK (cpt_code IN ('G0402', 'G0438', 'G0439')),
  billed_amount       numeric(10,2),
  last_awv_date       date,
  next_eligible_date  date,
  date_source         text NOT NULL DEFAULT 'Manual'
    CHECK (date_source IN ('Manual', 'Upload', 'PHM Auto')),
  notes               text,
  updated_by          uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_awv_tracking_patient ON awv_tracking (patient_id);
CREATE INDEX idx_awv_tracking_eligibility ON awv_tracking (eligibility_status);
CREATE INDEX idx_awv_tracking_completion ON awv_tracking (completion_status);
CREATE INDEX idx_awv_tracking_next_eligible ON awv_tracking (next_eligible_date);

-- ─── awv_uploads ──────────────────────────────────────────────────
-- Tracks CSV upload history for audit trail.

CREATE TABLE IF NOT EXISTS awv_uploads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL DEFAULT auth.uid(),
  uploaded_by       uuid NOT NULL,
  upload_date       timestamptz NOT NULL DEFAULT now(),
  file_name         text NOT NULL,
  status            text NOT NULL DEFAULT 'Processing'
    CHECK (status IN ('Processing', 'Completed', 'Completed with Warnings', 'Failed')),
  row_count         int,
  new_patients      int NOT NULL DEFAULT 0,
  updated_patients  int NOT NULL DEFAULT 0,
  flagged_patients  int NOT NULL DEFAULT 0,
  validation_errors jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_awv_uploads_uploaded_by ON awv_uploads (uploaded_by);

-- ─── awv_reimbursement_rates ──────────────────────────────────────
-- Default reimbursement amounts per CPT code. Admin-editable.

CREATE TABLE IF NOT EXISTS awv_reimbursement_rates (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpt_code                text NOT NULL UNIQUE,
  description             text NOT NULL,
  expected_reimbursement  numeric(10,2) NOT NULL,
  effective_date          date NOT NULL DEFAULT now(),
  is_current              boolean NOT NULL DEFAULT true
);

-- Seed default rates
INSERT INTO awv_reimbursement_rates (cpt_code, description, expected_reimbursement) VALUES
  ('G0402', 'IPPE', 175.00),
  ('G0438', 'Initial AWV', 270.00),
  ('G0439', 'Subsequent AWV', 175.00)
ON CONFLICT (cpt_code) DO NOTHING;

-- ─── awv_addons ───────────────────────────────────────────────────
-- Additional services performed during an AWV (ACP, CCM, cognitive, etc.)

CREATE TABLE IF NOT EXISTS awv_addons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id   uuid NOT NULL REFERENCES awv_tracking(id) ON DELETE CASCADE,
  cpt_code      text NOT NULL,
  description   text NOT NULL,
  billed_amount numeric(10,2),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_awv_addons_tracking ON awv_addons (tracking_id);

-- ─── Row-Level Security ───────────────────────────────────────────

ALTER TABLE awv_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE awv_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE awv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE awv_reimbursement_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE awv_addons ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all AWV data (filtered by app logic / role guard)
CREATE POLICY awv_patients_select ON awv_patients FOR SELECT TO authenticated USING (true);
CREATE POLICY awv_tracking_select ON awv_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY awv_uploads_select ON awv_uploads FOR SELECT TO authenticated USING (true);
CREATE POLICY awv_rates_select ON awv_reimbursement_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY awv_addons_select ON awv_addons FOR SELECT TO authenticated USING (true);

-- Only admin and staff can insert/update AWV data
CREATE POLICY awv_patients_insert ON awv_patients FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY awv_patients_update ON awv_patients FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY awv_tracking_insert ON awv_tracking FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));
CREATE POLICY awv_tracking_update ON awv_tracking FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY awv_uploads_insert ON awv_uploads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Only admin can modify reimbursement rates
CREATE POLICY awv_rates_insert ON awv_reimbursement_rates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY awv_rates_update ON awv_reimbursement_rates FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY awv_addons_insert ON awv_addons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- ─── Updated-at triggers ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_awv_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_awv_patients_updated_at
  BEFORE UPDATE ON awv_patients
  FOR EACH ROW EXECUTE FUNCTION update_awv_updated_at();

CREATE TRIGGER set_awv_tracking_updated_at
  BEFORE UPDATE ON awv_tracking
  FOR EACH ROW EXECUTE FUNCTION update_awv_updated_at();
