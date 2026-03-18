import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDownloadSummary() {
  return useMutation({
    mutationFn: async (dateRange: { start: string; end: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(
        `/api/practice-health-summary?start=${dateRange.start}&end=${dateRange.end}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || 'Failed to generate summary');
      }

      // Trigger browser download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')
        ?.match(/filename="(.+)"/)?.[1]
        || `HCI-Executive-Summary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
  });
}

export function useEmailSummary() {
  return useMutation({
    mutationFn: async ({
      dateRange,
      recipients,
    }: {
      dateRange: { start: string; end: string };
      recipients: string[];
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/practice-health-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          start: dateRange.start,
          end: dateRange.end,
          recipients,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || 'Failed to send summary');
      }

      return response.json();
    },
  });
}
