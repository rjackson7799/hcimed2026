import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Project } from '@/types';

interface ProjectAssignmentRow {
  project: Project | null;
}

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      if (role === 'admin') {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .in('status', ['active', 'planning'])
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
      }

      try {
        // Staff: fetch via project_assignments join
        const { data, error } = await supabase
          .from('project_assignments')
          .select('project:project_id(*)')
          .eq('user_id', user!.id)
          .abortSignal(controller.signal);

        if (error) throw error;

        // Extract project objects and filter active ones
        const assignments = (data || []) as ProjectAssignmentRow[];
        return assignments
          .map((row) => row.project)
          .filter((project): project is Project => !!project && project.status !== 'archived');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Projects request timed out. Please try again.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    enabled: !!user,
  });
}
