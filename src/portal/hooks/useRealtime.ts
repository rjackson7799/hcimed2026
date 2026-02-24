import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';

/**
 * Subscribe to Supabase Realtime changes and invalidate related queries.
 * Call this once at the dashboard level — it will listen for changes on
 * patients, outreach_logs, broker_updates, and messages tables.
 */
export function useRealtime(projectId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['patients', projectId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'project-summary', projectId] });
          queryClient.invalidateQueries({ queryKey: ['broker-patients'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'outreach_logs', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['outreach-logs'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'broker_updates', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['broker-updates'] });
          queryClient.invalidateQueries({ queryKey: ['broker-patients'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
}
