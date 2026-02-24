import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import { useAuth } from '@/portal/context/AuthContext';
import type { Project } from '@/portal/types';

/**
 * Fetches projects for the current user.
 * - Admin: all active projects
 * - Staff: only projects they're assigned to
 */
export function useMyProjects() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['my-projects', user?.id, role],
    queryFn: async () => {
      if (role === 'admin') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .in('status', ['active', 'planning'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Project[];
      }

      // Staff: fetch via project_assignments join
      const { data, error } = await supabase
        .from('project_assignments')
        .select('project:project_id(*)')
        .eq('user_id', user!.id);

      if (error) throw error;

      // Extract project objects and filter active ones
      return (data || [])
        .map((d: any) => d.project as Project)
        .filter((p: Project) => p && p.status !== 'archived');
    },
    enabled: !!user,
  });
}
