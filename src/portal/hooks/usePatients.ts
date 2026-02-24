import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { Patient, OutreachStatus } from '@/portal/types';
import { PATIENTS_PAGE_SIZE } from '@/portal/utils/constants';

interface PatientFilters {
  search?: string;
  status?: OutreachStatus;
  page?: number;
}

export function usePatients(projectId: string, filters?: PatientFilters) {
  return useQuery({
    queryKey: ['patients', projectId, filters],
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
