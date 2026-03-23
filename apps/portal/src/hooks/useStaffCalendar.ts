import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type {
  CalStaffScheduleWithProfile,
  CalTimeOffEffective,
  CalScheduleOverride,
  DayStaffing,
} from '@/types/staff-calendar';

// ── Recurring schedules ──────────────────────────────────────

export function useStaffSchedules() {
  return useQuery({
    queryKey: ['cal-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cal_staff_schedules')
        .select('*, profiles(full_name, role, title)')
        .order('profile_id')
        .order('day_of_week');

      if (error) {
        console.error('[useStaffSchedules] query failed:', error.message);
        throw error;
      }
      return data as CalStaffScheduleWithProfile[];
    },
    retry: 1,
  });
}

// ── Time-off requests (via effective view) ───────────────────

export function useTimeOffRequests(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['cal-time-off', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_cal_time_off_effective' as any)
        .select('*')
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .order('start_date');

      if (error) {
        console.error('[useTimeOffRequests] query failed:', error.message);
        throw error;
      }
      return data as CalTimeOffEffective[];
    },
    retry: 1,
    enabled: !!startDate && !!endDate,
  });
}

// ── Current user's requests ──────────────────────────────────

export function useMyTimeOffRequests() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['cal-time-off', 'mine', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('v_cal_time_off_effective' as any)
        .select('*')
        .eq('requester_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useMyTimeOffRequests] query failed:', error.message);
        throw error;
      }
      return data as CalTimeOffEffective[];
    },
    retry: 1,
    enabled: !!profile?.id,
  });
}

// ── Pending approvals (admin / Medical Director) ─────────────

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['cal-time-off', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_cal_time_off_effective' as any)
        .select('*')
        .eq('effective_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[usePendingApprovals] query failed:', error.message);
        throw error;
      }
      return data as CalTimeOffEffective[];
    },
    retry: 1,
  });
}

// ── Schedule overrides ───────────────────────────────────────

export function useScheduleOverrides(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['cal-overrides', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cal_schedule_overrides')
        .select('*')
        .gte('override_date', startDate)
        .lte('override_date', endDate)
        .order('override_date');

      if (error) {
        console.error('[useScheduleOverrides] query failed:', error.message);
        throw error;
      }
      return data as CalScheduleOverride[];
    },
    retry: 1,
    enabled: !!startDate && !!endDate,
  });
}

// ── Computed: calendar staffing for a month ───────────────────

export function useCalendarStaffing(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const schedules = useStaffSchedules();
  const timeOff = useTimeOffRequests(startDate, endDate);
  const overrides = useScheduleOverrides(startDate, endDate);

  const staffing = useMemo(() => {
    if (!schedules.data) return [];

    const days: DayStaffing[] = [];

    // Build a map of profile info from schedules
    const profileMap = new Map<string, { full_name: string; role: string }>();
    for (const s of schedules.data) {
      if (!profileMap.has(s.profile_id)) {
        profileMap.set(s.profile_id, {
          full_name: s.profiles.full_name,
          role: s.profiles.role,
        });
      }
    }

    // Build override map: `profileId:date` → override
    const overrideMap = new Map<string, CalScheduleOverride>();
    for (const o of overrides.data ?? []) {
      overrideMap.set(`${o.profile_id}:${o.override_date}`, o);
    }

    // Build approved time-off set: `profileId:date` → reason
    const timeOffMap = new Map<string, string>();
    for (const t of timeOff.data ?? []) {
      if (t.effective_status !== 'approved') continue;
      const start = new Date(t.start_date + 'T00:00:00');
      const end = new Date(t.end_date + 'T00:00:00');
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        timeOffMap.set(`${t.requester_id}:${dateStr}`, t.time_off_type);
      }
    }

    // Build schedule map: `profileId:dayOfWeek` → schedule
    const scheduleMap = new Map<string, CalStaffScheduleWithProfile>();
    for (const s of schedules.data) {
      scheduleMap.set(`${s.profile_id}:${s.day_of_week}`, s);
    }

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dow = date.getDay();

      const working: DayStaffing['working'] = [];
      const off: DayStaffing['off'] = [];

      for (const [profileId, info] of profileMap) {
        const overrideKey = `${profileId}:${dateStr}`;
        const override = overrideMap.get(overrideKey);
        const schedule = scheduleMap.get(`${profileId}:${dow}`);
        const timeOffReason = timeOffMap.get(overrideKey);

        // Determine if this person is scheduled to work
        let isScheduledToWork = false;
        let startTime = '08:00';
        let endTime = '17:00';

        if (override) {
          isScheduledToWork = override.is_working;
          if (schedule) {
            startTime = schedule.start_time;
            endTime = schedule.end_time;
          }
        } else if (schedule) {
          isScheduledToWork = schedule.is_working;
          startTime = schedule.start_time;
          endTime = schedule.end_time;
        }

        // Check for approved time off
        if (timeOffReason) {
          off.push({ profile_id: profileId, full_name: info.full_name, reason: timeOffReason });
        } else if (isScheduledToWork) {
          working.push({
            profile_id: profileId,
            full_name: info.full_name,
            role: info.role,
            start_time: startTime,
            end_time: endTime,
          });
        }
      }

      const providerCount = working.filter(
        (w) => w.role === 'provider' || w.role === 'admin'
      ).length;

      // Coverage gap = weekday with zero providers
      const isWeekday = dow >= 1 && dow <= 5;
      const hasCoverageGap = isWeekday && providerCount === 0;

      days.push({ date: dateStr, working, off, providerCount, hasCoverageGap });
    }

    return days;
  }, [schedules.data, timeOff.data, overrides.data, year, month, lastDay]);

  return {
    data: staffing,
    isLoading: schedules.isLoading || timeOff.isLoading || overrides.isLoading,
    error: schedules.error || timeOff.error || overrides.error,
  };
}
