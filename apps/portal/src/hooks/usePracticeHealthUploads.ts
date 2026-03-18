/**
 * Practice Health Uploads Hook — fetches upload history for the history table.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PhUpload } from '@/types/practice-health';

/**
 * Fetch recent practice health uploads, ordered by most recent first.
 */
export function usePracticeHealthUploads(limit = 50) {
  return useQuery({
    queryKey: ['ph-uploads', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ph_uploads')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as PhUpload[];
    },
  });
}
