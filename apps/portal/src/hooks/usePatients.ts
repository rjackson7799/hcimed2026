import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Patient, OutreachStatus } from '@/types';
import { PATIENTS_PAGE_SIZE } from '@/utils/constants';
import type { OutreachPatientFormData } from '@/schemas/outreachPatientSchema';

interface PatientFilters {
  search?: string;
  status?: OutreachStatus;
  page?: number;
}

export function usePatients(projectId: string, filters?: PatientFilters) {
  return useQuery({
    queryKey: ['patients', projectId, filters?.search, filters?.status, filters?.page],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .order('outreach_status', { ascending: true }) // uncalled first
        .order('last_name', { ascending: true });

      if (filters?.status) {
        query = query.eq('outreach_status', filters.status);
      }

      if (filters?.search) {
        const term = `%${filters.search}%`;
        query = query.or(
          `first_name.ilike.${term},last_name.ilike.${term},phone_primary.ilike.${term},member_id.ilike.${term}`
        );
      }

      const page = filters?.page || 0;
      const from = page * PATIENTS_PAGE_SIZE;
      const to = from + PATIENTS_PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        patients: data as Patient[],
        total: count || 0,
        page,
        pageSize: PATIENTS_PAGE_SIZE,
      };
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patientId,
  });
}

export function useAddPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OutreachPatientFormData & { project_id: string }) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);

      try {
        const { data, error } = await supabase
          .from('patients')
          .insert({
            project_id: payload.project_id,
            first_name: payload.first_name,
            last_name: payload.last_name,
            date_of_birth: payload.date_of_birth,
            phone_primary: payload.phone_primary,
            phone_secondary: payload.phone_secondary || null,
            current_insurance: payload.current_insurance || null,
            target_insurance: payload.target_insurance || null,
            member_id: payload.member_id || null,
            import_notes: payload.import_notes || null,
          })
          .select()
          .single()
          .abortSignal(controller.signal);

        if (error) {
          console.error('[AddPatient] Supabase error:', error);
          throw error;
        }
        return data as Patient;
      } catch (err) {
        if (controller.signal.aborted) {
          throw new Error('Request timed out — please check your connection and try again.');
        }
        console.error('[AddPatient] Unexpected error:', err);
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.project_id] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, projectId }: { patientId: string; projectId: string }) => {
      const { error } = await supabase.from('patients').delete().eq('id', patientId);
      if (error) throw error;
      return { patientId, projectId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
    },
  });
}
