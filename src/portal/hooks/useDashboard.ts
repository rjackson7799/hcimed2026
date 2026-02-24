import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { ProjectSummary, StaffActivity, DailyCallVolume } from '@/portal/types';

export function useProjectSummary(projectId: string) {
  return useQuery({
    queryKey: ['dashboard', 'project-summary', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_project_summary')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        // View might not exist yet — fallback to manual count
        return computeProjectSummary(projectId);
      }
      return data as ProjectSummary;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

async function computeProjectSummary(projectId: string): Promise<ProjectSummary> {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('outreach_status')
    .eq('project_id', projectId);

  if (error) throw error;

  const statuses = (patients || []).map((p: any) => p.outreach_status);
  const count = (status: string) => statuses.filter((s: string) => s === status).length;

  // Get project name
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single();

  return {
    project_id: projectId,
    project_name: project?.name || '',
    total_patients: statuses.length,
    uncalled: count('not_called'),
    called: statuses.length - count('not_called'),
    will_switch: count('will_switch'),
    not_interested: count('not_interested'),
    needs_more_info: count('needs_more_info'),
    no_answer: count('no_answer'),
    wrong_number: count('wrong_number'),
    forwarded_to_broker: count('forwarded_to_broker'),
    completed: count('completed'),
    unable_to_complete: count('unable_to_complete'),
  };
}

export function useStaffActivity(projectId: string) {
  return useQuery({
    queryKey: ['dashboard', 'staff-activity', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_staff_activity')
        .select('*')
        .eq('project_id', projectId)
        .order('total_calls', { ascending: false });

      if (error) {
        // View might not exist — fallback to empty
        return [] as StaffActivity[];
      }
      return data as StaffActivity[];
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useDailyCallVolume(projectId: string) {
  return useQuery({
    queryKey: ['dashboard', 'daily-call-volume', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_daily_call_volume')
        .select('*')
        .eq('project_id', projectId)
        .order('call_date', { ascending: true });

      if (error) {
        return [] as DailyCallVolume[];
      }
      return data as DailyCallVolume[];
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
