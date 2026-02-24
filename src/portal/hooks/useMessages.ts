import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { Message } from '@/portal/types';

export function useMessages(patientId: string) {
  return useQuery({
    queryKey: ['messages', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(full_name, role)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as (Message & { profiles: { full_name: string; role: string } | null })[];
    },
    enabled: !!patientId,
    refetchInterval: 30_000, // Poll every 30s for new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: {
      patient_id: string;
      project_id: string;
      sender_id: string;
      body: string;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, userId }: { patientId: string; userId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('patient_id', patientId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: ['unread-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30_000,
  });
}
