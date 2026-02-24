# Database Schema
## HCI Medical Group — Patient Outreach Tracking System

**Version:** 1.0  
**Date:** February 24, 2026  
**Database:** Supabase (PostgreSQL 15+)  
**Auth:** Supabase Auth with custom claims  

---

## 1. Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEMA: public                            │
│                                                             │
│  profiles ──┐                                               │
│             ├──> project_assignments ──> projects            │
│             │                              │                │
│             │                              ▼                │
│             ├──> outreach_logs ──────> patients              │
│             │                              │                │
│             └──> broker_updates ───────────┘                │
│                                                             │
│  audit_log (tracks all mutations)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tables

### 2.1 `profiles`
Extends Supabase Auth users with application-specific data. Created automatically via trigger on `auth.users` insert.

```sql
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'broker')),
  phone           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE is_active = true;

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth. Role determines access level.';
```

### 2.2 `projects`
Top-level container for outreach campaigns. Designed for multi-project support from day one.

```sql
CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  target_start    DATE,
  target_end      DATE,
  broker_email    TEXT,                    -- Default email for broker forwarding
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status ON public.projects(status);

COMMENT ON TABLE public.projects IS 'Outreach campaign containers. First project: Optum to Regal IPA migration.';
```

### 2.3 `project_assignments`
Maps users (staff/broker) to projects they can access.

```sql
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
```

### 2.4 `patients`
Patient records imported via CSV upload. Scoped to a project.

```sql
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
  current_insurance TEXT,                  -- e.g., "Optum"
  target_insurance  TEXT,                  -- e.g., "Regal IPA"
  member_id         TEXT,
  import_notes      TEXT,                  -- Notes from CSV import

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
  is_duplicate      BOOLEAN NOT NULL DEFAULT false,  -- Flagged during import
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_patients_project ON public.patients(project_id);
CREATE INDEX idx_patients_status ON public.patients(project_id, outreach_status);
CREATE INDEX idx_patients_name ON public.patients(project_id, last_name, first_name);
CREATE INDEX idx_patients_last_contact ON public.patients(project_id, last_contacted_at);

-- Duplicate detection
CREATE INDEX idx_patients_dedup ON public.patients(project_id, first_name, last_name, date_of_birth);

COMMENT ON TABLE public.patients IS 'Patient records imported per project. Status is denormalized from outreach_logs for query performance.';
```

### 2.5 `outreach_logs`
Immutable log of every outreach attempt. This is the audit trail.

```sql
CREATE TABLE public.outreach_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES public.profiles(id),

  -- Call details
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

  -- Broker forwarding (populated if forwarded)
  forwarded_to_broker  BOOLEAN NOT NULL DEFAULT false,
  broker_email_sent_at TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- This table is append-only; no updates or deletes in application code
CREATE INDEX idx_outreach_logs_patient ON public.outreach_logs(patient_id);
CREATE INDEX idx_outreach_logs_project ON public.outreach_logs(project_id);
CREATE INDEX idx_outreach_logs_staff ON public.outreach_logs(staff_id);
CREATE INDEX idx_outreach_logs_timestamp ON public.outreach_logs(project_id, call_timestamp DESC);
CREATE INDEX idx_outreach_logs_disposition ON public.outreach_logs(project_id, disposition);

COMMENT ON TABLE public.outreach_logs IS 'Append-only log of every outreach attempt. Never update or delete rows.';
```

### 2.6 `broker_updates`
Broker-side status tracking for forwarded patients.

```sql
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
```

### 2.7 `messages`
Simple comment-thread messaging between broker/staff/admin on a patient.

```sql
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
```

### 2.8 `audit_log`
System-wide audit trail for HIPAA compliance.

```sql
CREATE TABLE public.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,            -- 'create', 'update', 'delete', 'login', 'export', 'forward_to_broker'
  table_name      TEXT,
  record_id       UUID,
  old_values      JSONB,                    -- Previous state (for updates)
  new_values      JSONB,                    -- New state
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_time ON public.audit_log(created_at DESC);

COMMENT ON TABLE public.audit_log IS 'HIPAA-compliant audit trail. Tracks all data access and modifications.';
```

---

## 3. Functions & Triggers

### 3.1 Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.2 Update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 3.3 Update patient status on outreach log insert

```sql
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
```

### 3.4 Update patient status on broker update

```sql
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
```

### 3.5 Audit log trigger (generic)

```sql
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

-- Apply to PHI-containing tables
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_outreach_logs AFTER INSERT ON public.outreach_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
CREATE TRIGGER audit_broker_updates AFTER INSERT ON public.broker_updates
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
```

---

## 4. Row Level Security (RLS) Policies

**CRITICAL:** Enable RLS on all tables. All queries go through Supabase client which respects RLS.

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
```

### 4.1 Helper function

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 4.2 Profiles policies

```sql
-- Everyone can read active profiles (for display names in UI)
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT
  USING (is_active = true);

-- Users can update their own profile (name, phone)
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (role changes, deactivation)
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  USING (public.is_admin());
```

### 4.3 Projects policies

```sql
-- Admins: full access
CREATE POLICY "projects_admin" ON public.projects FOR ALL
  USING (public.is_admin());

-- Staff/Broker: read only assigned projects
CREATE POLICY "projects_assigned_read" ON public.projects FOR SELECT
  USING (
    id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );
```

### 4.4 Patients policies

```sql
-- Admins: full access
CREATE POLICY "patients_admin" ON public.patients FOR ALL
  USING (public.is_admin());

-- Staff: read patients in assigned projects
CREATE POLICY "patients_staff_read" ON public.patients FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

-- Broker: read only forwarded patients in assigned projects
CREATE POLICY "patients_broker_read" ON public.patients FOR SELECT
  USING (
    outreach_status IN ('forwarded_to_broker', 'completed', 'unable_to_complete')
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );
```

### 4.5 Outreach logs policies

```sql
-- Admins: read all
CREATE POLICY "outreach_admin" ON public.outreach_logs FOR SELECT
  USING (public.is_admin());

-- Staff: insert own logs + read logs for assigned projects
CREATE POLICY "outreach_staff_insert" ON public.outreach_logs FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

CREATE POLICY "outreach_staff_read" ON public.outreach_logs FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'staff')
  );

-- Broker: read logs for forwarded patients only
CREATE POLICY "outreach_broker_read" ON public.outreach_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE outreach_status IN ('forwarded_to_broker', 'completed', 'unable_to_complete')
    )
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );
```

### 4.6 Broker updates policies

```sql
-- Admins: read all
CREATE POLICY "broker_updates_admin" ON public.broker_updates FOR SELECT
  USING (public.is_admin());

-- Staff: read updates for their project patients
CREATE POLICY "broker_updates_staff_read" ON public.broker_updates FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
  );

-- Broker: insert own updates + read own
CREATE POLICY "broker_updates_broker_insert" ON public.broker_updates FOR INSERT
  WITH CHECK (
    broker_id = auth.uid()
    AND project_id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid() AND role_in_project = 'broker')
  );

CREATE POLICY "broker_updates_broker_read" ON public.broker_updates FOR SELECT
  USING (
    broker_id = auth.uid()
  );
```

### 4.7 Audit log policies

```sql
-- Only admins can read audit logs
CREATE POLICY "audit_admin_only" ON public.audit_log FOR SELECT
  USING (public.is_admin());
```

---

## 5. Views (for Dashboard Queries)

### 5.1 Project summary stats

```sql
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
```

### 5.2 Staff activity summary

```sql
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
```

### 5.3 Daily call volume (for charts)

```sql
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
```

---

## 6. Seed Data (for Development)

```sql
-- Admin user (created via Supabase Auth, then profile auto-created by trigger)
-- After auth signup, update role:
UPDATE public.profiles SET role = 'admin', full_name = 'Ryan (Admin)' WHERE email = 'admin@hcimed.com';

-- Staff users
UPDATE public.profiles SET role = 'staff', full_name = 'Maria Garcia' WHERE email = 'maria@hcimed.com';
UPDATE public.profiles SET role = 'staff', full_name = 'James Chen' WHERE email = 'james@hcimed.com';

-- Broker user
UPDATE public.profiles SET role = 'broker', full_name = 'Sarah Mitchell (Broker)' WHERE email = 'broker@regalipa.com';

-- Create first project
INSERT INTO public.projects (id, name, description, broker_email, created_by)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Optum to Regal IPA Migration',
  'Transition eligible patients from Optum to Regal IPA. Target completion: Q1 2026.',
  'broker@regalipa.com',
  (SELECT id FROM public.profiles WHERE email = 'admin@hcimed.com')
);

-- Sample patients (would normally come from CSV upload)
INSERT INTO public.patients (project_id, first_name, last_name, date_of_birth, phone_primary, current_insurance, target_insurance, member_id) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dorothy', 'Williams', '1942-03-15', '(626) 555-0101', 'Optum', 'Regal IPA', 'OPT-001234'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Robert', 'Johnson', '1938-07-22', '(626) 555-0102', 'Optum', 'Regal IPA', 'OPT-001235'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Margaret', 'Chen', '1945-11-08', '(626) 555-0103', 'Optum', 'Regal IPA', 'OPT-001236'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'James', 'Martinez', '1940-01-30', '(626) 555-0104', 'Optum', 'Regal IPA', 'OPT-001237'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Helen', 'Davis', '1935-09-12', '(626) 555-0105', 'Optum', 'Regal IPA', 'OPT-001238');
```

---

## 7. Supabase Realtime Configuration

Enable realtime subscriptions for live dashboard updates:

```sql
-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outreach_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

**Client subscription pattern:**
```typescript
// Subscribe to patient status changes for live dashboard
supabase
  .channel('patients-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'patients',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    // Update dashboard state
  })
  .subscribe();
```

---

## 8. Edge Functions

### 8.1 `send-broker-email`
Triggered when staff forwards a patient to the broker.

```
POST /functions/v1/send-broker-email
Body: { patient_id, project_id, staff_id }

1. Fetch patient record + all outreach_logs for patient
2. Fetch project.broker_email
3. Fetch staff profile name
4. Compose email with patient details + outreach history
5. Send via Resend API
6. Update outreach_log.broker_email_sent_at
7. Log to audit_log
```

### 8.2 `import-patients-csv`
Processes uploaded CSV and inserts patient records.

```
POST /functions/v1/import-patients-csv
Body: { project_id, csv_data (base64 or text) }

1. Parse CSV rows
2. Validate required fields (first_name, last_name, dob, phone)
3. Check for duplicates (name + DOB within project)
4. Insert valid rows, flag duplicates
5. Return summary: { inserted, duplicates, errors[] }
```

---

## 9. Migration Notes

- Run all SQL in order: tables → functions/triggers → RLS → views
- Create Supabase Auth users first, then profile trigger auto-creates profiles
- Manually update admin role after first signup
- Enable Realtime on listed tables via Supabase dashboard or SQL
- Edge Functions deploy via `supabase functions deploy`
