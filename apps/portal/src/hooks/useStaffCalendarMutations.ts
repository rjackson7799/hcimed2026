import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TimeOffRequestFormData } from '@/schemas/timeOffRequestSchema';

// ── Admin: upsert weekly schedule ────────────────────────────

interface UpsertScheduleInput {
  profile_id: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

export function useUpsertSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertScheduleInput) => {
      const { data, error } = await supabase
        .from('cal_staff_schedules')
        .upsert(input, { onConflict: 'profile_id,day_of_week' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-schedules'] });
    },
  });
}

// ── Admin: bulk upsert weekly schedule for a profile ─────────

interface BulkScheduleInput {
  profile_id: string;
  schedules: {
    day_of_week: number;
    is_working: boolean;
    start_time: string;
    end_time: string;
  }[];
}

export function useBulkUpsertSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profile_id, schedules }: BulkScheduleInput) => {
      const rows = schedules.map((s) => ({ profile_id, ...s }));
      const { data, error } = await supabase
        .from('cal_staff_schedules')
        .upsert(rows, { onConflict: 'profile_id,day_of_week' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-schedules'] });
    },
  });
}

// ── Admin: create schedule override ──────────────────────────

interface CreateOverrideInput {
  profile_id: string;
  override_date: string;
  is_working: boolean;
  reason?: string;
  created_by: string;
}

export function useCreateOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOverrideInput) => {
      const { data, error } = await supabase
        .from('cal_schedule_overrides')
        .upsert(input, { onConflict: 'profile_id,override_date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-overrides'] });
    },
  });
}

// ── Any user: submit time-off request ────────────────────────

export function useSubmitTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      requesterId,
      requesterName,
    }: {
      formData: TimeOffRequestFormData;
      requesterId: string;
      requesterName: string;
    }) => {
      // 1. Insert the request
      const { data, error } = await supabase
        .from('cal_time_off_requests')
        .insert({
          requester_id: requesterId,
          start_date: formData.start_date,
          end_date: formData.end_date,
          time_off_type: formData.time_off_type,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Notify approvers via API
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          await fetch('/api/time-off-notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              request_id: data.id,
              requester_name: requesterName,
              start_date: formData.start_date,
              end_date: formData.end_date,
              time_off_type: formData.time_off_type,
              notes: formData.notes || null,
            }),
          });
        } catch (emailErr) {
          // Non-blocking — request is already saved
          console.error('[useSubmitTimeOffRequest] email notification failed:', emailErr);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-time-off'] });
    },
  });
}

// ── User: withdraw pending request ───────────────────────────

export function useWithdrawTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('cal_time_off_requests')
        .update({ status: 'withdrawn' })
        .eq('id', requestId)
        .eq('status', 'pending') // Only withdraw pending requests
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-time-off'] });
    },
  });
}

// ── Admin/Director: approve or deny request ──────────────────

interface ReviewInput {
  requestId: string;
  reviewerType: 'admin' | 'director';
  decision: 'approved' | 'denied';
  reviewerId: string;
  reviewerNotes?: string;
  requesterName: string;
  requesterEmail?: string;
}

export function useReviewTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      const now = new Date().toISOString();
      const updates: Record<string, unknown> = {};

      if (input.reviewerType === 'admin') {
        updates.admin_status = input.decision;
        updates.admin_reviewed_by = input.reviewerId;
        updates.admin_reviewed_at = now;
        updates.admin_notes = input.reviewerNotes || null;
      } else {
        updates.director_status = input.decision;
        updates.director_reviewed_by = input.reviewerId;
        updates.director_reviewed_at = now;
        updates.director_notes = input.reviewerNotes || null;
      }

      const { data, error } = await supabase
        .from('cal_time_off_requests')
        .update(updates)
        .eq('id', input.requestId)
        .select()
        .single();

      if (error) throw error;

      // Notify requester via API
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          await fetch('/api/time-off-decision', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              request_id: input.requestId,
              decision: input.decision,
              reviewer_type: input.reviewerType,
              reviewer_notes: input.reviewerNotes || null,
              requester_name: input.requesterName,
            }),
          });
        } catch (emailErr) {
          console.error('[useReviewTimeOffRequest] email notification failed:', emailErr);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cal-time-off'] });
    },
  });
}
