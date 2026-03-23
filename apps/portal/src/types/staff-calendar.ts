// ─── Staff Calendar Module Types ─────────────────────────────

export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'cme';
export type ApprovalStatus = 'pending' | 'approved' | 'denied';
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'withdrawn';

export interface CalStaffSchedule {
  id: string;
  profile_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  is_working: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CalStaffScheduleWithProfile extends CalStaffSchedule {
  profiles: {
    full_name: string;
    role: string;
    title: string | null;
  };
}

export interface CalTimeOffRequest {
  id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  time_off_type: TimeOffType;
  notes: string | null;
  status: RequestStatus;
  admin_status: ApprovalStatus;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  admin_notes: string | null;
  director_status: ApprovalStatus;
  director_reviewed_by: string | null;
  director_reviewed_at: string | null;
  director_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Row from the v_cal_time_off_effective view */
export interface CalTimeOffEffective extends CalTimeOffRequest {
  requester_name: string;
  requester_role: string;
  requester_title: string | null;
  effective_status: 'pending' | 'approved' | 'denied' | 'withdrawn';
}

export interface CalScheduleOverride {
  id: string;
  profile_id: string;
  override_date: string;
  is_working: boolean;
  reason: string | null;
  created_by: string;
  created_at: string;
}

/** Computed view model for a single calendar day */
export interface DayStaffing {
  date: string;
  working: {
    profile_id: string;
    full_name: string;
    role: string;
    start_time: string;
    end_time: string;
  }[];
  off: {
    profile_id: string;
    full_name: string;
    reason: string;
  }[];
  providerCount: number;
  hasCoverageGap: boolean;
}

export const TIME_OFF_TYPE_LABELS: Record<TimeOffType, string> = {
  vacation: 'Vacation',
  sick: 'Sick Leave',
  personal: 'Personal',
  cme: 'CME',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
