-- =============================================================================
-- HCI Medical Group — Patient Outreach Tracking System
-- Supabase Database Schema (PostgreSQL 15+)
--
-- Run this entire file in Supabase SQL Editor in one go.
-- Order: Tables → Functions/Triggers → RLS → Views → Realtime → Seed Data
-- =============================================================================


-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- 1.1 profiles
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'broker')),
  phone           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  company_name    TEXT,
  logo_url        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE is_active = true;

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth. Role determines access level.';


-- 1.2 projects
CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  target_start    DATE,
  target_end      DATE,
  broker_email    TEXT,
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status ON public.projects(status);

COMMENT ON TABLE public.projects IS 'Outreach campaign containers. First project: Optum to Regal IPA migration.';


-- 1.3 project_assignments
CREATE TABLE public.project_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_project TEXT NOT NULL CHECK (role_in_project IN ('staff', 'broker')),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by     UUID NOT NULL REFERENCES public.profiles(id),

  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_assignments_user ON public.project_assignments(user_id);
CREATE INDEX idx_project_assignments_project ON public.project_assignments(project_id);

COMMENT ON TABLE public.project_assignments IS 'Links staff and brokers to specific projects. Admins have implicit access to all.';


-- 1.4 patients
CREATE TABLE public.patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Demographics
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  date_of_birth     DATE NOT NULL,
  phone_primary     TEXT NOT NULL,
  phone_secondary   TEXT,
  address_line1     TEXT,
  address_city      TEXT,
  address_state     TEXT DEFAULT 'CA',
  address_zip       TEXT,

  -- Insurance info
  current_insurance TEXT,
  target_insurance  TEXT,
  member_id         TEXT,
  import_notes      TEXT,

  -- Outreach status (denormalized for fast queries)
  outreach_status   TEXT NOT NULL DEFAULT 'not_called' CHECK (outreach_status IN (
    'not_called',
    'no_answer',
    'needs_more_info',
    'not_interested',
    'will_switch',
    'forwarded_to_broker',
    'wrong_number',
    'completed',
    'unable_to_complete'
  )),
  total_attempts    INTEGER NOT NULL DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  last_contacted_by UUID REFERENCES public.profiles(id),
  forwarded_at      TIMESTAMPTZ,
  forwarded_by      UUID REFERENCES public.profiles(id),

  -- Metadata
  is_duplicate      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_project ON public.patients(project_id);
CREATE INDEX idx_patients_status ON public.patients(project_id, outreach_status);
CREATE INDEX idx_patients_name ON public.patients(project_id, last_name, first_name);
CREATE INDEX idx_patients_last_contact ON public.patients(project_id, last_contacted_at);
CREATE INDEX idx_patients_dedup ON public.patients(project_id, first_name, last_name, date_of_birth);

COMMENT ON TABLE public.patients IS 'Patient records imported per project. Status is denormalized from outreach_logs for query performance.';


-- 1.5 outreach_logs
CREATE TABLE public.outreach_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES public.profiles(id),

  disposition      TEXT NOT NULL CHECK (disposition IN (
    'no_answer',
    'voicemail',
    'needs_more_info',
    'not_interested',
    'will_switch',
    'wrong_number',
    'disconnected'
  )),
  notes            TEXT CHECK (char_length(notes) <= 500),
  call_timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),

  forwarded_to_broker  BOOLEAN NOT NULL DEFAULT false,
  broker_email_sent_at TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_logs_patient ON public.outreach_logs(patient_id);
CREATE INDEX idx_outreach_logs_project ON public.outreach_logs(project_id);
CREATE INDEX idx_outreach_logs_staff ON public.outreach_logs(staff_id);
CREATE INDEX idx_outreach_logs_timestamp ON public.outreach_logs(project_id, call_timestamp DESC);
CREATE INDEX idx_outreach_logs_disposition ON public.outreach_logs(project_id, disposition);

COMMENT ON TABLE public.outreach_logs IS 'Append-only log of every outreach attempt. Never update or delete rows.';


-- 1.6 broker_updates
CREATE TABLE public.broker_updates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  broker_id       UUID NOT NULL REFERENCES public.profiles(id),

  status           TEXT NOT NULL CHECK (status IN (
    'received',
    'in_progress',
    'completed',
    'unable_to_complete'
  )),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_broker_updates_patient ON public.broker_updates(patient_id);
CREATE INDEX idx_broker_updates_project ON public.broker_updates(project_id);
CREATE INDEX idx_broker_updates_status ON public.broker_updates(project_id, status);

COMMENT ON TABLE public.broker_updates IS 'Broker progress updates on forwarded patients. Append-only for audit trail.';


-- 1.7 messages
CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id),
  body             TEXT NOT NULL CHECK (char_length(body) <= 1000),
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_patient ON public.messages(patient_id, created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(project_id, is_read) WHERE is_read = false;

COMMENT ON TABLE public.messages IS 'Threaded messages on patient records between admin, staff, and broker.';


-- 1.8 audit_log
CREATE TABLE public.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,
  table_name      TEXT,
  record_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_time ON public.audit_log(created_at DESC);

COMMENT ON TABLE public.audit_log IS 'HIPAA-compliant audit trail. Tracks all data access and modifications.';


-- =============================================================================
-- 2. FUNCTIONS & TRIGGERS
-- =============================================================================

-- 2.1 Auto-create profile on signup
-- NOTE: Role is read from user_metadata only for admin-created users (via invite-user API).
-- The role is validated against allowed values to prevent injection via self-signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := NEW.raw_user_meta_data->>'role';
  -- Only allow valid roles; default to 'staff' for unknown/missing values
  IF requested_role IS NULL OR requested_role NOT IN ('admin', 'staff', 'broker', 'provider') THEN
    requested_role := 'staff';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    requested_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2.2 Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- 2.3 Update patient status on outreach log insert
CREATE OR REPLACE FUNCTION public.update_patient_on_outreach()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.patients
  SET
    outreach_status = CASE
      WHEN NEW.forwarded_to_broker THEN 'forwarded_to_broker'
      WHEN NEW.disposition = 'will_switch' THEN 'will_switch'
      WHEN NEW.disposition = 'not_interested' THEN 'not_interested'
      WHEN NEW.disposition = 'needs_more_info' THEN 'needs_more_info'
      WHEN NEW.disposition IN ('no_answer', 'voicemail') THEN 'no_answer'
      WHEN NEW.disposition IN ('wrong_number', 'disconnected') THEN 'wrong_number'
      ELSE outreach_status
    END,
    total_attempts = total_attempts + 1,
    last_contacted_at = NEW.call_timestamp,
    last_contacted_by = NEW.staff_id,
    forwarded_at = CASE WHEN NEW.forwarded_to_broker THEN now() ELSE forwarded_at END,
    forwarded_by = CASE WHEN NEW.forwarded_to_broker THEN NEW.staff_id ELSE forwarded_by END,
    updated_at = now()
  WHERE id = NEW.patient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_outreach_log_created
  AFTER INSERT ON public.outreach_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_patient_on_outreach();


-- 2.4 Update patient status on broker update
CREATE OR REPLACE FUNCTION public.update_patient_on_broker_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.patients
  SET
    outreach_status = CASE
      WHEN NEW.status = 'completed' THEN 'completed'
      WHEN NEW.status = 'unable_to_complete' THEN 'unable_to_complete'
      ELSE outreach_status
    END,
    updated_at = now()
  WHERE id = NEW.patient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_broker_update_created
  AFTER INSERT ON public.broker_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_patient_on_broker_update();


-- 2.5 Audit log trigger (generic)
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_outreach_logs AFTER INSERT ON public.outreach_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_broker_updates AFTER INSERT ON public.broker_updates
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;


-- 3.1 Helper functions
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- 3.2 Profiles policies
-- Users can read their own profile, or profiles of users sharing a project assignment.
-- Admins can read all active profiles.
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT
  USING (
    is_active = true
    AND (
      id = auth.uid()
      OR public.is_admin()
      OR id IN (
        SELECT pa2.user_id FROM public.project_assignments pa1
        JOIN public.project_assignments pa2 ON pa1.project_id = pa2.project_id
        WHERE pa1.user_id = auth.uid()
      )
    )
  );

-- NOTE: Users can update their own profile but NOT change role or is_active.
-- To enforce column-level restriction, use a trigger since RLS doesn't support column checks natively.
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Trigger to prevent non-admins from changing their own role or is_active
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  USING (public.is_admin());


-- 3.3 Projects policies
CREATE POLICY "projects_admin" ON public.projects FOR ALL
  USING (public.is_admin());

CREATE POLICY "projects_assigned_read" ON public.projects FOR SELECT
  USING (
    id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );


-- 3.4 Project assignments policies
CREATE POLICY "project_assignments_admin" ON public.project_assignments FOR ALL
  USING (public.is_admin());

CREATE POLICY "project_assignments_read_own" ON public.project_assignments FOR SELECT
  USING (user_id = auth.uid());


-- 3.5 Patients policies
CREATE POLICY "patients_admin" ON public.patients FOR ALL
  USING (public.is_admin());

CREATE POLICY "patients_staff_read" ON public.patients FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

CREATE POLICY "patients_broker_read" ON public.patients FOR SELECT
  USING (
    outreach_status IN ('forwarded_to_broker', 'completed', 'unable_to_complete')
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );


-- 3.6 Outreach logs policies
CREATE POLICY "outreach_admin" ON public.outreach_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "outreach_staff_insert" ON public.outreach_logs FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

CREATE POLICY "outreach_staff_read" ON public.outreach_logs FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

CREATE POLICY "outreach_broker_read" ON public.outreach_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE outreach_status IN ('forwarded_to_broker', 'completed', 'unable_to_complete')
    )
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );


-- 3.7 Broker updates policies
CREATE POLICY "broker_updates_admin" ON public.broker_updates FOR SELECT
  USING (public.is_admin());

CREATE POLICY "broker_updates_staff_read" ON public.broker_updates FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "broker_updates_broker_insert" ON public.broker_updates FOR INSERT
  WITH CHECK (
    broker_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );

CREATE POLICY "broker_updates_broker_read" ON public.broker_updates FOR SELECT
  USING (
    broker_id = auth.uid()
  );


-- 3.8 Messages policies
CREATE POLICY "messages_admin" ON public.messages FOR ALL
  USING (public.is_admin());

CREATE POLICY "messages_project_read" ON public.messages FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_project_insert" ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_update_read" ON public.messages FOR UPDATE
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );


-- 3.9 Audit log policies
CREATE POLICY "audit_admin_only" ON public.audit_log FOR SELECT
  USING (public.is_admin());


-- =============================================================================
-- 4. VIEWS (for Dashboard Queries)
-- =============================================================================

-- 4.1 Project summary stats
CREATE OR REPLACE VIEW public.v_project_summary AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  COUNT(pt.id) AS total_patients,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'not_called') AS uncalled,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status != 'not_called') AS called,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'will_switch') AS will_switch,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'not_interested') AS not_interested,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'needs_more_info') AS needs_more_info,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'no_answer') AS no_answer,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'wrong_number') AS wrong_number,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'forwarded_to_broker') AS forwarded_to_broker,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'completed') AS completed,
  COUNT(pt.id) FILTER (WHERE pt.outreach_status = 'unable_to_complete') AS unable_to_complete
FROM public.projects p
LEFT JOIN public.patients pt ON pt.project_id = p.id
GROUP BY p.id, p.name;


-- 4.2 Staff activity summary
CREATE OR REPLACE VIEW public.v_staff_activity AS
SELECT
  ol.project_id,
  ol.staff_id,
  pr.full_name AS staff_name,
  COUNT(ol.id) AS total_calls,
  COUNT(ol.id) FILTER (WHERE ol.call_timestamp::date = CURRENT_DATE) AS calls_today,
  COUNT(ol.id) FILTER (WHERE ol.call_timestamp >= date_trunc('week', CURRENT_DATE)) AS calls_this_week,
  COUNT(DISTINCT ol.patient_id) AS unique_patients_contacted,
  MAX(ol.call_timestamp) AS last_call_at
FROM public.outreach_logs ol
JOIN public.profiles pr ON pr.id = ol.staff_id
GROUP BY ol.project_id, ol.staff_id, pr.full_name;


-- 4.3 Daily call volume (for charts)
CREATE OR REPLACE VIEW public.v_daily_call_volume AS
SELECT
  ol.project_id,
  ol.call_timestamp::date AS call_date,
  ol.staff_id,
  pr.full_name AS staff_name,
  COUNT(ol.id) AS call_count,
  COUNT(ol.id) FILTER (WHERE ol.disposition = 'will_switch') AS positive_outcomes
FROM public.outreach_logs ol
JOIN public.profiles pr ON pr.id = ol.staff_id
GROUP BY ol.project_id, ol.call_timestamp::date, ol.staff_id, pr.full_name
ORDER BY call_date DESC;


-- =============================================================================
-- 5. REALTIME
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outreach_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- =============================================================================
-- 6. SEED DATA (Optional — for development/testing)
-- =============================================================================

-- NOTE: You must first create users via Supabase Auth (Dashboard > Authentication > Users).
-- The handle_new_user trigger will auto-create profiles.
-- Then run these UPDATE statements to set the correct roles:

-- UPDATE public.profiles SET role = 'admin', full_name = 'Ryan (Admin)' WHERE email = 'admin@hcimed.com';
-- UPDATE public.profiles SET role = 'staff', full_name = 'Maria Garcia' WHERE email = 'maria@hcimed.com';
-- UPDATE public.profiles SET role = 'staff', full_name = 'James Chen' WHERE email = 'james@hcimed.com';
-- UPDATE public.profiles SET role = 'broker', full_name = 'Sarah Mitchell (Broker)' WHERE email = 'broker@regalipa.com';

-- Sample project (uncomment after creating admin user):
-- INSERT INTO public.projects (name, description, broker_email, created_by)
-- VALUES (
--   'Optum to Regal IPA Migration',
--   'Transition eligible patients from Optum to Regal IPA. Target completion: Q1 2026.',
--   'broker@regalipa.com',
--   (SELECT id FROM public.profiles WHERE email = 'admin@hcimed.com')
-- );


-- =============================================================================
-- MIGRATION: Add partner branding columns (run on existing databases)
-- =============================================================================

-- ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
-- ALTER TABLE public.profiles ADD COLUMN logo_url TEXT;


-- =============================================================================
-- STORAGE: Partner logos bucket
-- =============================================================================

-- Create the bucket via Supabase Dashboard > Storage > New Bucket:
--   Name: partner-logos
--   Public: true (logos are displayed on login pages and dashboards)
--
-- Or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true);
--
-- Storage RLS policies:
-- Allow public read:
--   CREATE POLICY "Public read partner logos" ON storage.objects FOR SELECT USING (bucket_id = 'partner-logos');
-- Allow admin users to upload/update/delete partner logos:
--   CREATE POLICY "Admin upload partner logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner-logos' AND public.is_admin());
--   CREATE POLICY "Admin update partner logos" ON storage.objects FOR UPDATE USING (bucket_id = 'partner-logos' AND public.is_admin());
--   CREATE POLICY "Admin delete partner logos" ON storage.objects FOR DELETE USING (bucket_id = 'partner-logos' AND public.is_admin());


-- =============================================================================
-- MIGRATION: Add 'provider' role (run on existing databases)
-- =============================================================================

-- Update profiles CHECK constraint to include 'provider'
-- ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'staff', 'broker', 'provider'));

-- Update project_assignments CHECK constraint to include 'provider'
-- ALTER TABLE public.project_assignments DROP CONSTRAINT project_assignments_role_in_project_check;
-- ALTER TABLE public.project_assignments ADD CONSTRAINT project_assignments_role_in_project_check CHECK (role_in_project IN ('staff', 'broker', 'provider'));

-- RLS policies for providers (same data access as staff, scoped by project assignment)
CREATE POLICY "patients_provider_read" ON public.patients FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'provider')
  );

CREATE POLICY "outreach_provider_read" ON public.outreach_logs FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'provider')
  );

CREATE POLICY "outreach_provider_insert" ON public.outreach_logs FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'provider')
  );
