/**
 * Manual type stubs matching the Supabase schema from docs/02-Database-Schema-HCI-Outreach.md
 * These should be regenerated from Supabase once the database is live:
 *   npx supabase gen types typescript --project-id <id> > src/portal/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      project_assignments: {
        Row: ProjectAssignment;
        Insert: Omit<ProjectAssignment, 'id' | 'assigned_at'>;
        Update: Partial<Omit<ProjectAssignment, 'id'>>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'outreach_status' | 'total_attempts' | 'is_duplicate' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Patient, 'id' | 'created_at'>>;
      };
      outreach_logs: {
        Row: OutreachLog;
        Insert: Omit<OutreachLog, 'id' | 'created_at'>;
        Update: never; // Append-only table
      };
      broker_updates: {
        Row: BrokerUpdate;
        Insert: Omit<BrokerUpdate, 'id' | 'created_at'>;
        Update: never; // Append-only table
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'is_read' | 'created_at'>;
        Update: Partial<Pick<Message, 'is_read'>>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never; // Append-only table
      };
    };
    Views: {
      v_project_summary: {
        Row: ProjectSummary;
      };
      v_staff_activity: {
        Row: StaffActivity;
      };
      v_daily_call_volume: {
        Row: DailyCallVolume;
      };
    };
  };
}

// Table row types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'broker';
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed' | 'archived';
  target_start: string | null;
  target_end: string | null;
  broker_email: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: 'staff' | 'broker';
  assigned_at: string;
  assigned_by: string;
}

export interface Patient {
  id: string;
  project_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_primary: string;
  phone_secondary: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  current_insurance: string | null;
  target_insurance: string | null;
  member_id: string | null;
  import_notes: string | null;
  outreach_status: 'not_called' | 'no_answer' | 'needs_more_info' | 'not_interested' | 'will_switch' | 'forwarded_to_broker' | 'wrong_number' | 'completed' | 'unable_to_complete';
  total_attempts: number;
  last_contacted_at: string | null;
  last_contacted_by: string | null;
  forwarded_at: string | null;
  forwarded_by: string | null;
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutreachLog {
  id: string;
  patient_id: string;
  project_id: string;
  staff_id: string;
  disposition: 'no_answer' | 'voicemail' | 'needs_more_info' | 'not_interested' | 'will_switch' | 'wrong_number' | 'disconnected';
  notes: string | null;
  call_timestamp: string;
  forwarded_to_broker: boolean;
  broker_email_sent_at: string | null;
  created_at: string;
}

export interface BrokerUpdate {
  id: string;
  patient_id: string;
  project_id: string;
  broker_id: string;
  status: 'received' | 'in_progress' | 'completed' | 'unable_to_complete';
  notes: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  patient_id: string;
  project_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// View types
export interface ProjectSummary {
  project_id: string;
  project_name: string;
  total_patients: number;
  uncalled: number;
  called: number;
  will_switch: number;
  not_interested: number;
  needs_more_info: number;
  no_answer: number;
  wrong_number: number;
  forwarded_to_broker: number;
  completed: number;
  unable_to_complete: number;
}

export interface StaffActivity {
  project_id: string;
  staff_id: string;
  staff_name: string;
  total_calls: number;
  calls_today: number;
  calls_this_week: number;
  unique_patients_contacted: number;
  last_call_at: string | null;
}

export interface DailyCallVolume {
  project_id: string;
  call_date: string;
  staff_id: string;
  staff_name: string;
  call_count: number;
  positive_outcomes: number;
}
