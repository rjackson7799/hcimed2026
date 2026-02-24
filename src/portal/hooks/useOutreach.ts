import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { OutreachLog } from '@/portal/types';

export function useOutreachLogs(patientId: string) {
  return useQuery({
    queryKey: ['outreach-logs', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_logs')
        .select('*, profiles:staff_id(full_name)')
        .eq('patient_id', patientId)
        .order('call_timestamp', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useLogOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      patient_id: string;
      project_id: string;
      staff_id: string;
      disposition: string;
      notes?: string;
      forwarded_to_broker?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('outreach_logs')
        .insert({
          ...log,
          call_timestamp: new Date().toISOString(),
          forwarded_to_broker: log.forwarded_to_broker || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as OutreachLog;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['outreach-logs', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.project_id] });
    },
  });
}
