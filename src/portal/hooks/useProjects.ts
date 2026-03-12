import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { Project } from '@/portal/types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as Project[];
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Projects request timed out. Please try again.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()
          .abortSignal(controller.signal);

        if (error) throw error;
        return data as Project;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Project request timed out. Please try again.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: {
      name: string;
      description?: string;
      target_start?: string;
      target_end?: string;
      broker_email?: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
