import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';

interface ForwardToBrokerParams {
  patient_id: string;
  project_id: string;
  staff_id: string;
  notes?: string;
}

export function useForwardToBroker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ForwardToBrokerParams) => {
      // 1. Create outreach log with forwarded_to_broker flag
      const { error: logError } = await supabase
        .from('outreach_logs')
        .insert({
          patient_id: params.patient_id,
          project_id: params.project_id,
          staff_id: params.staff_id,
          disposition: 'will_switch',
          notes: params.notes || 'Forwarded to broker',
          call_timestamp: new Date().toISOString(),
          forwarded_to_broker: true,
        });

      if (logError) throw logError;

      // 2. Update patient status to forwarded_to_broker
      const { error: patientError } = await supabase
        .from('patients')
        .update({
          outreach_status: 'forwarded_to_broker',
          forwarded_at: new Date().toISOString(),
          forwarded_by: params.staff_id,
        })
        .eq('id', params.patient_id);

      if (patientError) throw patientError;

      // 3. Call API to send broker email notification
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch('/api/send-broker-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
          },
          body: JSON.stringify({
            patient_id: params.patient_id,
            project_id: params.project_id,
          }),
        });
      } catch {
        // Email failure shouldn't block the forward operation
        console.error('Failed to send broker email notification');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['outreach-logs', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
