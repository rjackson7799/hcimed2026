-- ============================================================
-- Practice Health Module — Database Migration
-- Creates all ph_ prefixed tables, indexes, and RLS policies.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Table: ph_providers
-- Provider roster with schedule config for FTE normalization
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  npi TEXT,
  role TEXT NOT NULL CHECK (role IN ('physician', 'np', 'pa')),
  employment_type TEXT NOT NULL DEFAULT 'w2' CHECK (employment_type IN ('w2', '1099')),
  scheduled_days_per_week NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  fte NUMERIC(3,2) GENERATED ALWAYS AS (scheduled_days_per_week / 5.0) STORED,
  service_lines TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_facilities
-- Facility registry with POS-to-service-line mapping
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  pos_code INTEGER,
  service_line TEXT NOT NULL CHECK (service_line IN ('hci_office', 'mobile_docs')),
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_rvu_lookup
-- CMS Physician Fee Schedule reference table
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_rvu_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpt_code TEXT NOT NULL,
  description TEXT,
  work_rvu NUMERIC(8,4) NOT NULL DEFAULT 0,
  practice_expense_rvu NUMERIC(8,4) NOT NULL DEFAULT 0,
  malpractice_rvu NUMERIC(8,4) NOT NULL DEFAULT 0,
  total_rvu NUMERIC(8,4) NOT NULL DEFAULT 0,
  conversion_factor NUMERIC(8,4),
  effective_date DATE NOT NULL,
  UNIQUE (cpt_code, effective_date)
);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_uploads
-- Tracks every file upload with metadata and validation status
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_type TEXT NOT NULL CHECK (report_type IN ('371.02', '36.14', '4.06', 'rvu')),
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'success', 'error', 'duplicate')),
  row_count INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  validation_errors JSONB DEFAULT '[]',
  error_message TEXT,
  overwritten_upload_id UUID REFERENCES ph_uploads(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_charges
-- Line-item billing data from Report 371.02
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES ph_uploads(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  claim_date DATE,
  facility TEXT NOT NULL,
  facility_pos INTEGER,
  service_line TEXT NOT NULL CHECK (service_line IN ('hci_office', 'mobile_docs')),
  rendering_provider TEXT NOT NULL,
  provider_id UUID REFERENCES ph_providers(id),
  cpt_code TEXT NOT NULL,
  cpt_description TEXT,
  cpt_group TEXT,
  primary_payer TEXT,
  secondary_payer TEXT,
  icd_codes TEXT[] DEFAULT '{}',
  icd_names TEXT[] DEFAULT '{}',
  billed_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  payer_charge NUMERIC(12,2) DEFAULT 0,
  self_charge NUMERIC(12,2) DEFAULT 0,
  units INTEGER NOT NULL DEFAULT 1,
  modifiers TEXT[] DEFAULT '{}',
  is_billable BOOLEAN NOT NULL DEFAULT true,
  work_rvu NUMERIC(8,4) DEFAULT 0,
  total_rvu NUMERIC(8,4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ph_charges_service_date ON ph_charges(service_date);
CREATE INDEX IF NOT EXISTS idx_ph_charges_provider ON ph_charges(provider_id);
CREATE INDEX IF NOT EXISTS idx_ph_charges_service_line ON ph_charges(service_line);
CREATE INDEX IF NOT EXISTS idx_ph_charges_upload ON ph_charges(upload_id);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_collections
-- Financial summary data from Report 36.14
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES ph_uploads(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  facility TEXT NOT NULL,
  service_line TEXT NOT NULL CHECK (service_line IN ('hci_office', 'mobile_docs')),
  charges NUMERIC(12,2) DEFAULT 0,
  payer_charges NUMERIC(12,2) DEFAULT 0,
  self_charges NUMERIC(12,2) DEFAULT 0,
  payments NUMERIC(12,2) DEFAULT 0,
  payer_payments NUMERIC(12,2) DEFAULT 0,
  patient_payments NUMERIC(12,2) DEFAULT 0,
  contractual_adj NUMERIC(12,2) DEFAULT 0,
  payer_withheld NUMERIC(12,2) DEFAULT 0,
  writeoffs NUMERIC(12,2) DEFAULT 0,
  refunds NUMERIC(12,2) DEFAULT 0,
  claim_count INTEGER DEFAULT 0,
  patient_count INTEGER DEFAULT 0,
  ar_change NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ph_collections_period ON ph_collections(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ph_collections_upload ON ph_collections(upload_id);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_productivity
-- Appointment-level operational data from Report 4.06
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_productivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES ph_uploads(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  facility TEXT NOT NULL,
  service_line TEXT NOT NULL CHECK (service_line IN ('hci_office', 'mobile_docs')),
  rendering_provider TEXT,
  provider_id UUID REFERENCES ph_providers(id),
  visit_type TEXT,
  visit_status TEXT NOT NULL,
  is_televisit BOOLEAN DEFAULT false,
  scheduled_duration_min INTEGER,
  actual_duration_min INTEGER,
  variance_min INTEGER,
  wait_time_min INTEGER,
  clinician_time_min INTEGER,
  appointment_start_time TIME,
  appointment_end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ph_productivity_date ON ph_productivity(appointment_date);
CREATE INDEX IF NOT EXISTS idx_ph_productivity_provider ON ph_productivity(provider_id);
CREATE INDEX IF NOT EXISTS idx_ph_productivity_upload ON ph_productivity(upload_id);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_kpi_daily
-- Calculated daily KPI snapshots for fast dashboard rendering
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_kpi_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  provider_id UUID REFERENCES ph_providers(id),
  service_line TEXT CHECK (service_line IN ('hci_office', 'mobile_docs', 'all')),
  -- Volume
  visits INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  televisits INTEGER DEFAULT 0,
  new_patients INTEGER DEFAULT 0,
  established_patients INTEGER DEFAULT 0,
  -- Financial
  billed_amount NUMERIC(12,2) DEFAULT 0,
  est_collections NUMERIC(12,2) DEFAULT 0,
  revenue_per_visit NUMERIC(10,2) DEFAULT 0,
  -- Productivity
  rvu_total NUMERIC(10,4) DEFAULT 0,
  wrvu_total NUMERIC(10,4) DEFAULT 0,
  avg_visit_duration_min NUMERIC(6,2) DEFAULT 0,
  avg_wait_time_min NUMERIC(6,2) DEFAULT 0,
  avg_clinician_time_min NUMERIC(6,2) DEFAULT 0,
  schedule_utilization NUMERIC(5,2) DEFAULT 0,
  -- Clinical
  avg_diagnoses_per_encounter NUMERIC(4,2) DEFAULT 0,
  quality_code_encounters INTEGER DEFAULT 0,
  total_encounters INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, provider_id, service_line)
);

CREATE INDEX IF NOT EXISTS idx_ph_kpi_daily_date ON ph_kpi_daily(date);
CREATE INDEX IF NOT EXISTS idx_ph_kpi_daily_provider ON ph_kpi_daily(provider_id);

-- ──────────────────────────────────────────────────────────────
-- Table: ph_ai_insights
-- Cached AI-generated insights from Claude API
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ph_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_date DATE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily_summary', 'recommendation', 'trend', 'alert')),
  service_line TEXT,
  category TEXT CHECK (category IN ('productivity', 'revenue', 'coding', 'efficiency')),
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  narrative TEXT NOT NULL,
  supporting_data JSONB,
  generated_by_upload_id UUID REFERENCES ph_uploads(id),
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ph_ai_insights_date ON ph_ai_insights(insight_date);
CREATE INDEX IF NOT EXISTS idx_ph_ai_insights_type ON ph_ai_insights(insight_type);

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security Policies
-- Admin role (includes Medical Director) gets full access.
-- All other roles get no access (no policy = no rows returned).
-- ──────────────────────────────────────────────────────────────

ALTER TABLE ph_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_providers_admin" ON ph_providers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_facilities_admin" ON ph_facilities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_rvu_lookup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_rvu_lookup_admin" ON ph_rvu_lookup FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_uploads_admin" ON ph_uploads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_charges_admin" ON ph_charges FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_collections_admin" ON ph_collections FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_productivity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_productivity_admin" ON ph_productivity FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_kpi_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_kpi_daily_admin" ON ph_kpi_daily FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE ph_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ph_ai_insights_admin" ON ph_ai_insights FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ──────────────────────────────────────────────────────────────
-- Updated_at trigger for ph_providers
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_ph_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ph_providers_updated_at
  BEFORE UPDATE ON ph_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_ph_providers_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Providers
-- ──────────────────────────────────────────────────────────────
INSERT INTO ph_providers (name, normalized_name, role, employment_type, scheduled_days_per_week, service_lines, is_active) VALUES
  ('Medical Director', 'Medical Director', 'physician', 'w2', 5.0, ARRAY['hci_office'], true),
  ('NP 1', 'NP 1', 'np', 'w2', 3.0, ARRAY['hci_office'], true),
  ('NP 2', 'NP 2', 'np', 'w2', 3.0, ARRAY['hci_office', 'mobile_docs'], true);

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Facilities
-- ──────────────────────────────────────────────────────────────
INSERT INTO ph_facilities (name, normalized_name, pos_code, service_line, address, is_active) VALUES
  ('HCI Medical Group', 'hci medical group', 11, 'hci_office', 'Pasadena, CA 91101', true),
  ('Elegant Care Villa', 'elegant care villa', 33, 'mobile_docs', NULL, true),
  ('Home Visit', 'home visit', 99, 'mobile_docs', NULL, true);

-- ──────────────────────────────────────────────────────────────
-- Seed Data: Common Internal Medicine RVU Values (2026 CMS PFS)
-- Admin can upload full CMS CSV later via the RVU upload endpoint.
-- ──────────────────────────────────────────────────────────────
INSERT INTO ph_rvu_lookup (cpt_code, description, work_rvu, practice_expense_rvu, malpractice_rvu, total_rvu, conversion_factor, effective_date) VALUES
  -- E/M Office Visits (Established)
  ('99211', 'Office visit, est, minimal', 0.18, 0.47, 0.02, 0.67, 33.89, '2026-01-01'),
  ('99212', 'Office visit, est, straightforward', 0.70, 0.93, 0.06, 1.69, 33.89, '2026-01-01'),
  ('99213', 'Office visit, est, low complexity', 1.30, 1.39, 0.10, 2.79, 33.89, '2026-01-01'),
  ('99214', 'Office visit, est, moderate complexity', 1.92, 1.76, 0.14, 3.82, 33.89, '2026-01-01'),
  ('99215', 'Office visit, est, high complexity', 2.80, 2.31, 0.19, 5.30, 33.89, '2026-01-01'),
  -- E/M Office Visits (New)
  ('99202', 'Office visit, new, straightforward', 0.93, 1.12, 0.07, 2.12, 33.89, '2026-01-01'),
  ('99203', 'Office visit, new, low complexity', 1.60, 1.56, 0.11, 3.27, 33.89, '2026-01-01'),
  ('99204', 'Office visit, new, moderate complexity', 2.60, 2.14, 0.17, 4.91, 33.89, '2026-01-01'),
  ('99205', 'Office visit, new, high complexity', 3.50, 2.71, 0.22, 6.43, 33.89, '2026-01-01'),
  -- Home Visit Codes (Mobile Docs)
  ('99341', 'Home visit, new, low complexity', 1.00, 1.08, 0.10, 2.18, 33.89, '2026-01-01'),
  ('99342', 'Home visit, new, moderate complexity', 1.52, 1.50, 0.14, 3.16, 33.89, '2026-01-01'),
  ('99343', 'Home visit, new, high complexity', 2.35, 2.11, 0.20, 4.66, 33.89, '2026-01-01'),
  ('99344', 'Home visit, new, complex/comprehensive', 3.23, 2.65, 0.26, 6.14, 33.89, '2026-01-01'),
  ('99345', 'Home visit, new, highly complex', 4.00, 3.16, 0.32, 7.48, 33.89, '2026-01-01'),
  ('99347', 'Home visit, est, straightforward', 0.76, 0.90, 0.07, 1.73, 33.89, '2026-01-01'),
  ('99348', 'Home visit, est, low/moderate', 1.30, 1.33, 0.12, 2.75, 33.89, '2026-01-01'),
  ('99349', 'Home visit, est, moderate/high', 1.95, 1.80, 0.17, 3.92, 33.89, '2026-01-01'),
  ('99350', 'Home visit, est, high/complex', 2.50, 2.19, 0.22, 4.91, 33.89, '2026-01-01'),
  -- Nursing Facility / SNF Codes
  ('99304', 'Initial nursing facility care, low', 1.50, 1.39, 0.14, 3.03, 33.89, '2026-01-01'),
  ('99305', 'Initial nursing facility care, moderate', 2.50, 1.95, 0.20, 4.65, 33.89, '2026-01-01'),
  ('99306', 'Initial nursing facility care, high', 3.50, 2.59, 0.28, 6.37, 33.89, '2026-01-01'),
  ('99307', 'Subsequent nursing facility, straightfwd', 0.75, 0.70, 0.06, 1.51, 33.89, '2026-01-01'),
  ('99308', 'Subsequent nursing facility, low', 1.11, 1.00, 0.09, 2.20, 33.89, '2026-01-01'),
  ('99309', 'Subsequent nursing facility, moderate', 1.50, 1.27, 0.12, 2.89, 33.89, '2026-01-01'),
  ('99310', 'Subsequent nursing facility, high', 2.00, 1.61, 0.16, 3.77, 33.89, '2026-01-01'),
  -- Chronic Care Management (CCM)
  ('99490', 'CCM, 20+ min/month', 0.61, 1.32, 0.05, 1.98, 33.89, '2026-01-01'),
  ('99491', 'CCM, 30+ min/month, physician-directed', 1.00, 1.66, 0.07, 2.73, 33.89, '2026-01-01'),
  -- Remote Patient Monitoring (RPM)
  ('99453', 'RPM setup, device supply/education', 0.00, 1.10, 0.02, 1.12, 33.89, '2026-01-01'),
  ('99454', 'RPM device supply, daily recording', 0.00, 3.03, 0.05, 3.08, 33.89, '2026-01-01'),
  ('99457', 'RPM management, first 20 min', 0.50, 1.04, 0.04, 1.58, 33.89, '2026-01-01'),
  ('99458', 'RPM management, add''l 20 min', 0.48, 0.72, 0.04, 1.24, 33.89, '2026-01-01'),
  -- Annual Wellness Visit
  ('G0438', 'Initial AWV, Welcome to Medicare', 2.43, 2.43, 0.18, 5.04, 33.89, '2026-01-01'),
  ('G0439', 'Subsequent AWV', 1.50, 1.84, 0.11, 3.45, 33.89, '2026-01-01'),
  -- Transitional Care Management
  ('99495', 'TCM, moderate complexity, 14-day f/u', 2.11, 1.79, 0.15, 4.05, 33.89, '2026-01-01'),
  ('99496', 'TCM, high complexity, 7-day f/u', 3.05, 2.16, 0.20, 5.41, 33.89, '2026-01-01'),
  -- Modifier 25 (Separate E/M on same day as procedure — no RVU change, tracked for reference)
  -- Quality / MIPS G-codes (non-billable, $0 charges)
  ('G2211', 'Visit complexity inherent to E/M', 0.33, 0.43, 0.03, 0.79, 33.89, '2026-01-01');
