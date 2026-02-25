import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { BrokerUpdate } from '@/portal/types';

export function useBrokerUpdates(patientId: string) {
  return useQuery({
    queryKey: ['broker-updates', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broker_updates')
        .select('*, profiles:broker_id(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (BrokerUpdate & { profiles: { full_name: string } | null })[];
    },
    enabled: !!patientId,
  });
}

export function useCreateBrokerUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: {
      patient_id: string;
      project_id: string;
      broker_id: string;
      status: BrokerUpdate['status'];
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('broker_updates')
        .insert(update)
        .select()
        .single();

      if (error) throw error;

      // If completed or unable_to_complete, update patient status too
      if (update.status === 'completed' || update.status === 'unable_to_complete') {
        await supabase
          .from('patients')
          .update({ outreach_status: update.status })
          .eq('id', update.patient_id);
      }

      return data as BrokerUpdate;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['broker-updates', variables.patient_id] });
      const previous = queryClient.getQueryData(['broker-updates', variables.patient_id]);

      // Optimistically add the new update at the top of the list
      queryClient.setQueryData(
        ['broker-updates', variables.patient_id],
        (old: any[] | undefined) => {
          const optimistic = {
            id: `optimistic-${Date.now()}`,
            ...variables,
            created_at: new Date().toISOString(),
            profiles: null,
          };
          return old ? [optimistic, ...old] : [optimistic];
        }
      );

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['broker-updates', variables.patient_id], context.previous);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['broker-updates', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['broker-patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
