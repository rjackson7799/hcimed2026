-- ============================================================
-- Staff Calendar & Time-Off Management
-- Migration: 2026-03-22
-- Module prefix: cal_
-- ============================================================

-- ── Prerequisite: ensure profiles.title column exists ─────────
-- The app types define this column but it may not exist in the DB yet.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title text;

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE time_off_type AS ENUM ('vacation', 'sick', 'personal', 'cme');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied', 'withdrawn');

-- ── Table: cal_staff_schedules ───────────────────────────────
-- Recurring weekly schedule per staff member.

CREATE TABLE cal_staff_schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun, 6=Sat
  is_working  boolean NOT NULL DEFAULT true,
  start_time  time NOT NULL DEFAULT '08:00',
  end_time    time NOT NULL DEFAULT '17:00',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, day_of_week)
);

CREATE INDEX idx_cal_schedules_profile ON cal_staff_schedules (profile_id);

ALTER TABLE cal_staff_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedules"
  ON cal_staff_schedules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert schedules"
  ON cal_staff_schedules FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update schedules"
  ON cal_staff_schedules FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete schedules"
  ON cal_staff_schedules FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Table: cal_time_off_requests ─────────────────────────────
-- Time-off requests with dual-approval workflow.

CREATE TABLE cal_time_off_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id         uuid NOT NULL REFERENCES profiles(id),
  start_date           date NOT NULL,
  end_date             date NOT NULL,
  time_off_type        time_off_type NOT NULL,
  notes                text,
  status               request_status NOT NULL DEFAULT 'pending',
  admin_status         approval_status NOT NULL DEFAULT 'pending',
  admin_reviewed_by    uuid REFERENCES profiles(id),
  admin_reviewed_at    timestamptz,
  admin_notes          text,
  director_status      approval_status NOT NULL DEFAULT 'pending',
  director_reviewed_by uuid REFERENCES profiles(id),
  director_reviewed_at timestamptz,
  director_notes       text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_cal_time_off_dates ON cal_time_off_requests (start_date, end_date);
CREATE INDEX idx_cal_time_off_requester ON cal_time_off_requests (requester_id);

ALTER TABLE cal_time_off_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can view all requests (needed for calendar overlay)
CREATE POLICY "Authenticated users can view time-off requests"
  ON cal_time_off_requests FOR SELECT TO authenticated USING (true);

-- Any authenticated user can submit their own request
CREATE POLICY "Users can create own requests"
  ON cal_time_off_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Admins and Medical Director can update approval columns;
-- Requesters can update their own pending rows (to withdraw)
CREATE POLICY "Users and approvers can update requests"
  ON cal_time_off_requests FOR UPDATE TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND title = 'Medical Director')
  );

-- ── Table: cal_schedule_overrides ────────────────────────────
-- One-off changes to the recurring schedule.

CREATE TABLE cal_schedule_overrides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  override_date date NOT NULL,
  is_working    boolean NOT NULL,
  reason        text,
  created_by    uuid NOT NULL REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, override_date)
);

CREATE INDEX idx_cal_overrides_date ON cal_schedule_overrides (override_date);

ALTER TABLE cal_schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view overrides"
  ON cal_schedule_overrides FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert overrides"
  ON cal_schedule_overrides FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update overrides"
  ON cal_schedule_overrides FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete overrides"
  ON cal_schedule_overrides FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── View: v_cal_time_off_effective ───────────────────────────
-- Centralizes effective status computation.

CREATE OR REPLACE VIEW v_cal_time_off_effective AS
SELECT
  r.*,
  p.full_name AS requester_name,
  p.role AS requester_role,
  p.title AS requester_title,
  CASE
    WHEN r.status = 'withdrawn' THEN 'withdrawn'::text
    WHEN r.admin_status = 'denied' OR r.director_status = 'denied' THEN 'denied'::text
    WHEN r.admin_status = 'approved' AND r.director_status = 'approved' THEN 'approved'::text
    ELSE 'pending'::text
  END AS effective_status
FROM cal_time_off_requests r
JOIN profiles p ON p.id = r.requester_id;

-- ── Trigger: auto-update updated_at ──────────────────────────

CREATE OR REPLACE FUNCTION update_cal_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cal_schedules_updated_at
  BEFORE UPDATE ON cal_staff_schedules
  FOR EACH ROW EXECUTE FUNCTION update_cal_updated_at();

CREATE TRIGGER trg_cal_time_off_updated_at
  BEFORE UPDATE ON cal_time_off_requests
  FOR EACH ROW EXECUTE FUNCTION update_cal_updated_at();
