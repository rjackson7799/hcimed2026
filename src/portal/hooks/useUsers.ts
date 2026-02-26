import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/portal/lib/supabase';
import type { Profile } from '@/portal/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useActiveUsers(role?: Profile['role'] | Profile['role'][]) {
  return useQuery({
    queryKey: ['users', 'active', role],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (Array.isArray(role)) {
        query = query.in('role', role);
      } else if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      // Whitelist allowed fields to prevent role/privilege escalation
      const { full_name, phone, company_name, logo_url } = updates as Record<string, unknown>;
      const safeUpdates: Record<string, unknown> = {};
      if (full_name !== undefined) safeUpdates.full_name = full_name;
      if (phone !== undefined) safeUpdates.phone = phone;
      if (company_name !== undefined) safeUpdates.company_name = company_name;
      if (logo_url !== undefined) safeUpdates.logo_url = logo_url;

      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUploadPartnerLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file, companyName }: { userId: string; file: File; companyName?: string }) => {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `${userId}/logo.${ext}`;

      // Upload to partner-logos bucket (upsert to overwrite previous)
      const { error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(path);

      // Update profile with logo URL (and company name if provided)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const updates: Record<string, unknown> = { logo_url: publicUrl };
      if (companyName !== undefined) updates.company_name = companyName;

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/deactivate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deactivate user');
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<Profile[]>(['users']);
      queryClient.setQueryData<Profile[]>(['users'], (old) =>
        old?.map((u) => u.id === userId ? { ...u, is_active: false } : u) ?? []
      );
      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['users'], context.previous);
      }
    },
    // No invalidation on success: the RLS policy (is_active = true) means a refetch
    // would exclude the newly deactivated user, wiping out the optimistic update.
    // The optimistic cache is the correct source of truth until the page reloads.
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }
    },
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<Profile[]>(['users']);
      queryClient.setQueryData<Profile[]>(['users'], (old) =>
        old?.filter((u) => u.id !== userId) ?? []
      );
      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['users'], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; role: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response: Response;
      try {
        response = await fetch('/api/invite-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Failed to invite user';
        try { errorMsg = JSON.parse(text).error || errorMsg; } catch {}
        throw new Error(errorMsg);
      }

      const result = await response.json();

      return result as {
        success: boolean;
        user: { id: string; email: string; full_name: string; role: string };
        temporary_password: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
