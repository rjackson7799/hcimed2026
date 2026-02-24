import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { ProjectAssignment } from '@/portal/types';

export function useProjectAssignments(projectId: string) {
  return useQuery({
    queryKey: ['project-assignments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select('*, profiles:user_id(id, full_name, email, role)')
        .eq('project_id', projectId);

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useAssignUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: {
      project_id: string;
      user_id: string;
      role_in_project: 'staff' | 'broker';
      assigned_by: string;
    }) => {
      const { data, error } = await supabase
        .from('project_assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectAssignment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-assignments', variables.project_id] });
    },
  });
}

export function useUnassignUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const { error } = await supabase
        .from('project_assignments')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-assignments', variables.projectId] });
    },
  });
}
